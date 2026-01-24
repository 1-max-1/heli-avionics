#pragma once

#include "states.h"
#include "IStateOwner.h"

namespace HeliTasks {
	void oneSecondTask(IStateOwner& stateOwner, HeliState currentState);
	void threePerSecondTask(HeliState currentState);
};