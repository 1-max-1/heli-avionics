#include "Altimeter.h"

#include <Wire.h>

Altimeter::Altimeter() {
	bmp390.intf_ptr = nullptr;
	bmp390.intf = bmp3_intf::BMP3_I2C_INTF;
	bmp390.read = i2cRead;
	bmp390.write = i2cWrite;
	bmp390.delay_us = usDelay;
}

bool Altimeter::init() {
	Wire.begin();

	if (!initializeBmp390())
		return false;

	delay(10);

	const bool success = calculateConversionFactors(outputPeriod);
	if (!success) return false;

	// Clear history
	for (uint8_t i = 0; i < HISTORY_BUF_LEN; i++) {
		altitudeHistory[i] = 0;
	}
	historyIsStable = true;

	return true;
}

bool Altimeter::initializeBmp390() {
	int8_t res = bmp3_init(&bmp390);
	if (res != BMP3_OK) return false;

	bmp3_settings settings = {};
	settings.press_en = TRUE;
	settings.temp_en = TRUE;
	settings.odr_filter.press_os = BMP3_OVERSAMPLING_8X;
	settings.odr_filter.temp_os = BMP3_NO_OVERSAMPLING;
	settings.odr_filter.iir_filter = BMP3_IIR_FILTER_COEFF_3;
	settings.odr_filter.odr = BMP3_ODR_50_HZ;
	// This DEPENDS on the odr value above. If you change the ODR, then update this value accordingly!!!!
	// Note that this includes extra safety time to account for clock jitter, noise etc.
	// e.g. ODR of 50 hz, thats 20ms period so we chose 25ms safe period.
	// The bmp390 datasheet has a table of worst case timings for each odr.
	outputPeriod = 25; // ms
	settings.int_settings.drdy_en = FALSE; // No interrupt, we just rely on timing
	settings.adv_settings.i2c_wdt_en = TRUE;
	settings.adv_settings.i2c_wdt_sel = BMP3_I2C_WDT_SHORT_1_25_MS;

	res = bmp3_set_sensor_settings(BMP3_SEL_ALL, &settings, &bmp390);
	if (res != BMP3_OK) return false;

	settings.op_mode = BMP3_MODE_NORMAL;
	res = bmp3_set_op_mode(&settings, &bmp390);
	return (res == BMP3_OK);
}

bool Altimeter::calculateConversionFactors(const uint32_t measurementDelay) {
	bmp3_data data {};

	// Take several readings and average to reduce noise

	float tempSum = 0;
	float pressSum = 0;
	constexpr uint8_t numReadings = 5;
	for(int i = 0; i < numReadings; i++) {
		// Delay first to wait for the first measurement, then read data.
		delay(measurementDelay);
		const int8_t res = bmp3_get_sensor_data(BMP3_PRESS_TEMP, &data, &bmp390);
		if (res != BMP3_OK) return false;

		tempSum += data.temperature;
		pressSum += data.pressure;
	}

	groundPressure = pressSum / (float)numReadings;
	const float groundTempKelvin = (tempSum / (float)numReadings) + 273.15f;

	// Calculate the slope: (R * T) / (g * P)
	// R / g is a constant: 287.05 / 9.80665 = 29.271
	metersPerPascal = (29.271f * groundTempKelvin) / groundPressure;

	return true;
}

float Altimeter::getAltitude() const {
	return currentAltitude;
}

bool Altimeter::isStable() const {
	return historyIsStable;
}

void Altimeter::updateReading() {
	bmp3_data data {};
	const int8_t res = bmp3_get_sensor_data(BMP3_PRESS, &data, &bmp390);
	if (res == BMP3_OK) {
		currentAltitude = (groundPressure - data.pressure) * metersPerPascal;
		altitudeHistory[historyIndex] = currentAltitude;
		historyIndex++;
		if (historyIndex == HISTORY_BUF_LEN)
			historyIndex = 0;
		historyIsStable = checkStability();
	}
}

bool Altimeter::checkStability() const {
	float min = altitudeHistory[0];
	float max = altitudeHistory[0];
	for (uint8_t i = 1; i < HISTORY_BUF_LEN; i++) {
		const float alt = altitudeHistory[i];
		if (alt < min)
			min = alt;
		else if (alt > max)
			max = alt;
	} 

	constexpr float STABILITY_THRESHOLD = 0.22f; // meters
	return (max - min) <= STABILITY_THRESHOLD;
}

void Altimeter::tare() {
	const float oldGroundPressure = groundPressure;
	const float oldMetersPerPascal = metersPerPascal;
	const bool success = calculateConversionFactors(outputPeriod);
	if (!success) return;

	// Update altitude history to be relative to the new reference pressure.
	for (uint8_t i = 1; i < HISTORY_BUF_LEN; i++) {
		altitudeHistory[i] = metersPerPascal * (groundPressure - oldGroundPressure + (altitudeHistory[i] / oldMetersPerPascal));
	}
}

bool Altimeter::checkChipStatus() {
	uint8_t reg_data;
	int8_t res = bmp3_get_regs(BMP3_REG_ERR, &reg_data, 1, &bmp390);
	if (res != BMP3_OK) return false;

	// lowkenuinely Should always be opreating in normal mode. And not have fatal err

	const bool fatalErr = reg_data & BMP3_ERR_FATAL;
	if (!fatalErr) {
		uint8_t opMode;
		res = bmp3_get_op_mode(&opMode, &bmp390);
		if (res != BMP3_OK) return false;

		return opMode == BMP3_MODE_NORMAL;
	}
	else
		return false;
}

int8_t Altimeter::i2cWrite(uint8_t reg, const uint8_t* data, uint32_t len, void* intf) {
	if (!data) return BMP3_E_NULL_PTR;
	if (len == 0) return BMP3_E_INVALID_LEN;

	Wire.beginTransmission(i2cAddress);

	if (Wire.write(reg) != 1)
		return BMP3_E_COMM_FAIL;
	if (Wire.write(data, len) != len)
		return BMP3_E_COMM_FAIL;

	Wire.endTransmission();
	return BMP3_OK;
}

int8_t Altimeter::i2cRead(uint8_t reg, uint8_t* data, uint32_t len, void* intf) {
	if (!data) return BMP3_E_NULL_PTR;
	if (len == 0) return BMP3_E_INVALID_LEN;

	Wire.beginTransmission(i2cAddress);
	if (Wire.write(reg) != 1)
		return BMP3_E_COMM_FAIL;
	Wire.endTransmission(false);

	if (Wire.requestFrom(i2cAddress, (size_t)len) != len)
		return BMP3_E_COMM_FAIL;

	for (size_t i = 0; i < len; i++) {
		data[i] = Wire.read();
	}
	
	return BMP3_OK;
}

void Altimeter::usDelay(uint32_t period, void* intf) {
	(void)intf; // Unused
	delayMicroseconds(period);
}