import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BLEProvider } from './BLEProvider';
import JoystickPanel from './JoystickPanel';
import TelemetryPanel from './TelemetryPanel';
import TrimControlPanel from './TrimControlPanel';

export default function App() {
	return (
		<SafeAreaView style={styles.container}>
			<StatusBar hidden />
			
			<BLEProvider>
				<View style={styles.topRow}>
					<TelemetryPanel />
					<TrimControlPanel />

					{/* Placeholder to avoid the TelemetryPanel from growing underneath the TrimControlPanel button. */}
					{/* This happens because TrimControlPanel uses absolute positioning, which is what we want when the drawer is open. */}
					{/* But we don't want it when the drawer is closed. */}
					<View style={{ width: 100 }} />
				</View>

				<JoystickPanel />
			</BLEProvider>

		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#121214',
		justifyContent: 'space-between'
	},
	topRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		paddingLeft: 15,
		paddingTop: 0
	}
});