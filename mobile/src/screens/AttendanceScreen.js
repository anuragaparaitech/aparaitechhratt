import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import * as Location from 'expo-location';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { attendanceAPI } from '../services/api';
import { verifyGeofence } from '../services/locationService';
import { OFFICE_GEOFENCE, SHIFTS } from '../config/env';

export default function AttendanceScreen({ navigation }) {
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [todayRecord, setTodayRecord] = useState(null);

  // GPS State
  const [locationStatus, setLocationStatus] = useState('Checking GPS...');
  const [userCoords, setUserCoords] = useState(null);
  const [geofenceResult, setGeofenceResult] = useState(null);

  // Camera Punch Modal State
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [punchMode, setPunchMode] = useState('check-in'); // 'check-in' | 'check-out'
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const userShiftKey = currentUser?.shift || (currentUser?.department === 'Development' ? 'shift_1' : 'shift_2');
  const userShift = SHIFTS[userShiftKey] || SHIFTS.shift_1;

  useEffect(() => {
    fetchAttendanceData();
    requestLocationAndVerify();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const res = await attendanceAPI.getAll({ email: currentUser?.email });
      const records = Array.isArray(res) ? res : (res.data || res.records || []);
      setAttendanceRecords(records);

      const todayStr = new Date().toISOString().split('T')[0];
      const today = records.find(r => r.date === todayStr);
      setTodayRecord(today || null);

      const sessions = Array.isArray(res) ? [] : (res.liveSessions || []);
      const mySession = sessions.find(s => s.employeeEmail === currentUser?.email);
      setActiveSession(mySession || null);
    } catch (err) {
      console.warn('Attendance load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const requestLocationAndVerify = async () => {
    try {
      setLocationStatus('Requesting GPS permission...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('⚠️ Location permission denied');
        return;
      }

      setLocationStatus('Getting high-accuracy GPS coordinates...');
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      const { latitude, longitude } = loc.coords;
      setUserCoords({ latitude, longitude });

      const check = verifyGeofence(latitude, longitude);
      setGeofenceResult(check);
      setLocationStatus(check.message);
    } catch (err) {
      console.warn('Location error:', err);
      setLocationStatus('⚠️ GPS signal error. Enable location services.');
    }
  };

  const handleStartPunch = async (mode) => {
    // Check geofence
    if (geofenceResult && !geofenceResult.inside) {
      Alert.alert(
        'Geofence Verification Failed',
        `You are ${geofenceResult.distance}m away from Optenix Tech Solution. Attendance must be recorded within ${OFFICE_GEOFENCE.radiusMeters}m of the office center.`
      );
      return;
    }

    if (!cameraPermission?.granted) {
      const perm = await requestCameraPermission();
      if (!perm.granted) {
        Alert.alert('Camera Required', 'Front camera access is required to capture verification selfie.');
        return;
      }
    }

    setPunchMode(mode);
    setCameraModalVisible(true);
  };

  const handleCaptureAndPunch = async () => {
    if (!cameraRef.current || submitting) return;

    setSubmitting(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true
      });

      const payload = {
        email: currentUser?.email,
        faceImage: `data:image/jpeg;base64,${photo.base64}`,
        latitude: userCoords?.latitude || OFFICE_GEOFENCE.latitude,
        longitude: userCoords?.longitude || OFFICE_GEOFENCE.longitude,
        locationDistanceMeters: geofenceResult?.distance || 15,
        locationVerified: geofenceResult?.inside ?? true
      };

      if (punchMode === 'check-in') {
        const res = await attendanceAPI.checkIn(payload);
        Alert.alert('✅ Check-In Recorded', res.message || 'Attendance session started.');
      } else {
        const res = await attendanceAPI.checkOut(payload);
        Alert.alert('✅ Check-Out Recorded', res.message || 'Work session closed.');
      }

      setCameraModalVisible(false);
      fetchAttendanceData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Punch submission failed';
      Alert.alert('Punch Failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Office & Geofence GPS Card */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>📍 Optenix Geofence Status</Text>
            <TouchableOpacity onPress={requestLocationAndVerify}>
              <Text style={styles.refreshGps}>🔄 Refresh GPS</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.officeAddress}>{OFFICE_GEOFENCE.address}</Text>

          <View style={[
            styles.geofenceAlertBox,
            geofenceResult?.inside ? styles.geoInsideBox : styles.geoOutsideBox
          ]}>
            <Text style={[
              styles.geofenceAlertText,
              geofenceResult?.inside ? styles.geoInsideText : styles.geoOutsideText
            ]}>
              {locationStatus}
            </Text>
          </View>

          {geofenceResult?.distance !== null && geofenceResult?.distance !== undefined && (
            <Text style={styles.distanceSubtext}>
              Office Center Distance: {geofenceResult.distance} meters (Radius limit: {OFFICE_GEOFENCE.radiusMeters}m)
            </Text>
          )}
        </View>

        {/* Real-Time Punch Control Card */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 12 }]}>
            Attendance Action • {userShift.name}
          </Text>

          <View style={styles.shiftDetailsRow}>
            <Text style={styles.shiftDetailsLabel}>Assigned Timing:</Text>
            <Text style={styles.shiftDetailsVal}>{userShift.display}</Text>
          </View>

          {activeSession ? (
            <View style={styles.activeSessionBox}>
              <Text style={styles.activeSessionTitle}>🟢 Active Check-In Session</Text>
              <Text style={styles.activeSessionTime}>Started at: {activeSession.checkInTime}</Text>
              <TouchableOpacity
                style={[styles.punchBtn, { backgroundColor: theme.danger }]}
                onPress={() => handleStartPunch('check-out')}
              >
                <Text style={styles.punchBtnText}>📸 Check-Out with Face & GPS</Text>
              </TouchableOpacity>
            </View>
          ) : todayRecord?.checkOut ? (
            <View style={styles.completedBox}>
              <Text style={styles.completedTitle}>✅ Attendance Completed Today</Text>
              <Text style={styles.completedSub}>
                In: {todayRecord.checkIn} • Out: {todayRecord.checkOut} • Duration: {todayRecord.workingHours}h ({todayRecord.status})
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.punchBtn, { backgroundColor: theme.success }]}
              onPress={() => handleStartPunch('check-in')}
            >
              <Text style={styles.punchBtnText}>📸 Check-In with Face & GPS</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Attendance Log History */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Attendance History Logs</Text>
        {loading ? (
          <ActivityIndicator color={theme.accent} style={{ marginVertical: 20 }} />
        ) : attendanceRecords.length === 0 ? (
          <Text style={styles.emptyText}>No attendance records found.</Text>
        ) : (
          attendanceRecords.map((rec, idx) => (
            <View key={rec._id || idx} style={[styles.logItem, { backgroundColor: theme.cardBackground }]}>
              <View style={styles.logLeft}>
                <Text style={[styles.logDate, { color: theme.text }]}>{rec.date}</Text>
                <Text style={styles.logTimes}>
                  In: {rec.checkIn || '—'} • Out: {rec.checkOut || '—'}
                </Text>
                {rec.locationDistanceMeters !== undefined && (
                  <Text style={styles.logGeo}>
                    {rec.locationVerified ? '🏢 Office' : '📡 Remote'} ({rec.locationDistanceMeters}m)
                  </Text>
                )}
              </View>

              <View style={styles.logRight}>
                <View style={[
                  styles.statusPill,
                  rec.status === 'Full Day' ? styles.pillFull : (rec.status === 'Half Day' ? styles.pillHalf : styles.pillQuarter)
                ]}>
                  <Text style={styles.statusPillText}>{rec.status || 'Present'}</Text>
                </View>
                <Text style={styles.hoursText}>{rec.workingHours ? `${rec.workingHours} hrs` : ''}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Camera Face Punch Modal */}
      <Modal visible={cameraModalVisible} animationType="slide">
        <View style={styles.modalCameraContainer}>
          <View style={styles.modalCameraHeader}>
            <TouchableOpacity onPress={() => setCameraModalVisible(false)}>
              <Text style={styles.closeCameraText}>✕ Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalCameraTitle}>
              {punchMode === 'check-in' ? 'Check-In Verification' : 'Check-Out Verification'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            facing="front"
          />

          <View style={styles.cameraOverlay}>
            <View style={styles.cameraOval} />
            <Text style={styles.cameraInstruction}>Position your face and tap capture</Text>

            <TouchableOpacity
              style={styles.snapBtn}
              onPress={handleCaptureAndPunch}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.snapBtnText}>Verify & Submit Punch</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800'
  },
  refreshGps: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '700'
  },
  officeAddress: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 10
  },
  geofenceAlertBox: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 6
  },
  geoInsideBox: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac'
  },
  geoOutsideBox: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5'
  },
  geofenceAlertText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center'
  },
  geoInsideText: {
    color: '#15803d'
  },
  geoOutsideText: {
    color: '#dc2626'
  },
  distanceSubtext: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center'
  },
  shiftDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14
  },
  shiftDetailsLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600'
  },
  shiftDetailsVal: {
    fontSize: 12,
    color: '#0a192f',
    fontWeight: '800'
  },
  punchBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  punchBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800'
  },
  activeSessionBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center'
  },
  activeSessionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803d',
    marginBottom: 4
  },
  activeSessionTime: {
    fontSize: 12,
    color: '#166534',
    marginBottom: 12
  },
  completedBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center'
  },
  completedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1d4ed8',
    marginBottom: 4
  },
  completedSub: {
    fontSize: 11,
    color: '#2563eb'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginVertical: 12
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginVertical: 16
  },
  logItem: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logLeft: {
    flex: 1
  },
  logDate: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2
  },
  logTimes: {
    fontSize: 11,
    color: '#64748b'
  },
  logGeo: {
    fontSize: 10,
    color: '#2563eb',
    marginTop: 2
  },
  logRight: {
    alignItems: 'flex-end'
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4
  },
  pillFull: {
    backgroundColor: '#dcfce7'
  },
  pillHalf: {
    backgroundColor: '#fef3c7'
  },
  pillQuarter: {
    backgroundColor: '#f3e8ff'
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f172a'
  },
  hoursText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600'
  },
  modalCameraContainer: {
    flex: 1,
    backgroundColor: '#0a192f'
  },
  modalCameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 10,
    backgroundColor: 'rgba(10, 25, 47, 0.8)'
  },
  closeCameraText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700'
  },
  modalCameraTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800'
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
    backgroundColor: 'rgba(10, 25, 47, 0.2)'
  },
  cameraOval: {
    width: 240,
    height: 310,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: '#38bdf8',
    marginBottom: 30
  },
  cameraInstruction: {
    color: '#ffffff',
    fontSize: 13,
    marginBottom: 20,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20
  },
  snapBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  snapBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15
  }
});
