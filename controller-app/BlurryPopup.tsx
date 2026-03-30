import { Modal, StyleSheet, Pressable, View } from 'react-native';
import { BlurView } from 'expo-blur';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const THEME = {
	danger2: '#ff4444',
	danger: "#f5b700",
	success: '#81e10c',
	info2: '#448aff',
	info: "#50d8d7"
};

interface BlurryPopupProps {
	visible: boolean;
	closable: boolean;
	onCloseRequest: () => void;
	popupType: 'info' | 'success' | 'danger';
	children: React.ReactNode;
}

/** Modal popup which blurs the background. Will expand to any size necessary, popup size is determined by child element size. */
export default function BlurryPopup({ visible, closable, onCloseRequest, popupType, children } : BlurryPopupProps) {
	return (
		<Modal transparent visible={visible} onRequestClose={() => closable && onCloseRequest()} animationType="fade">
			<BlurView intensity={30} tint="default" experimentalBlurMethod="dimezisBlurView" style={{flex: 1}}>
				{/* Outer pressable to close popup if user clicks on the blur */}
				<Pressable style={styles.clickableArea} onPress={() => closable && onCloseRequest()}>
					{/* Inner pressable to block presses on the modal from trickling to the outer pressable */}
					<Pressable style={[styles.modalBox, {borderColor: THEME[popupType]}]}>
						{closable && (
							<Pressable style={styles.closeButton} onPress={onCloseRequest} hitSlop={15}>
								<MaterialIcons name="close" size={24} color={THEME[popupType]} />
							</Pressable>
						)}
						
						{children}
					</Pressable>
				</Pressable>
			</BlurView>
		</Modal>
	);
};

const styles = StyleSheet.create({
	clickableArea: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	modalBox: {
		backgroundColor: "#121214",
		borderRadius: 8,
		borderWidth: 1,
		elevation: 10,
		padding: 25
	},
	closeButton: {
		position: "absolute",
		top: 15,
		right: 15,
		zIndex: 999
	}
});