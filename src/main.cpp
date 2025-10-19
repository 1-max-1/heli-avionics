#include <Arduino.h>
#include <Wire.h>
#include <SPI.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP3XX.h>
#include <RF24.h>
#include <printf.h>

#define SEALEVELPRESSURE_HPA (1033)

Adafruit_BMP3XX bmp;

#define BATT_DIVIDER_EN PIN_PD1
#define BATT_DIVIDER PIN_PD2

#define TOP_PROP_MODE PIN_PF1
#define TOP_PROP_PWM PIN_PF2
#define BOTTOM_PROP_MODE PIN_PD6
#define BOTTOM_PROP_PWM PIN_PD7
#define REAR_PROP_PWM1 PIN_PF3
#define REAR_PROP_PWM2 PIN_PF4

#define NRF24_CE PIN_PD0
#define NRF24_CS PIN_PC3
RF24 radio(NRF24_CE, NRF24_CS);

const byte* txAddress = (const byte*)"aviTX";
const byte* rxAddress = (const byte*)"aviRX";

void setupMotorDrivers();

void tailMotor(uint8_t val, bool forward) {
	register8_t& compareRegister = forward ? TCA0.SPLIT.HCMP0 : TCA0.SPLIT.HCMP1;
	register8_t& otherRegister = !forward ? TCA0.SPLIT.HCMP0 : TCA0.SPLIT.HCMP1;
	otherRegister = 0;
	compareRegister = val;
}

void topMotor(uint8_t val) {
	TCA0.SPLIT.LCMP2 = val;
}

void bottomMotor(uint8_t val) {
	TCA0.SPLIT.LCMP0 = val;
}

unsigned long timeOfLastSend = 0;

void setup() {
	pinMode(BATT_DIVIDER_EN, OUTPUT);
	digitalWrite(BATT_DIVIDER_EN, HIGH);
	delay(100);
	pinMode(BATT_DIVIDER, INPUT);

	Serial.begin(9600);
	printf_begin();

	pinMode(LED_BUILTIN, OUTPUT);
	digitalWrite(LED_BUILTIN, HIGH);

	if (!bmp.begin_I2C()) {
		Serial.println("Could not find a valid BMP3 sensor, check wiring!");
		while (1);
	}

	// Set up oversampling and filter initialization
	bmp.setTemperatureOversampling(BMP3_OVERSAMPLING_8X);
	bmp.setPressureOversampling(BMP3_OVERSAMPLING_4X);
	bmp.setIIRFilterCoeff(BMP3_IIR_FILTER_COEFF_3);
	bmp.setOutputDataRate(BMP3_ODR_50_HZ);

	pinMode(TOP_PROP_MODE, INPUT);
	pinMode(TOP_PROP_PWM, OUTPUT);
	pinMode(BOTTOM_PROP_MODE, INPUT);
	pinMode(BOTTOM_PROP_PWM, OUTPUT);
	pinMode(REAR_PROP_PWM1, OUTPUT);
	pinMode(REAR_PROP_PWM2, OUTPUT);
	pinMode(PIN_PF0, OUTPUT);

	setupMotorDrivers();

	// Bring motor drivers out of sleep mode
	digitalWriteFast(REAR_PROP_PWM1, HIGH);
	digitalWriteFast(REAR_PROP_PWM2, HIGH);
	digitalWriteFast(TOP_PROP_PWM, HIGH);
	digitalWriteFast(PIN_PF0, HIGH);
	delay(1);
	// Enable PWM output on motor GPIOs
	TCA0.SPLIT.CTRLB = TCA_SPLIT_HCMP0EN_bm | TCA_SPLIT_HCMP1EN_bm | TCA_SPLIT_LCMP2EN_bm | TCA_SPLIT_LCMP0EN_bm;

	topMotor(200);
	bottomMotor(200);
	
	//tailMotor(200, false);
	// TODO: modify tailmotor() to use brake mode instead of coast mode, as this fixes that motor speed issue.
	// These 3 lines do PWM with brake mode
	TCA0.SPLIT.CTRLB &= ~TCA_SPLIT_HCMP0EN_bm;
	digitalWriteFast(REAR_PROP_PWM1, HIGH);
	TCA0.SPLIT.HCMP1 = 50;

	SPI.swap(1);
	if (!radio.begin()) {
		Serial.println("Failed to start radio!");
		while (true) ;
	}
	radio.openWritingPipe(txAddress);
	radio.openReadingPipe(1, rxAddress);
	radio.setPALevel(RF24_PA_MAX);
	radio.startListening();
}

void setupMotorDrivers() {
	// Will set PWM frequency to 31.25 kHz.
	// Note: clock divider will be 2 and TCA0 is setup in 8-bit split mode
	analogWriteFrequency(32);

	// Set max (TOP) value back to 255, so we can get up to 99.6% duty cycle.
	// By default it is set to 254 which causes a bug: when we write 255 to the compare register, the PWM output completely dissapears because now a match and toggle never happens.
	TCA0.SPLIT.LPER = TCA0.SPLIT.HPER = 255;

	PORTMUX.TCAROUTEA = PORTMUX_TCA0_PORTF_gc; // Re-reoute TCA0 to PORTF
	// Set TCA0 compare value to zero for now so there is no output
	TCA0.SPLIT.LCMP0 = TCA0.SPLIT.LCMP1 = TCA0.SPLIT.LCMP2 = TCA0.SPLIT.HCMP0 = TCA0.SPLIT.HCMP1 = TCA0.SPLIT.HCMP2 = 0;

	// I accidentally wired the bottom motor to PD7, but that isnt connected to TCA0.
	// So actually we use TCA0 on PF0 as normal but then reroute through the event system peripheral back to PD7.

	// Route PF0 state onto event channel 5
	EVSYS.CHANNEL5 = EVSYS_GENERATOR_PORT1_PIN0_gc;
	// Connect event output D pin to channel 5
	EVSYS.USEREVOUTD = EVSYS_CHANNEL_CHANNEL5_gc;
	// Reroute event output D pin to PD7
	PORTMUX.EVSYSROUTEA |= PORTMUX_EVOUT3_bm;
}

float getVoltage() {
	return (float)(analogRead(BATT_DIVIDER) * 2) * 2.998f / 1023.0f;
}

/*void loop() {
	if (! bmp.performReading()) {
		Serial.println("Failed to perform reading :(");
		return;
	}
	Serial.print("Temperature = ");
	Serial.print(bmp.temperature);
	Serial.println(" *C");

	Serial.print("Pressure = ");
	Serial.print(bmp.pressure / 100.0);
	Serial.println(" hPa");

	Serial.print("Approx. Altitude = ");
	Serial.print(bmp.readAltitude(SEALEVELPRESSURE_HPA));
	Serial.println(" m");

	Serial.println();
	delay(2000);
}*/

unsigned long lastToggle = 0;
bool lastState = 0;

void loop() {
	if (radio.available()) {
    char buf[7];
    radio.read(buf, 7);
    Serial.println(buf);
	//radio.printPrettyDetails();
  }

  delay(10);
}