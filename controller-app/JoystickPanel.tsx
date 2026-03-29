import { AxisPad, AxisPadTouchEvent } from '@fustaro/react-native-axis-pad';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, View } from 'react-native';
import { useEffect, useRef } from 'react';
import ControlButtonPanel from './ControlButtonPanel';
import { ThrottlePacket } from './packets';
import { useBLE } from './BLEProvider';

export default function JoystickPanel() {
	let dataInterval = useRef<NodeJS.Timeout | undefined>(undefined);
	let verticalThrottle = useRef(1);
	let { sendPacket } = useBLE();

	useEffect(() => {
		dataInterval.current = setInterval(sendData, 1000);
		return () => {
			clearInterval(dataInterval.current);
			dataInterval.current = undefined;
		};
	}, []);

	async function sendData() {
		//console.log("Sending data now");
		console.log(`y: ${verticalThrottle.current}`);
		let packet = new ThrottlePacket(verticalThrottle.current);
		let result = await sendPacket(packet);
	}

	function throttleTouchEvent(event: AxisPadTouchEvent) {
		if (event.eventType == "pan") {
			verticalThrottle.current = event.ratio.y;
		}
	}

	return (
		<View style={styles.bottomRow}>
			<GestureHandlerRootView style={styles.noFlex}>
				<AxisPad id="throttle-pad" size={185} controlSize={70} onTouchEvent={throttleTouchEvent} disableX={true} resetOnRelease={false} initialY={1} controlStyle={styles.control} padBackgroundStyle={styles.background} />
			</GestureHandlerRootView>
			
			<ControlButtonPanel />

			<GestureHandlerRootView style={styles.noFlex}>
				<AxisPad id="directional-pad" size={170} controlSize={70} onTouchEvent={() => 1} controlStyle={styles.control} padBackgroundStyle={styles.background} />
			</GestureHandlerRootView>
		</View>
	);
}

const styles = StyleSheet.create({
	noFlex: {
		flex: 0
	},
	bottomRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-end',
		paddingLeft: 25,
		paddingBottom: 25,
		paddingRight: 25
	},
	control: {
		backgroundColor: "#50d8d7"
	},
	background: {
		backgroundColor: "#00000000",
		borderColor: "#eeeeee",
		borderWidth: 2
	}
});