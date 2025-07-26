#include <Arduino.h>

#define BATT_DIVIDER_EN PIN_PD1
#define BATT_DIVIDER PIN_PD0

void setup() {
	pinMode(PIN_PC0, OUTPUT);
	pinMode(BATT_DIVIDER_EN, OUTPUT);
	digitalWrite(BATT_DIVIDER_EN, LOW);
	pinMode(BATT_DIVIDER, INPUT);

	Serial.begin(9600);
}

void loop() {
	digitalWrite(LED_BUILTIN, HIGH);
	delay(1000);

	digitalWrite(BATT_DIVIDER_EN, HIGH);
	delay(10);
	Serial.println(analogRead(BATT_DIVIDER));

	digitalWrite(LED_BUILTIN, LOW);
	delay(1000);

	digitalWrite(BATT_DIVIDER_EN, LOW);
	delay(10);
	Serial.println(analogRead(BATT_DIVIDER));
	Serial.println();
}