import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AxisPad, AxisPadTouchEvent } from '@fustaro/react-native-axis-pad';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BLEProvider } from './BLEProvider';

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

				<View style={styles.bottomRow}>
					<GestureHandlerRootView style={styles.noFlex}>
						<AxisPad id="throttle-pad" size={185} controlSize={70} onTouchEvent={() => 1} disableX={true} resetOnRelease={false} />
					</GestureHandlerRootView>
					
					<View style={styles.middleActionBtns}>
						<View style={styles.middleActionBtnsRow}>
							<Pressable style={styles.appButtonContainer}>
								<Text style={styles.btnText}>HOVER</Text>
							</Pressable>
							<Pressable style={styles.appButtonContainer}>
								<Text style={styles.btnText}>LAND</Text>
							</Pressable>
						</View>

						<View style={styles.middleActionBtnsRow}>
							<Pressable style={styles.appButtonContainer}>
								<Text style={styles.btnText}>LIGHTS</Text>
							</Pressable>
							<Pressable style={styles.appButtonContainer}>
								<Text style={styles.btnText}>ALT. TARE</Text>
							</Pressable>
						</View>
					</View>

					<GestureHandlerRootView style={styles.noFlex}>
						<AxisPad id="directional-pad" size={170} controlSize={70} onTouchEvent={() => 1} />
					</GestureHandlerRootView>
				</View>
			</BLEProvider>

		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	noFlex: {
		flex: 0
	},
	container: {
		flex: 1,
		//backgroundColor: '#121212',
		backgroundColor: '#d8d8d8',
		justifyContent: 'space-between'
	},
	// TOP ROW STYLES
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
	// BOTTOM ROW STYLES
	bottomRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-end',
		paddingLeft: 25,
		paddingBottom: 25,
		paddingRight: 25
	},
	menuButton: { width: 30, height: 110, backgroundColor: '#444', borderBottomLeftRadius: 6, borderTopLeftRadius: 6 },
	middleActionBtns: { flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 20 },
	middleActionBtnsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20 },
	btnText: { color: 'white', fontWeight: 'bold', textAlign: 'center', textAlignVertical: 'center', flex: 1 },
	appButtonContainer: {
		elevation: 8, // Android shadow
		backgroundColor: '#007bff',
		borderRadius: 10,
		textAlign: 'center',
		width: 100,
		height: 60
	},
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