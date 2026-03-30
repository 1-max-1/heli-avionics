import { Linking, Platform, View, Text, Pressable, StyleSheet } from 'react-native';

export const openSetting = (type: 'bluetooth' | 'location') => {
  	if (Platform.OS === 'android') {
		const intent = type === 'bluetooth' ? 'android.settings.BLUETOOTH_SETTINGS' : 'android.settings.LOCATION_SOURCE_SETTINGS';
		Linking.sendIntent(intent);
	} else {
		Linking.openURL('app-settings:'); // iOS doesn't support direct deep links to these menus
  	}
};

/** Intended for use in a BlurryPopup. Child content for telling the user to enable bluetooth/location. */
export default function InvalidDeviceSettings({onRetry} : {onRetry: () => void}) {
	return (
		<View style={styles.container}>
			<Text style={styles.heading}>Please enable bluetooth{'\n'}and location services</Text>
			<View style={styles.buttonContainer}>
				<Pressable style={styles.actionButton} onPress={onRetry}>
					<Text style={styles.buttonText}>Retry</Text>
				</Pressable>
				<Pressable style={styles.actionButton} onPress={() => openSetting("bluetooth")}>
					<Text style={styles.buttonText}>Bluetooth settings</Text>
				</Pressable>
				<Pressable style={styles.actionButton} onPress={() => openSetting("location")}>
					<Text style={styles.buttonText}>Location settings</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: 350,
		height: 200,
		alignItems: "center",
		justifyContent: "space-between",
		paddingBottom: 30
	},
	heading: {
		fontSize: 20,
		color: "#f5b700",
		fontFamily: Platform.select({ android: 'Orbitron_500Medium', ios: 'Orbitron-Medium' }),
		textAlign: "left",
		width: "100%"
	},
	buttonContainer: {
		flexDirection: "row",
		gap: 15
	},
	actionButton: {
		backgroundColor: '#00000000',
		borderColor: '#dc0073',
		borderWidth: 1.5,
		borderRadius: 10,
		width: 100,
		height: 60,
		justifyContent: "center"
	},
	buttonText: {
		color: "#fff",
		textAlign: "center",
		fontSize: 14,
		fontFamily: Platform.select({ android: 'Orbitron_500Medium', ios: 'Orbitron-Medium' })
	}
});