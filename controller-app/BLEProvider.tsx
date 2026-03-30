import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { BleErrorCode, BleManager, Device, Subscription } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { PermissionsAndroid, Platform } from 'react-native';
import InvalidBLEPermissions from "./InvalidBLEPermissions";
import InvalidDeviceSettings from "./InvalidDeviceSettings";
import { SerializablePacket } from './packets';
import BlurryPopup from './BlurryPopup';

/** Asks user for BLE permissions, returns true if they accept otherwise false. */
async function requestBLEPermissions() {
	if (Platform.OS === 'ios') return true;

	const apiLevel = parseInt(Platform.Version.toString(), 10);
	if (apiLevel >= 31) {
		// neverForLocation is enabled in manifest so don't need to ask for location on android 12+
		const result = await PermissionsAndroid.requestMultiple([
			PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
			PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
		]);

		return (
			result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
			result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED
		);
	}

	const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
	return granted === PermissionsAndroid.RESULTS.GRANTED;
};

/** Promise which rejects (timeout) after a duration. Use with Promise.race() */
function timeoutPromise(ms: number) {
	return new Promise<never>((_, reject) => {
		setTimeout(() => reject(new Error("Timeout")), ms)
	});
}

interface BLEContextType {
	isConnecting: boolean;
	sendPacket: (packet: SerializablePacket) => Promise<boolean>;
}

const BLEContext = createContext<BLEContextType | undefined>(undefined);

const manager = new BleManager();

/** Context provider which has BLE related methods and events. Also handles permissions. */
export function BLEProvider({ children }: { children: ReactNode }) {
	// Should almost always be true anyway, but I like accounting for all edge cases
	let providerIsMounted = useRef<boolean>(true);
	let aeroLinkDevice = useRef<Device | null>(null);
	let disconnectSubscriber = useRef<Subscription | null>(null); // Listens for disconnect events on the aerolink

	const [isConnecting, setIsConnecting] = useState<boolean>(false);
	const [blePermissionsOK, setblePermissionsOK] = useState<boolean>(true);
	// i.e. if we need bluetooth or location to be turned on
	const [deviceSettingsOK, setDeviceSettingsOK] = useState<boolean>(true);

	// Start connecting when the app is open and never stop trying
	useEffect(() => {
		scanAndConnect();
		return () => {
			providerIsMounted.current = false;
			manager.stopDeviceScan();
			// Don't want disconnect events to fire when we manually disconnect on next line
			disconnectSubscriber.current?.remove();
			disconnectSubscriber.current = null;
			aeroLinkDevice.current?.cancelConnection();
			aeroLinkDevice.current = null;
		};
	}, []);

	/**
	 * Returns true if the BLEProvider instance has been unmounted and the effect cleanup function has been called.
	 * 
	 * Use this to detect unmount and abort long running async functions like BLE connect().
	 * Probably not needed since the BLEProvider is probably never unmounted while using the app, but I like to be thorough.
	 * 
	 * Google "react abort controller pattern" for similar
	 */
	function isUnmounted() {
		return !providerIsMounted.current;
	}

	/** Will attempt to connect to the given device. On failure, will go back to scanning for devices. */
	function connectWithScanFallback(device: Device) {
		connectToDevice(device).then(success => {
			if (!success && !isUnmounted())
				setTimeout(scanAndConnect, 3000); // Retry
		});
	}

	/** Connects to the given device and sets up ref/state variables and event listeners. 
	 * 
	 * Returns false on fail, otherwise true to indicate success or abort (ignore). */
	async function connectToDevice(device: Device) {
		try {
			// connect() seems to hang forever and doesn't time out, so we add a timeout manually
			// This is important in the case where we are trying to reconnect but the device is out of range so we would be waiting forever.
			await Promise.race([device.connect(), timeoutPromise(5000)]);
			if (isUnmounted()) return true;
			aeroLinkDevice.current = device;

			await device.discoverAllServicesAndCharacteristics();
			if (isUnmounted()) return true;

			disconnectSubscriber.current = device.onDisconnected((error, disconnectedDevice) => {
				// Remove old subscription, it seems to still pick up repeated events even after disconnect, when I am trying to reconnect
				disconnectSubscriber.current!.remove();
				disconnectSubscriber.current = null;
				aeroLinkDevice.current = null;
				connectWithScanFallback(disconnectedDevice);
			});

			return true;
		} catch (err) {
			if (await device.isConnected())
				await device.cancelConnection();
			return false;
		}
	}

	async function scanAndConnect() {
		let perms = await requestBLEPermissions();
		if (isUnmounted()) return;
		setblePermissionsOK(perms);
		if (!perms) return;

		setIsConnecting(true);
		setDeviceSettingsOK(true);

		// TODO: if on iOS, will need to wait for BLE power on, see https://dotintent.github.io/react-native-ble-plx/#waiting-for-powered-on-state

		manager.startDeviceScan(["aff07927-a273-4b20-bb24-09962b9f950f"], null, (error, bleDevice) => {
			if (isUnmounted()) return;

			if (error) {
				// The docs say that an error will automatically stop the scan, but either the docs are lying or there's something weird going on.
				// Include this here to avoid the callback spawning new callbacks which spawn new ones etc.
				manager.stopDeviceScan();
				setIsConnecting(false);

				if (error.errorCode == BleErrorCode.BluetoothInUnknownState ||
					error.errorCode == BleErrorCode.BluetoothPoweredOff ||
					error.errorCode == BleErrorCode.BluetoothResetting ||
					error.errorCode == BleErrorCode.LocationServicesDisabled)
				{
					setDeviceSettingsOK(false); // Fixable error, device settings
				}
				else {
					setTimeout(scanAndConnect, 3000); // Unfixable error, retry
				}
				
				return;
			}

			if (bleDevice!.name === "AeroLink") {
				manager.stopDeviceScan();
				connectWithScanFallback(bleDevice!);
			}
		});
	};

	/**
	 * Will send packet to the aerolink.
	 * @returns true if succesful, otherwise false. Nothing special happens if the proider unmounts while the BLE communication is happening. 
	 */
	async function sendPacket(packet: SerializablePacket) {
		let data = Buffer.from(packet.toBuffer()).toString('base64');

		try {
			await aeroLinkDevice.current?.writeCharacteristicWithoutResponseForService(
				"aff07927-a273-4b20-bb24-09962b9f950f",
				"56ce2749-1034-4cc3-8aa5-923399a45243",
				data);
			return true;
		} catch (err) {
			return false;
		}
	}

	/*const sendData = async (serviceUUID: string, charUUID: string, byteArray: number[]) => {
		if (!connectedDevice) return;

		try {
			const base64Data = Buffer.from(byteArray).toString('base64');
			await connectedDevice.writeCharacteristicWithResponseForService(
				serviceUUID,
				charUUID,
				base64Data
			);
		} catch (e) {
			console.error("Write Error:", e);
		}
	};*/

	/*const disconnect = async () => {
		if (connectedDevice) {
			await connectedDevice.cancelConnection();
			setConnectedDevice(null);
		}
	};*/

	return (
		<BLEContext.Provider value={{
			isConnecting,
			sendPacket
		}}>

			{/* Popup telling user to fix permissions or enable bluetooth if disabled */}
			<BlurryPopup visible={!blePermissionsOK || !deviceSettingsOK} closable={false} popupType="danger" onCloseRequest={() => {}}>
				{ 
					!blePermissionsOK ? 
					<InvalidBLEPermissions onRetry={scanAndConnect} /> :
					<InvalidDeviceSettings onRetry={scanAndConnect} />
				}
			</BlurryPopup>

			{children}
		</BLEContext.Provider>
	);
};

export function useBLE() {
	const context = useContext(BLEContext);
	if (!context)
		throw new Error("useBLE must be used within a BLEProvider");
	return context;
};