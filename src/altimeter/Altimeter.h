#pragma once

#include <stdbool.h>
#include "bosch/bmp3.h"

// Wrapper around bmp390.
// Converts pressure readings to altitudes and tracks history to determine vertical rate of change.
class Altimeter {
public:
	Altimeter();

	// Initialize BMP390, configure settings.
	// Will also perform several initial measurements to calculate conversion factors.
	// Returns false if failed
	bool init();

	// Gets the latest pressure reading from the BMP390, stores into internal state
	void updateReading();
	float getAltitude() const;

	// True if recent altitude readings have been steady within tolerance (i.e. not going up or down)
	bool isStable() const;

	// Repeats calibration to calculate conversion factors, using current altitude as the zero reference.
	// Probably don't call during fast control loop since this function has delay()'s.
	void tare();

	// Returns true if all good, false if BMP390 has FATAL_ERR
	bool checkChipStatus();

private:
	bmp3_dev bmp390 = {};
	
	// Safe time in ms to wait between pressure data updates.
	// MUST be manually set in initialization (depending on bmp390 ODR setting) since other code depends on it.
	uint32_t outputPeriod;

	// Calibration/conversion factors for pressure -> altitude
	float metersPerPascal = 0;
	float groundPressure = 0;

	static constexpr uint8_t HISTORY_BUF_LEN = 6;
	float altitudeHistory[HISTORY_BUF_LEN] = { 0.f }; // Circular buffer
	uint8_t historyIndex = 0;
	bool historyIsStable = false; // For isStable()
	float currentAltitude = 0;

	// True if history buffer has been steady within tolerance (i.e. not going up or down on average)
	bool checkStability() const;
	bool initializeBmp390(); // Returns false if failed

	// Will take several readings to calculate conversion factors.
	// Uses delay() to pause for the specified interval between each measurement.
	// Useful since the bmp390 cannot measure instantly.
	// Returns false if failed.
	bool calculateConversionFactors(const uint32_t measurementDelay);

	/* i2c HAL required for bosch BMP390 library */

	static constexpr uint8_t i2cAddress = BMP3_ADDR_I2C_SEC;
	static int8_t i2cWrite(uint8_t reg, const uint8_t* data, uint32_t len, void* intf);
	static int8_t i2cRead(uint8_t reg, uint8_t* data, uint32_t len, void* intf);
	static void usDelay(uint32_t period, void* intf);

	/* ------------------------------------------ */
};