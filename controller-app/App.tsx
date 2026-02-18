import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device, Characteristic, Subscription } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import Slider from '@react-native-community/slider';
import { ReactNativeJoystick } from "@korsolutions/react-native-joystick";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// --- Interfaces ---
interface JoystickData {
  position: { x: number; y: number };
  angle: { radian: number; degree: number };
  force: number;
}

const manager = new BleManager();

const TARGET_DEVICE_NAME = "AeroLink"; 
const SERVICE_UUID = "aff07927-a273-4b20-bb24-09962b9f950f";
const DATA_CHAR = "e74ac0ce-8e5b-43c2-bff4-f79bc7557d0d";
const SLIDER_WRITE_CHAR = "56ce2749-1034-4cc3-8aa5-923399a45243";

export default function App() {
  const [device, setDevice] = useState<Device | null>(null);
  const [altitude, setAltitude] = useState<number>(0);
  const [status, setStatus] = useState<string>("Initializing...");
  const lastWriteTime = useRef<number>(0);

  useEffect(() => {
    console.log(" I AM HERE");
    setupBle();
    return () => manager.stopDeviceScan();
  }, []);

  const setupBle = async (): Promise<void> => {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      const isGranted = Object.values(granted).every(res => res === PermissionsAndroid.RESULTS.GRANTED);
      if (!isGranted) return setStatus("Permissions Denied");
    }

    const subscription: Subscription = manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        startAutoScan();
        subscription.remove();
      }
    }, true);
  };

  const startAutoScan = (): void => {
    setStatus("Scanning...");
    manager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        setStatus(`Scan Error: ${error.message}`);
        return;
      }
      if (scannedDevice && (scannedDevice.name === TARGET_DEVICE_NAME || scannedDevice.localName === TARGET_DEVICE_NAME)) {
        manager.stopDeviceScan();
        connectToDevice(scannedDevice);
      }
    });
  };

  const connectToDevice = async (target: Device): Promise<void> => {
    try {
      const connected = await target.connect();
      const discovered = await connected.discoverAllServicesAndCharacteristics();
      setDevice(discovered);
      setStatus("Connected");
      
      // Setup the Notify listener
      setupMonitor(discovered);
    } catch (e) {
      setStatus("Connection Failed");
      startAutoScan(); 
    }
  };

  // --- THE NOTIFY FIX ---
  const setupMonitor = (connectedDevice: Device): void => {
    // The data arrives in the 'char' object automatically via the notify callback
    connectedDevice.monitorCharacteristicForService(
      SERVICE_UUID, 
      DATA_CHAR, 
      (error, char: Characteristic | null) => {
        if (error) {
          console.error("Notify Error:", error);
          return;
        }
        
        if (char?.value) {
          const decodedValue = Buffer.from(char.value, 'base64').toString('utf-8');
          const numericAltitude = parseInt(decodedValue);
          if (!isNaN(numericAltitude))
            setAltitude(numericAltitude);
        }
    });
  };

  const sendSliderData = async (value: number): Promise<void> => {
    const now = Date.now();
    if (device && now - lastWriteTime.current > 250) { // Slightly faster throttle
      const b64 = Buffer.from(Math.floor(value).toString()).toString('base64');
      
      try {
        await device.writeCharacteristicWithoutResponseForService(SERVICE_UUID, SLIDER_WRITE_CHAR, b64);
        lastWriteTime.current = now;
      } catch (e) {
        console.log("Write Error", e);
      }
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.statusText}>{status}</Text>
          <Text style={styles.altText}>{altitude}m</Text>
          <Text style={styles.label}>REAL-TIME ALTITUDE</Text>
        </View>

        <View style={styles.joystickBox}>
          <ReactNativeJoystick 
            color="#06b6d4" 
            radius={75} 
            onMove={(data: JoystickData) => {
               // Logic for joystick movement
            }} 
          />
        </View>

        <View style={styles.sliderBox}>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={100}
            minimumTrackTintColor="#06b6d4"
            onValueChange={sendSliderData}
          />
          <Text style={styles.label}>THROTTLE</Text>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusText: { color: '#94a3b8', fontSize: 14, marginBottom: 10 },
  altText: { color: '#06b6d4', fontSize: 64, fontWeight: 'bold' },
  label: { color: '#64748b', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  joystickBox: { flex: 2, justifyContent: 'center', alignItems: 'center' },
  sliderBox: { flex: 1, paddingHorizontal: 40, alignItems: 'center' }
});