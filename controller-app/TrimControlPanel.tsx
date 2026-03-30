import React, { useState, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Platform } from 'react-native';

const buttonWidth = 40;
const contentWidth = 320;
const totalWidth = contentWidth + buttonWidth;

/** Slide-out drawer for adjusting the helicopter trim settings */
export default function TrimControlPanel() {
	const [isOpen, setIsOpen] = useState(false);
	
	// Animation values
	const widthAnim = useRef(new Animated.Value(buttonWidth)).current;
	const opacityAnim = useRef(new Animated.Value(0)).current;

	function toggleDrawer() {
		Animated.parallel([
			Animated.timing(widthAnim, {
				toValue: isOpen ? buttonWidth : totalWidth,
				duration: 300,
				useNativeDriver: false, // Width needs JS thread
			}),
			Animated.timing(opacityAnim, {
				toValue: isOpen ? 0 : 1,
				duration: 200, // Make text fade slightly faster than the slide
				delay: 100,
				useNativeDriver: true,
			}),
		]).start();

		setIsOpen(!isOpen);
	};

	return (
		<Animated.View style={[styles.drawer, { width: widthAnim }]}>
			{/* Open/close button */}
			<Pressable onPress={toggleDrawer} style={styles.button}>
				<Text style={styles.buttonText}>TRIM</Text>
				{isOpen ? 
					<MaterialIcons name="arrow-forward-ios" size={24} color="#00e676" />
				:
					<MaterialIcons name="arrow-back-ios-new" size={24} color="#00e676" />
				}
			</Pressable>

			<Animated.View style={[styles.contentWrapper, { opacity: opacityAnim }]}>
				{/* Fixed width container to prevent items squishing up when drawer is opening (small width) */}
				<View style={styles.staticContent}>
					<View style={styles.divider} />
					<Pressable>
						<MaterialIcons name="keyboard-arrow-down" size={75} color="#dc0073" />
					</Pressable>
					<Pressable>
						<MaterialIcons name="keyboard-arrow-up" size={75} color="#dc0073" />
					</Pressable>
					<Pressable>
						<MaterialIcons name="keyboard-arrow-left" size={75} color="#dc0073" />
					</Pressable>
					<Pressable>
						<MaterialIcons name="keyboard-arrow-right" size={75} color="#dc0073" />
					</Pressable>
				</View>
			</Animated.View>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	drawer: {
		position: 'absolute',
		right: 0,
		top: 0,
		height: 110,
		backgroundColor: '#2a2a2a',
		flexDirection: 'row',
		alignItems: 'center',
		borderTopLeftRadius: 20,
		borderBottomLeftRadius: 20,
		borderWidth: 1,
		borderColor: '#555',
		zIndex: 999, // Ensure it stays on top
	},
	button: {
		width: buttonWidth,
		height: "100%",
		justifyContent: 'center',
		alignItems: 'center',
		gap: 10
	},
	buttonText: {
		color: "#00e676",
		fontFamily: Platform.select({ android: 'Orbitron_500Medium', ios: 'Orbitron-Medium' }),
		fontSize: 10,
		marginTop: -20 // Pull items up so the button arrow is centered
	},
	contentWrapper: {
		flex: 1,
		height: "100%"
	},
	staticContent: {
		flexDirection: "row",
		alignItems: 'center',
		height: "100%",
		width: contentWidth
	},
	divider: {
		width: 1,
		height: "70%",
		backgroundColor: '#555',
		marginRight: 10
	}
});