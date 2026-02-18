#pragma once

#include <stdint.h>

enum class PacketType : uint8_t {
	EMPTY,
	THROTTLE,
	TELEMETRY
};

struct ThrottlePacket {
	float verticalThrottle;

	static inline constexpr uint8_t SIZE = sizeof(float);
};

struct PacketContainer {
	PacketType type = PacketType::EMPTY;
	union {
		ThrottlePacket throttlePacket;
	} data;
};