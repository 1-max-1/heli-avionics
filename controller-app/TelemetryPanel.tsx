import { StyleSheet, View, Text, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Platform } from 'react-native';

export default function TelemetryPanel() {
	return (
		<View style={styles.container}>
			<View style={styles.rssiGroup}>
				<Pressable style={styles.rssiItem}>
					<View style={styles.leftBorderLine} />
					<MaterialCommunityIcons name="antenna" size={22} color="#81e10c" style={{marginLeft: 10 }} />
					<Text style={styles.rssiBtnText}>-30 dBm</Text>
				</Pressable>
				<Pressable style={styles.rssiItem}>
					<View style={styles.leftBorderLine} />
					<MaterialIcons name="bluetooth" size={22} color="#81e10c" style={{marginLeft: 10 }} />
					<Text style={styles.rssiBtnText}>-42 dBm</Text>
				</Pressable>
			</View>

			<View style={styles.statusBox}>
				{/* Slight spacing between number and unit using an empty <Text> */}
				<Text style={styles.altitudeLabel}>23.3<Text style={{ fontSize: 3}}>{"  "}</Text><Text style={styles.altitudeUnit}>m</Text></Text>
				<Text style={styles.statusLabel}>FLYING</Text>
			</View>

			<View style={styles.batteryBox}>
				<View style={styles.leftBorderLine} />
				<MaterialIcons name="battery-std" size={22} color="#81e10c" style={{marginLeft: 10 }} />
				<Text style={styles.batteryBtnText}>3.75V</Text>
			</View>
		</View>
	);
}


const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: "flex-start",
	},
	rssiGroup: {
		justifyContent: "flex-start",
		gap: 15
	},
	rssiItem: {
		width: 130,
		height: 35,
		backgroundColor: "#1f1f1f",
		borderTopRightRadius: 5,
		borderBottomRightRadius: 5,
		flexDirection: "row",
		alignItems: "center",
		gap: 15
	},
	rssiBtnText: {
		color: '#81e10c',
		fontSize: 15,
		fontFamily: Platform.select({ android: 'JetBrainsMono_700Bold', ios: 'JetBrainsMono-Bold' })
	},
	batteryBox: {
		backgroundColor: "#1f1f1f",
		borderTopRightRadius: 5,
		borderBottomRightRadius: 5,
		width: 90,
		height: 50,
		flexDirection: "row",
		alignItems: "center",
		gap: 4
	},
	batteryBtnText: {
		color: '#81e10c',
		fontSize: 15,
		fontFamily: Platform.select({ android: 'JetBrainsMono_700Bold', ios: 'JetBrainsMono-Bold' })
	},
	statusBox: {
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'flex-start',
		gap: 8
	},
	statusLabel: {
		fontSize: 20,
		color: '#00e676',
		fontFamily: Platform.select({ android: 'Orbitron_500Medium', ios: 'Orbitron-Medium' })
	},
	altitudeLabel: {
		fontSize: 52,
		color: "#ffffff",
		fontFamily: Platform.select({ android: 'JetBrainsMono_400Regular', ios: 'JetBrainsMono-Regular' })
	},
	altitudeUnit: {
		fontSize: 26,
		color: "#888"
	},
	leftBorderLine: {
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,
		width: 4,
		backgroundColor: '#81e10c',
		borderRadius: 3, // This creates the "Rounded Caps" at the tips
	},
});