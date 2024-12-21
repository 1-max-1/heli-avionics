#include <Arduino.h>

void setup() {
	pinMode(PIN_PC0, OUTPUT);
}

void loop() {
	digitalWrite(PIN_PC0, HIGH);
	delay(1000);
	digitalWrite(PIN_PC0, LOW);
	delay(400);
}