// Must correspond to the heli firmware
enum PacketType {
	EMPTY = 0x01,
	THROTTLE = 0x02,
	TELEMETRY = 0x03
}

export interface SerializablePacket {
	toBuffer(): Uint8Array;
}

// Must correspond to the sizes on the atmega4808 chip
const PACKET_TYPE_SIZE = 1;
const FLOAT_SIZE = 4;

export class ThrottlePacket implements SerializablePacket {
	private _verticalThrottle: number; // float
	private SIZE = PACKET_TYPE_SIZE + 1 * FLOAT_SIZE;

	constructor(verticalThrottle: number) {
		this._verticalThrottle = verticalThrottle;
	}

	toBuffer(): Uint8Array {
		const buffer = new ArrayBuffer(this.SIZE);
		const view = new DataView(buffer);

		view.setUint8(0, PacketType.THROTTLE);
		view.setFloat32(1, this._verticalThrottle, true);

		return new Uint8Array(buffer);
	}
}