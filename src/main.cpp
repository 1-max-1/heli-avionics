#include <Arduino.h>

#define BATT_DIVIDER_EN PIN_PD1
#define BATT_DIVIDER PIN_PD2

void setup() {
	pinMode(BATT_DIVIDER_EN, OUTPUT);
	//digitalWrite(BATT_DIVIDER_EN, HIGH);
	delay(100);
	pinMode(BATT_DIVIDER, INPUT);

	Serial.begin(9600);

	pinMode(LED_BUILTIN, OUTPUT);
	digitalWrite(LED_BUILTIN, HIGH);
}

float getVoltage() {
	return (float)(analogRead(BATT_DIVIDER) * 2) * 2.998f / 1023.0f;
}

void loop() {
	/*digitalWrite(LED_BUILTIN, HIGH);
	delay(1000);
	digitalWrite(LED_BUILTIN, LOW);
	delay(1000);*/

	digitalWrite(BATT_DIVIDER_EN, HIGH);
	delay(10);
	Serial.println(getVoltage());

	delay(1000);

	digitalWrite(BATT_DIVIDER_EN, LOW);
	delay(10);
	Serial.println(getVoltage());
	Serial.println();

	delay(1000);
}