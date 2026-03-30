import React from 'react';
import { Linking, Platform, View, Text, Pressable, StyleSheet } from 'react-native';

function openSettings() {
	if (Platform.OS === 'ios') {
		Linking.openURL('app-settings:');
	} else {
		Linking.openSettings();
	}
}

/** Intended for use in a BlurryPopup. Child content for telling the user to allow permission. */
export default function InvalidBLEPermissions({onRetry} : {onRetry: () => void}) {
	const apiLevel = parseInt(Platform.Version.toString(), 10);

	/*
	 * On android 12+, we need bluetooth permissions only, since neverForLocation is set to true. 
	 * Below android 12+, we need location permissions instead to access BLE.
	 */

	return (
		<View style={styles.container}>
			<Text style={styles.heading}>Please enable{'\n'}{apiLevel >= 31 ? "bluetooth" : "location"} permissions</Text>
			<View style={styles.buttonContainer}>
				<Pressable style={styles.actionButton} onPress={onRetry}>
					<Text style={styles.buttonText}>Retry</Text>
				</Pressable>
				<Pressable style={styles.actionButton} onPress={openSettings}>
					<Text style={styles.buttonText}>Open settings</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: 260,
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
		gap: 25
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