#include "Radio.h"
#include <SPI.h>

namespace {
	constexpr rf24_gpio_pin_t cePin = PIN_PD0;
	constexpr rf24_gpio_pin_t csPin = PIN_PC3;
	constexpr rf24_gpio_pin_t irqPin = PIN_PA6;

	// Addresses chosen not to conflict with preamble, and to have more than one level change
	// https://maniacalbits.blogspot.com/2013/04/rf24-addressing-nrf24l01-radios-require.html
	constexpr uint8_t addressWidth = 5;
	const uint8_t txAddress[addressWidth] = { 0xf5, 0xd4, 0xba, 0x5c, 0x61 }; // Address of dispatcher
	const uint8_t rxAddress[addressWidth] = { 0xf5, 0xc5, 0x1e, 0x9c, 0x2d }; // Address of heli radio reading pipe
}

Radio::Radio() : nrf24(cePin, csPin) {}

bool Radio::init() {
	Radio::isrEnabled = false;
	pinMode(irqPin, INPUT);
	attachToInterrupt();

	SPI.swap(1); // Radio is connected to secondary SPI pins

	// This will also initialize the SPI bus
	if (!nrf24.begin())
		return false;

	//nrf24.setAddressWidth(addressWidth);
	//nrf24.setChannel(40); // TODO: use channel with lowest traffic in my area
	nrf24.setPALevel(rf24_pa_dbm_e::RF24_PA_MAX);
	//nrf24.enableDynamicPayloads();
	//nrf24.enableDynamicAck();
	//nrf24.disableAckPayload();
	//nrf24.setAutoAck(true);
	//nrf24.setRetries(0, 5);
	//nrf24.setCRCLength(rf24_crclength_e::RF24_CRC_8);

	//const bool success = nrf24.setDataRate(rf24_datarate_e::RF24_1MBPS); // only 1mpbs but we get better signal strength
	//if (!success)
	//	return false;

	// Initial one time setup of transmit address so we can save on SPI traffic later
	nrf24.stopListening(txAddress);

	// NOTE: most of radio time is spent in receive mode

	nrf24.openReadingPipe(1, (uint8_t*)"aviRX");
	nrf24.startListening();

	Radio::isrEnabled = true;
}

void Radio::testing() {
	Serial.print("size: ");
	Serial.println();

	/*Serial.print("IRQ count: ");
	Serial.print(Radio::irqCount);
	Serial.print("   Available: ");
	bool yes = nrf24.available();
	Serial.println(yes);
	nrf24.read*/

	/*if (yes) {
		char buf[7];
		nrf24.read(buf, 7);
		Serial.println(buf);
	}*/
}

bool getIncomingPacketType(uint8_t rawTypeCode, PacketType& out) {
	PacketType incoming = static_cast<PacketType>(rawTypeCode);
	switch (incoming) {
		// Add all valid incoming types here
		case PacketType::THROTTLE:
			out = incoming;
			return true;
		default:
			Serial.println("INVALID PACKET");
			return false;
	}
}

bool validIncomingPacketLen(uint8_t len, PacketType type) {
	// Incoming data also contains packet type field
	if (len < sizeof(PacketType))
		return false;
	len -= sizeof(PacketType);

	switch (type) {
		case PacketType::THROTTLE:
			return len == ThrottlePacket::SIZE;
		default:
			return false;
	}
}

PacketContainer Radio::read() {
	uint8_t packetLen = nrf24.getDynamicPayloadSize();
	if (packetLen == 0) return; // Corrupt or missing packet
	uint8_t* buf = new uint8_t[packetLen];
	nrf24.read(buf, packetLen);

	PacketContainer packet { .type = PacketType::EMPTY };
	if (!getIncomingPacketType(buf[0], packet.type))
		return packet; // empty
	if (!validIncomingPacketLen(packetLen, packet.type))
		return packet; // empty

	// No default case here (invalid type) since that should have already bene handled by getIncomingPacketType()

	switch (packet.type) {
		case PacketType::THROTTLE:
			ThrottlePacket data {};
			memcpy(&data.verticalThrottle, buf, sizeof(float));
			packet.data.throttlePacket = data;
			break;
	}

	return packet;
}

bool Radio::packetAvailable() {
	const rf24_fifo_state_e fifo = nrf24.isFifo(false);
	return (fifo == rf24_fifo_state_e::RF24_FIFO_FULL || fifo == rf24_fifo_state_e::RF24_FIFO_OCCUPIED);
}

void Radio::attachToInterrupt() {
	//interruptInstance = *this;
	attachInterrupt(irqPin, radioISR, FALLING);
}

void Radio::radioISR() {
	if (Radio::isrEnabled)
		Radio::irqCount++;
}