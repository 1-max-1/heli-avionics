#include "tasks.h"

#include <Arduino.h>
#include "packets.h"

void HeliTasks::oneSecondTask(Radio& radio) {
	while (radio.packetAvailable()) {
		PacketContainer pkt = radio.read();
		if (pkt.type == PacketType::THROTTLE) {
			Serial.print("Throttle: ");
			Serial.println(pkt.data.throttlePacket.verticalThrottle);
		}
	}
}

void HeliTasks::threePerSecondTask(Altimeter& altimeter) {
	altimeter.updateReading();
}