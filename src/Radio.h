#pragma once

#include <RF24.h>
#include "packets.h"

class Radio {
public:
	Radio();
	bool init();
	void testing();
	void attachToInterrupt();
	PacketContainer read();
	bool packetAvailable();

private:
	RF24 nrf24;

	static Radio& interruptInstance;
	static void radioISR();

	/*
	There are certain cases where we dont want to increment the counter in the ISR.
	This includes radio bootup and flushing FIFO's due to bad data.
	We don't want to get into a situation where the counter has incrementedd but there is actually no data in the FIFO.
	*/
	static volatile inline bool isrEnabled = false;
	static volatile inline uint8_t irqCount = 0;
};