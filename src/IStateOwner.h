#pragma once

#include "states.h"

// Interface for classes that own a state and can swap between states
class IStateOwner {
public:
	virtual void swapState(HeliState newState) = 0;
	virtual ~IStateOwner() = default;
};