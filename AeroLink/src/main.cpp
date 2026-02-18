#include <Arduino.h>
#include <NimBLEDevice.h>
#include <RF24.h>
#include <string>

constexpr const char* SERVICE_UUID = "aff07927-a273-4b20-bb24-09962b9f950f";
constexpr const char* THROTTLE_CHAR_UUID = "56ce2749-1034-4cc3-8aa5-923399a45243";
constexpr const char* TELEMETRY_CHAR_UUID = "e74ac0ce-8e5b-43c2-bff4-f79bc7557d0d";

constexpr rf24_gpio_pin_t cePin = 21;
constexpr rf24_gpio_pin_t csPin = 5;
//constexpr rf24_gpio_pin_t irqPin = PIN_PA6;

// Addresses chosen not to conflict with preamble, and to have more than one level change
// https://maniacalbits.blogspot.com/2013/04/rf24-addressing-nrf24l01-radios-require.html
constexpr uint8_t addressWidth = 5;
const uint8_t rxAddress[addressWidth] = { 0xf5, 0xd4, 0xba, 0x5c, 0x61 }; // Address of dispatcher
const uint8_t txAddress[addressWidth] = { 0xf5, 0xc5, 0x1e, 0x9c, 0x2d }; // Address of heli radio reading pipe

class CharacteristicCallbacks : public NimBLECharacteristicCallbacks {
	void onWrite(NimBLECharacteristic* pCharacteristic, NimBLEConnInfo& conn) override {
		NimBLEAttValue value = pCharacteristic->getValue();

		if (value.length() > 0) {
			/*radio.stopListening();
			radio.write(value.data(), value.length(), true);
			radio.startListening();*/
			Serial.print("Received some data: ");
			Serial.println(value.c_str());
		}
	}
};

RF24 radio(cePin, csPin);
NimBLECharacteristic* telemetryChar;

bool initBLE() {
	NimBLEDevice::init("AeroLink");
	//NimBLEDevice::setPower(ESP_PWR_LVL_P9);  // Max power

	NimBLEServer* server = NimBLEDevice::createServer();
	NimBLEService* aeroLinkService = server->createService(SERVICE_UUID);

	NimBLECharacteristic* throttleChar = aeroLinkService->createCharacteristic(THROTTLE_CHAR_UUID, NIMBLE_PROPERTY::WRITE_NR);
	throttleChar->setCallbacks(new CharacteristicCallbacks());

	telemetryChar = aeroLinkService->createCharacteristic(TELEMETRY_CHAR_UUID, NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY);
	
	if (!aeroLinkService->start())
		return false;
	
	NimBLEAdvertising* pAdvertising = NimBLEDevice::getAdvertising();
	if (!pAdvertising->addServiceUUID(SERVICE_UUID))
		return false;
	if (!pAdvertising->setName("AeroLink"))
		return false;
	if (!pAdvertising->start())
		return false;

	return true;
}

bool initRadio() {
	// This will also initialize the SPI bus
	if (!radio.begin())
		return false;

	radio.setAddressWidth(addressWidth);
	//radio.setChannel(40); // TODO: use channel with lowest traffic in my area
	radio.setPALevel(rf24_pa_dbm_e::RF24_PA_LOW);
	radio.enableDynamicPayloads();
	radio.enableDynamicAck();
	radio.disableAckPayload();
	radio.setAutoAck(true);
	radio.setRetries(0, 5);
	radio.setCRCLength(rf24_crclength_e::RF24_CRC_8);

	const bool success = radio.setDataRate(rf24_datarate_e::RF24_1MBPS); // only 1mpbs but we get better signal strength
	if (!success)
		return false;

	// Initial one time setup of transmit address so we can save on SPI traffic later
	radio.stopListening(txAddress);

	// NOTE: most of radio time is spent in receive mode

	radio.openReadingPipe(1, rxAddress);
	radio.startListening();
	return true;
}

void setup() {
	Serial.begin(115200);

	bool success = initBLE();
	
	//initRadio();
}

unsigned long last = 0;

void loop() {
	delay(10);

	unsigned long now = millis();
	if (now - last >= 800) {
		telemetryChar->setValue(std::to_string(now));
		telemetryChar->notify();
		last = now;
	}
}