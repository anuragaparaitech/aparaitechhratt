import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SHIFTS, GEOFENCE_CONFIG, API_BASE_URL } from '../config/env';
import axios from 'axios';

export default function SettingsScreen({ navigation }) {
  const { user, logout, biometricAvailable } = useAuth();
  const { colors, isDark, toggleTheme, language, changeLanguage } = useTheme();

  // Notification switches state
  const [dailyReminder, setDailyReminder] = useState(true);
  const [announcementAlerts, setAnnouncementAlerts] = useState(true);
  const [attendanceAlerts, setAttendanceAlerts] = useState(true);

  // Server health test state
  const [testingServer, setTestingServer] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);

  const handleTestServer = async () => {
    setTestingServer(true);
    setServerStatus(null);
    try {
      const start = Date.now();
      const res = await axios.get(`${API_BASE_URL}/api/attendance/live`, { timeout: 8000 });
      const latency = Date.now() - start;
      if (res.status === 200 || res.status === 401) {
        setServerStatus({ ok: true, latency });
      } else {
        setServerStatus({ ok: false, error: `HTTP ${res.status}` });
      }
    } catch (err) {
      setServerStatus({ ok: false, error: err.message || 'Connection failed' });
    } finally {
      setTestingServer(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to end your session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => logout('User requested sign out')
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Settings & System</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Preferences, Geofence & Shift Protocols
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Appearance & Theme Section */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance & Display</Text>

          {/* Dark Mode Toggle */}
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLabelGroup}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={colors.primary} />
              <View style={styles.settingTextWrap}>
                <Text style={[styles.settingName, { color: colors.text }]}>Dark Mode</Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  {isDark ? 'Dark blue corporate theme enabled' : 'Clean white background enabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              thumbColor={isDark ? colors.primary : '#f4f3f4'}
              trackColor={{ false: '#767577', true: colors.primary + '70' }}
            />
          </View>

          {/* Language Switcher */}
          <View style={styles.settingRow}>
            <View style={styles.settingLabelGroup}>
              <Ionicons name="language" size={20} color={colors.primary} />
              <View style={styles.settingTextWrap}>
                <Text style={[styles.settingName, { color: colors.text }]}>Portal Language</Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Select preferred interface language
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.langRow}>
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'हिंदी (Hindi)' },
              { code: 'mr', label: 'मराठी (Marathi)' }
            ].map((item) => (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.langChip,
                  {
                    backgroundColor: language === item.code ? colors.primary : colors.background,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => changeLanguage(item.code)}
              >
                <Text
                  style={[
                    styles.langChipText,
                    {
                      color: language === item.code ? '#ffffff' : colors.text,
                      fontWeight: language === item.code ? '700' : '500'
                    }
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications Section */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Alerts & Notifications</Text>

          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLabelGroup}>
              <Ionicons name="time-outline" size={20} color="#f59e0b" />
              <View style={styles.settingTextWrap}>
                <Text style={[styles.settingName, { color: colors.text }]}>Daily 7:00 PM Report Reminder</Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Daily push notification before reporting cutoff
                </Text>
              </View>
            </View>
            <Switch
              value={dailyReminder}
              onValueChange={setDailyReminder}
              thumbColor={dailyReminder ? '#f59e0b' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#f59e0b70' }}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLabelGroup}>
              <Ionicons name="megaphone-outline" size={20} color="#2563eb" />
              <View style={styles.settingTextWrap}>
                <Text style={[styles.settingName, { color: colors.text }]}>Company Circular Alerts</Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Notices, holiday alerts and team memos
                </Text>
              </View>
            </View>
            <Switch
              value={announcementAlerts}
              onValueChange={setAnnouncementAlerts}
              thumbColor={announcementAlerts ? '#2563eb' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#2563eb70' }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLabelGroup}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#10b981" />
              <View style={styles.settingTextWrap}>
                <Text style={[styles.settingName, { color: colors.text }]}>Attendance Check-In Reminders</Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Shift commencement notification
                </Text>
              </View>
            </View>
            <Switch
              value={attendanceAlerts}
              onValueChange={setAttendanceAlerts}
              thumbColor={attendanceAlerts ? '#10b981' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#10b98170' }}
            />
          </View>
        </View>

        {/* Operational Shift Protocols Card */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Work Shifts & Geofence Rules</Text>

          <View style={styles.shiftCard}>
            <View style={[styles.shiftDot, { backgroundColor: '#3b82f6' }]} />
            <View style={styles.shiftInfo}>
              <Text style={[styles.shiftName, { color: colors.text }]}>{SHIFTS.shift_1.name}</Text>
              <Text style={[styles.shiftTime, { color: colors.primary }]}>{SHIFTS.shift_1.timing}</Text>
              <Text style={[styles.shiftAudience, { color: colors.textSecondary }]}>Designated: {SHIFTS.shift_1.audience}</Text>
            </View>
          </View>

          <View style={styles.shiftCard}>
            <View style={[styles.shiftDot, { backgroundColor: '#10b981' }]} />
            <View style={styles.shiftInfo}>
              <Text style={[styles.shiftName, { color: colors.text }]}>{SHIFTS.shift_2.name}</Text>
              <Text style={[styles.shiftTime, { color: colors.primary }]}>{SHIFTS.shift_2.timing}</Text>
              <Text style={[styles.shiftAudience, { color: colors.textSecondary }]}>Designated: {SHIFTS.shift_2.audience}</Text>
            </View>
          </View>

          <View style={styles.shiftCard}>
            <View style={[styles.shiftDot, { backgroundColor: '#f59e0b' }]} />
            <View style={styles.shiftInfo}>
              <Text style={[styles.shiftName, { color: colors.text }]}>{SHIFTS.shift_3.name}</Text>
              <Text style={[styles.shiftTime, { color: colors.primary }]}>{SHIFTS.shift_3.timing}</Text>
              <Text style={[styles.shiftAudience, { color: colors.textSecondary }]}>Designated: {SHIFTS.shift_3.audience}</Text>
            </View>
          </View>

          {/* GPS Coordinates Details */}
          <View style={[styles.geofenceBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.geofenceHeader}>
              <Ionicons name="location" size={18} color="#ef4444" />
              <Text style={[styles.geofenceTitle, { color: colors.text }]}>{GEOFENCE_CONFIG.name}</Text>
            </View>
            <Text style={[styles.geofenceCoord, { color: colors.textSecondary }]}>
              Lat: {GEOFENCE_CONFIG.latitude.toFixed(6)} • Lng: {GEOFENCE_CONFIG.longitude.toFixed(6)}
            </Text>
            <Text style={[styles.geofenceRadius, { color: colors.textSecondary }]}>
              Allowed Punch Radius: {GEOFENCE_CONFIG.radiusMeters} Meters
            </Text>
          </View>
        </View>

        {/* Server & System Diagnostics */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>System Diagnostics</Text>

          <View style={styles.diagRow}>
            <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>Portal Environment</Text>
            <Text style={[styles.diagVal, { color: colors.text }]}>Production v2.4.0</Text>
          </View>

          <View style={styles.diagRow}>
            <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>Live Cloud Server</Text>
            <Text style={[styles.diagVal, { color: colors.primary }]} numberOfLines={1}>
              aparaitech-software.onrender.com
            </Text>
          </View>

          <View style={styles.diagRow}>
            <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>Hardware Biometrics</Text>
            <Text style={[styles.diagVal, { color: biometricAvailable ? '#10b981' : '#f59e0b' }]}>
              {biometricAvailable ? 'Supported & Enabled' : 'Not Supported / Unavailable'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.testServerBtn, { borderColor: colors.primary }]}
            onPress={handleTestServer}
            disabled={testingServer}
          >
            {testingServer ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Ionicons name="pulse" size={16} color={colors.primary} />
                <Text style={[styles.testServerText, { color: colors.primary }]}>Test Server Health</Text>
              </>
            )}
          </TouchableOpacity>

          {serverStatus && (
            <View style={[styles.statusBox, { backgroundColor: serverStatus.ok ? '#10b98115' : '#ef444415' }]}>
              <Ionicons
                name={serverStatus.ok ? 'checkmark-circle' : 'alert-circle'}
                size={16}
                color={serverStatus.ok ? '#10b981' : '#ef4444'}
              />
              <Text style={[styles.statusBoxText, { color: serverStatus.ok ? '#10b981' : '#ef4444' }]}>
                {serverStatus.ok
                  ? `Server online • Latency: ${serverStatus.latency}ms`
                  : `Server unreachable: ${serverStatus.error}`}
              </Text>
            </View>
          )}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ffffff" />
          <Text style={styles.logoutBtnText}>Sign Out of Work Portal</Text>
        </TouchableOpacity>

        {/* Corporate Copyright */}
        <Text style={[styles.copyText, { color: colors.textSecondary }]}>
          Aparaitech Software & Tech Solutions Pvt. Ltd.{'\n'}All Rights Reserved • Internal HRMS Portal
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backBtn: {
    marginRight: 14
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700'
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  sectionCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12
  },
  settingLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10
  },
  settingTextWrap: {
    marginLeft: 12,
    flex: 1
  },
  settingName: {
    fontSize: 14,
    fontWeight: '600'
  },
  settingDesc: {
    fontSize: 11,
    marginTop: 2
  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8
  },
  langChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center'
  },
  langChipText: {
    fontSize: 12
  },
  shiftCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  shiftDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    marginRight: 10
  },
  shiftInfo: {
    flex: 1
  },
  shiftName: {
    fontSize: 13,
    fontWeight: '700'
  },
  shiftTime: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1
  },
  shiftAudience: {
    fontSize: 11,
    marginTop: 1
  },
  geofenceBox: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    marginTop: 6
  },
  geofenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  geofenceTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6
  },
  geofenceCoord: {
    fontSize: 11,
    marginTop: 2
  },
  geofenceRadius: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600'
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#cbd5e150'
  },
  diagLabel: {
    fontSize: 12
  },
  diagVal: {
    fontSize: 12,
    fontWeight: '700',
    maxWidth: '50%'
  },
  testServerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 12
  },
  testServerText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 10
  },
  statusBoxText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 20
  },
  logoutBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8
  },
  copyText: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 20
  }
});
