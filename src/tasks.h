#pragma once

#include "states.h"
#include "IStateOwner.h"
#include "altimeter/Altimeter.h"

namespace HeliTasks {
	void oneSecondTask(Altimeter& altimeter);
	void threePerSecondTask(Altimeter& altimeter);
};