#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP3XX.h>

#define BMP_SCK 13
#define BMP_MISO 12
#define BMP_MOSI 11
#define BMP_CS 10

#define SEALEVELPRESSURE_HPA (1033)

Adafruit_BMP3XX bmp;

#define BATT_DIVIDER_EN PIN_PD1
#define BATT_DIVIDER PIN_PD2

void setup() {
	pinMode(BATT_DIVIDER_EN, OUTPUT);
	digitalWrite(BATT_DIVIDER_EN, HIGH);
	delay(100);
	pinMode(BATT_DIVIDER, INPUT);

	Serial.begin(9600);

	pinMode(LED_BUILTIN, OUTPUT);
	digitalWrite(LED_BUILTIN, HIGH);

	if (!bmp.begin_I2C()) {   // hardware I2C mode, can pass in address & alt Wire
		Serial.println("Could not find a valid BMP3 sensor, check wiring!");
		while (1);
	}

	// Set up oversampling and filter initialization
	bmp.setTemperatureOversampling(BMP3_OVERSAMPLING_8X);
	bmp.setPressureOversampling(BMP3_OVERSAMPLING_4X);
	bmp.setIIRFilterCoeff(BMP3_IIR_FILTER_COEFF_3);
	bmp.setOutputDataRate(BMP3_ODR_50_HZ);
}

float getVoltage() {
	return (float)(analogRead(BATT_DIVIDER) * 2) * 2.998f / 1023.0f;
}

void loop() {
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
}