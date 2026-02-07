#include "tasks.h"

#include <Arduino.h>

void HeliTasks::oneSecondTask(Altimeter& altimeter) {
	Serial.print("Altimeter reading: ");
	Serial.print(altimeter.getAltitude());
	Serial.print("    Stable: ");
	Serial.println(altimeter.isStable());

	if (Serial.available()) {
		while (Serial.available())
			Serial.read();
		Serial.println("taring");
		altimeter.tare();
	}
}

void HeliTasks::threePerSecondTask(Altimeter& altimeter) {
	altimeter.updateReading();
}