#pragma once

#include <stdint.h>

// States must be powers of 2 so we can create masks
// Must not exceed 32 states

enum class HeliState : uint32_t {
	PAD = 1,
	FLYING = 2,
	EMERGENCY = 4
};

inline uint32_t operator|(HeliState a, HeliState b) {
	return static_cast<uint32_t>(a) | static_cast<uint32_t>(b);
}

// For chaining
inline uint32_t operator|(uint32_t a, HeliState b) {
	return a | static_cast<uint32_t>(b);
}