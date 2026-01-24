#pragma once

#include <stdint.h>

#include "states.h"
#include "IStateOwner.h"

// Main program class, contains state variables and task scheduling
class FlightController : public IStateOwner {
public:
	void setup();
	void loop();
	void swapState(HeliState newState) override;

private:
	void oneSecondTaskAdapter();
	void threePerSecondTaskAdapter();

	// Converts Hz to microseconds period
	inline constexpr uint32_t HZ(uint32_t frequency) {
		return (frequency == 0) ? 0 : (1000000UL / frequency);
	}

	struct Task {
		const uint32_t stateMask; // Bitwise OR of allowed states where this task can run
		uint32_t timeOfLastExecution; // In microseconds
		const uint32_t period; // In microseconds, time between start of executions
		void (FlightController::*execute)(); // Task adapter function, will be a FlightController member function
	};

	Task tasks[2] = {
		{HeliState::PAD | HeliState::FLYING, 0, HZ(1), &FlightController::oneSecondTaskAdapter},
		{HeliState::PAD | HeliState::FLYING, 0, HZ(3), &FlightController::threePerSecondTaskAdapter}
	};

	HeliState currentState = HeliState::PAD;
};