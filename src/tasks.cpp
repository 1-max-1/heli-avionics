#include "tasks.h"

#include <Arduino.h>

void HeliTasks::oneSecondTask(IStateOwner& stateOwner, HeliState currentState) {
	HeliState newState = currentState == HeliState::FLYING ? HeliState::PAD : HeliState::FLYING;
	stateOwner.swapState(newState);
}

void HeliTasks::threePerSecondTask(HeliState currentState) {
	Serial.print("Current state is: ");
	Serial.println((int)currentState);
}