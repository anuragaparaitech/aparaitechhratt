import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/env';
import axios from 'axios';

export default function FaceLoginScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Align your face within the frame');
  const cameraRef = useRef(null);
  const { setFaceAuthenticatedUser } = useAuth();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleCaptureAndVerify = async () => {
    if (!cameraRef.current || scanning) return;

    setScanning(true);
    setStatusMessage('Capturing & analyzing biometric face descriptor...');

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.6,
        base64: true,
        skipProcessing: false
      });

      if (!photo?.base64) {
        throw new Error('Failed to capture clear frame from front camera');
      }

      setStatusMessage('Verifying face against Aparaitech enrolled database...');

      // Call backend face verify endpoint
      const response = await axios.post(`${API_BASE_URL}/api/face/verify`, {
        image: `data:image/jpeg;base64,${photo.base64}`
      }, {
        timeout: 15000
      });

      if (response.data?.success && response.data?.user) {
        setStatusMessage(`✅ Face Recognized: ${response.data.user.name}`);
        const token = response.data.token || btoa(`${response.data.user.role}:${response.data.user.email}`);
        await setFaceAuthenticatedUser(response.data.user, token);
      } else {
        throw new Error(response.data?.message || 'Face not recognized in employee records.');
      }
    } catch (err) {
      console.warn('Face verification error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Face verification failed';
      setStatusMessage('❌ Face not recognized. Try again or use PIN/Password.');
      Alert.alert('Verification Failed', errMsg, [
        { text: 'Try Again', onPress: () => setStatusMessage('Align your face within the frame') },
        { text: 'Use PIN Pad', onPress: () => navigation.navigate('Passcode') }
      ]);
    } finally {
      setScanning(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permText}>Camera access is required for biometric face login.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Camera Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Biometric Face Unlock</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Live Front Camera View */}
      <View style={styles.cameraWrapper}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing="front"
        />

        {/* Oval Face Frame Overlay */}
        <View style={styles.overlay}>
          <View style={styles.ovalFrame}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>
        </View>
      </View>

      {/* Bottom Action Area */}
      <View style={styles.bottomArea}>
        <Text style={styles.statusText}>{statusMessage}</Text>

        <TouchableOpacity
          style={[styles.captureBtn, scanning && styles.captureBtnDisabled]}
          onPress={handleCaptureAndVerify}
          disabled={scanning}
        >
          {scanning ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.captureBtnText}>Scan & Authenticate</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchBtn}
          onPress={() => navigation.navigate('Passcode')}
        >
          <Text style={styles.switchBtnText}>Or Use 4-Digit Passcode</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a192f'
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0a192f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  permText: {
    color: '#ffffff',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20
  },
  permBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12
  },
  permBtnText: {
    color: '#ffffff',
    fontWeight: '700'
  },
  cancelBtn: {
    marginTop: 16
  },
  cancelBtnText: {
    color: '#94a3b8'
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  backBtn: {
    padding: 8
  },
  backBtnText: {
    color: '#93c5fd',
    fontSize: 16,
    fontWeight: '700'
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800'
  },
  cameraWrapper: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 25, 47, 0.25)'
  },
  ovalFrame: {
    width: 250,
    height: 330,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: '#38bdf8',
    backgroundColor: 'transparent',
    position: 'relative'
  },
  cornerTL: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#60a5fa'
  },
  cornerTR: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#60a5fa'
  },
  cornerBL: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#60a5fa'
  },
  cornerBR: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#60a5fa'
  },
  bottomArea: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#0a192f'
  },
  statusText: {
    color: '#cbd5e1',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    minHeight: 36
  },
  captureBtn: {
    width: '100%',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  captureBtnDisabled: {
    opacity: 0.6
  },
  captureBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800'
  },
  switchBtn: {
    marginTop: 14,
    padding: 6
  },
  switchBtnText: {
    color: '#93c5fd',
    fontSize: 13,
    fontWeight: '600'
  }
});
