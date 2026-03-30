import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Platform } from 'react-native';

/** Panel of buttons for heli control commands (hover, auto-land etc.) */
export default function ControlButtonPanel() {
	return (			
		<View style={styles.controlButtonsContainer}>
			<View style={styles.controlButtonsRow}>
				<Pressable style={styles.controlBtn}>
					<Text style={styles.btnText}>HOVER</Text>
				</Pressable>
				<Pressable style={styles.controlBtn}>
					<Text style={styles.btnText}>LAND</Text>
				</Pressable>
			</View>

			<View style={styles.controlButtonsRow}>
				<Pressable style={styles.controlBtn}>
					<Text style={styles.btnText}>LIGHTS</Text>
				</Pressable>
				<Pressable style={styles.controlBtn}>
					<Text style={styles.btnText}>ALT. TARE</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	controlButtonsContainer: {
		flexDirection: 'column',
		justifyContent: 'flex-end',
		alignItems: 'center',
		gap: 20
	},
	controlButtonsRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 20
	},
	btnText: {
		color: '#ffffff',
		textAlign: 'center',
		textAlignVertical: 'center',
		flex: 1,
		fontFamily: Platform.select({ android: 'Orbitron_500Medium', ios: 'Orbitron-Medium' })
	},
	controlBtn: {
		elevation: 8, // Android shadow
		backgroundColor: '#00000000',
		borderColor: '#dc0073',
		borderWidth: 1.5,
		borderRadius: 10,
		textAlign: 'center',
		width: 110,
		height: 60
	}
});