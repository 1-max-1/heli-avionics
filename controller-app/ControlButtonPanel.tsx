import { StyleSheet, View, Text, Pressable } from 'react-native';

export default function ControlButtonPanel() {
	return (			
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
	);
}

const styles = StyleSheet.create({
	middleActionBtns: {
		flexDirection: 'column',
		justifyContent: 'flex-end',
		alignItems: 'center',
		gap: 20
	},
	middleActionBtnsRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 20
	},
	btnText: {
		color: 'white',
		fontWeight: 'bold',
		textAlign: 'center',
		textAlignVertical: 'center',
		flex: 1
	},
	appButtonContainer: {
		elevation: 8, // Android shadow
		backgroundColor: '#007bff',
		borderRadius: 10,
		textAlign: 'center',
		width: 100,
		height: 60
	}
});