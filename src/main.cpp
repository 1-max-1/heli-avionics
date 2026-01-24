#include <Arduino.h> // This file ensures extern "C" for setup() and loop() so arduino entry point can find them
#include "FlightController.h"

FlightController controller = FlightController();

void setup() {
	controller.setup();
}

void loop() {
	controller.loop();
}