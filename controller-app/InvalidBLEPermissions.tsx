import React from 'react';
import { Linking, Platform, View, Text, Pressable, StyleSheet } from 'react-native';

function openSettings() {
	if (Platform.OS === 'ios') {
		Linking.openURL('app-settings:');
	} else {
		Linking.openSettings();
	}
}

export default function InvalidBLEPermissions({onRetry} : {onRetry: () => void}) {
	return (
		<View style={styles.container}>
			<Text style={styles.heading}>No permissions</Text>
			<Pressable style={styles.actionButton} onPress={onRetry}><Text style={styles.buttonText}>Retry</Text></Pressable>
			<Pressable style={styles.actionButton} onPress={openSettings}><Text style={styles.buttonText}>Settings</Text></Pressable>
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
		gap: 50
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
		color: "#ffaa00"
	}
});