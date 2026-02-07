#include "FlightController.h"
#include "tasks.h"
#include <Arduino.h>

void FlightController::setup() {
	Serial.begin(9600);
	Serial.println("Hello there");
	Serial.println((unsigned long)sizeof(unsigned int));
	Serial.println((unsigned long)sizeof(unsigned long));
	Serial.println((unsigned long)sizeof(unsigned long long));
	Serial.println((unsigned long)sizeof(uint16_t));
	Serial.println((unsigned long)sizeof(uint32_t));
	Serial.println((unsigned long)sizeof(int32_t));

	altimeter.init();
}

void FlightController::loop() {
	const uint32_t curTime = micros();

	// Time triggered scheduling, and only running the task if the current state allows it
	for (Task& task : tasks) {
		if ((task.stateMask & static_cast<uint32_t>(currentState)) == 0)
			continue;

		if (curTime - task.timeOfLastExecution > task.period) {
			task.timeOfLastExecution = curTime;
			(this->*task.execute)();
		}
	}
}

void FlightController::swapState(HeliState newState) {
	currentState = newState;
}

void FlightController::oneSecondTaskAdapter() {
	HeliTasks::oneSecondTask(altimeter);
}

void FlightController::threePerSecondTaskAdapter() {
	HeliTasks::threePerSecondTask(altimeter);
}