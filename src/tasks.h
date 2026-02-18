#pragma once

#include "states.h"
#include "IStateOwner.h"
#include "altimeter/Altimeter.h"
#include "Radio.h"

namespace HeliTasks {
	void oneSecondTask(Radio& radio);
	void threePerSecondTask(Altimeter& altimeter);
};