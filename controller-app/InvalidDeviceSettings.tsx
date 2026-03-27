import { Linking, Platform, View, Text, Pressable, StyleSheet } from 'react-native';

export const openSetting = (type: 'bluetooth' | 'location') => {
  	if (Platform.OS === 'android') {
		const intent = type === 'bluetooth' ? 'android.settings.BLUETOOTH_SETTINGS' : 'android.settings.LOCATION_SOURCE_SETTINGS';
		Linking.sendIntent(intent);
	} else {
		Linking.openURL('app-settings:'); // iOS doesn't support direct deep links to these menus
  	}
};

export default function InvalidDeviceSettings({onRetry} : {onRetry: () => void}) {
	return (
		<View style={styles.container}>
			<Text style={styles.heading}>Please turn bluetooth and location on</Text>
			<Pressable style={styles.actionButton} onPress={onRetry}><Text style={styles.buttonText}>Retry</Text></Pressable>
			<Pressable style={styles.actionButton} onPress={() => openSetting("bluetooth")}><Text style={styles.buttonText}>Bluetooth settings</Text></Pressable>
			<Pressable style={styles.actionButton} onPress={() => openSetting("location")}><Text style={styles.buttonText}>Location settings</Text></Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: "column",
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: "center",
		gap: 15
	},
	heading: {
		fontSize: 25
	},
	actionButton: {
		width: 100,
		height: 50,
		backgroundColor: "#007bff",
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 5
	},
	buttonText: {
		color: "#ffaa00",
		textAlign: "center"
	}
});