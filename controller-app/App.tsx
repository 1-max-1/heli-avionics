import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BLEProvider } from './BLEProvider';
import JoystickPanel from './JoystickPanel';

export default function App() {
	return (
		<SafeAreaView style={styles.container}>
			<StatusBar hidden />
			
			<BLEProvider>
				<View style={styles.topRow}>
					<View style={styles.topLeftGroup}>
						<Pressable style={styles.rssiItem}>
							<Text style={styles.btnText}>RSSI: -30dBm</Text>
						</Pressable>
						<Pressable style={styles.rssiItem}>
							<Text style={styles.btnText}>RSSI: -42dBm</Text>
						</Pressable>
					</View>

					<View style={styles.statusBox}>
						<Text style={styles.altitudeLabel}>23.3m</Text>
						<Text style={styles.statusLabel}>FLYING</Text>
					</View>

					<View style={styles.topRightGroup}>
						<View style={styles.batteryBox}>
							<Text style={styles.btnText}>B: 3.75V</Text>
						</View>
						<Pressable style={styles.menuButton}>
							<Text style={styles.btnText}>{'{'}</Text>
						</Pressable>
					</View>
				</View>

				<JoystickPanel />
			</BLEProvider>

		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		//backgroundColor: '#121212',
		backgroundColor: '#d8d8d8',
		justifyContent: 'space-between'
	},
	topRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		paddingLeft: 15,
		paddingTop: 0
	},
	topLeftGroup: {
		flexDirection: 'column',
		justifyContent: "flex-start",
		gap: 15
	},
	rssiItem: {
		width: 150,
		height: 35,
		borderRadius: 15,
		backgroundColor: '#50BB00'
	},
	topRightGroup: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 50, // Adds spacing between the two top-right items
	},
	batteryBox: {
		backgroundColor: 'rgb(247, 72, 72)',
		borderRadius: 8,
		width: 90,
		height: 50
	},
	menuButton: { width: 30, height: 110, backgroundColor: '#444', borderBottomLeftRadius: 6, borderTopLeftRadius: 6 },
	btnText: { color: 'white', fontWeight: 'bold', textAlign: 'center', textAlignVertical: 'center', flex: 1 },
	statusBox: {
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'flex-start',
		gap: 8
	},
	statusLabel: {
		fontSize: 25,
		color: '#AA11EE'
	},
	altitudeLabel: {
		fontSize: 45
	}
});