import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI, analyticsAPI } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const { user, login } = useAuth();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Edit Profile Form State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || '');
  const [address, setAddress] = useState(user?.address || '');

  // Change Password Modal State
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    fetchProfilePerformance();
  }, []);

  const fetchProfilePerformance = async () => {
    try {
      const res = await analyticsAPI.getMyPerformance();
      if (res && res.success) {
        setStats(res);
      }
    } catch (err) {
      console.warn('Profile performance fetch error:', err);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const res = await authAPI.updateProfile({
        name,
        phone,
        emergencyContact,
        address
      });

      if (res && res.success) {
        Alert.alert('Updated', 'Your profile details have been saved.');
        setIsEditing(false);
        // Refresh local auth state if supported
      } else {
        Alert.alert('Update Failed', res?.message || 'Could not save profile updates.');
      }
    } catch (err) {
      console.warn('Profile save error:', err);
      Alert.alert('Error', err.response?.data?.message || 'Server error updating profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Missing Fields', 'Please fill all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Security Policy', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await authAPI.changePassword(user.email, oldPassword, newPassword);
      if (res && res.success) {
        Alert.alert('Success', 'Your password has been changed securely.');
        setPasswordModalVisible(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Failed', res?.message || 'Invalid current password.');
      }
    } catch (err) {
      console.warn('Change password error:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to change password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const getRoleBadgeTitle = (role) => {
    if (role === 'admin') return 'System Administrator';
    if (role === 'manager') return 'Operations Manager';
    if (user?.department?.toLowerCase().includes('software')) return 'Software Developer';
    return 'Business Development Associate';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleCol}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Employee Profile</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Identity, Tenancy & Security Details
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.editIconBtn, { backgroundColor: colors.primary + '15' }]}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Ionicons name={isEditing ? 'close' : 'create-outline'} size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.avatarWrap}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarLetter}>{user?.name?.charAt(0)?.toUpperCase() || 'A'}</Text>
            </View>
            <View style={styles.activeDot} />
          </View>

          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'Aparaitech Member'}</Text>
          <Text style={[styles.userRoleTag, { color: colors.primary }]}>{getRoleBadgeTitle(user?.role)}</Text>
          <Text style={[styles.userDept, { color: colors.textSecondary }]}>
            {user?.department || 'Business Development'} • ID: {user?.empId || 'AP-2026'}
          </Text>

          <View style={[styles.securityTagsRow, { borderTopColor: colors.border }]}>
            <View style={styles.tagItem}>
              <Ionicons name="finger-print" size={14} color="#10b981" />
              <Text style={styles.tagText}>Biometric Registered</Text>
            </View>
            <View style={styles.tagItem}>
              <Ionicons name="location" size={14} color="#3b82f6" />
              <Text style={styles.tagText}>Optenix Geofence 200m</Text>
            </View>
          </View>
        </View>

        {/* Live Performance & Commercial Snapshot */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Conversions</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats?.monthlyTotals?.conversions ?? stats?.todayReport?.todayConversion ?? 0}
            </Text>
            <Text style={styles.statSub}>Total Certified</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Revenue Yield</Text>
            <Text style={[styles.statValue, { color: '#10b981' }]}>
              ₹{((stats?.monthlyTotals?.conversions ?? stats?.todayReport?.todayConversion ?? 0) * 6000).toLocaleString('en-IN')}
            </Text>
            <Text style={styles.statSub}>@ ₹6,000 / seat</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Calls Logged</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {stats?.monthlyTotals?.connectedCalls ?? stats?.todayReport?.totalConnectedCalls ?? 0}
            </Text>
            <Text style={styles.statSub}>Connected</Text>
          </View>
        </View>

        {/* Personal & Workplace Information Form */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>General Information</Text>

          <View style={styles.infoField}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={[styles.inputEdit, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                value={name}
                onChangeText={setName}
              />
            ) : (
              <Text style={[styles.fieldVal, { color: colors.text }]}>{user?.name || '-'}</Text>
            )}
          </View>

          <View style={styles.infoField}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Official Corporate Email</Text>
            <Text style={[styles.fieldVal, { color: colors.text }]}>{user?.email || '-'}</Text>
          </View>

          <View style={styles.infoField}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Contact Phone</Text>
            {isEditing ? (
              <TextInput
                style={[styles.inputEdit, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Enter 10-digit phone"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={[styles.fieldVal, { color: colors.text }]}>{user?.phone || 'Not Specified'}</Text>
            )}
          </View>

          <View style={styles.infoField}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Emergency Contact</Text>
            {isEditing ? (
              <TextInput
                style={[styles.inputEdit, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                value={emergencyContact}
                onChangeText={setEmergencyContact}
                placeholder="Guardian / Emergency contact"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={[styles.fieldVal, { color: colors.text }]}>{user?.emergencyContact || 'Not Specified'}</Text>
            )}
          </View>

          <View style={styles.infoField}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Residential Address</Text>
            {isEditing ? (
              <TextInput
                style={[styles.inputEdit, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                value={address}
                onChangeText={setAddress}
                placeholder="Address details"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={[styles.fieldVal, { color: colors.text }]}>{user?.address || 'Hinjawadi, Pune, Maharashtra'}</Text>
            )}
          </View>

          {isEditing && (
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSaveProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Profile Changes</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Security & Action Hub */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Security & Quick Access</Text>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => setPasswordModalVisible(true)}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="key-outline" size={20} color={colors.primary} />
              <Text style={[styles.menuText, { color: colors.text }]}>Change Account Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => navigation.navigate('PasscodeLogin')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="dialpad-outline" size={20} color="#10b981" />
              <Text style={[styles.menuText, { color: colors.text }]}>Reset 4-Digit Passcode PIN</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => navigation.navigate('Documents')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="folder-open-outline" size={20} color="#8b5cf6" />
              <Text style={[styles.menuText, { color: colors.text }]}>View Letters & Documents</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.menuText, { color: colors.text }]}>App Settings & Preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalHeading, { color: colors.text }]}>Change Password</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalFieldLabel, { color: colors.textSecondary }]}>Current Password</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Enter current password"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={[styles.modalFieldLabel, { color: colors.textSecondary }]}>New Password</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Minimum 6 characters"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={[styles.modalFieldLabel, { color: colors.textSecondary }]}>Confirm New Password</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-type new password"
              placeholderTextColor={colors.textSecondary}
            />

            <TouchableOpacity
              style={[styles.modalSubmitBtn, { backgroundColor: colors.primary }]}
              onPress={handleChangePassword}
              disabled={updatingPassword}
            >
              {updatingPassword ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalSubmitText}>Update Password</Text>
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
  headerTitleCol: {
    flex: 1
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700'
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  editIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 12
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800'
  },
  activeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderWidth: 2,
    borderColor: '#ffffff'
  },
  userName: {
    fontSize: 20,
    fontWeight: '800'
  },
  userRoleTag: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4
  },
  userDept: {
    fontSize: 12,
    marginTop: 4
  },
  securityTagsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 12
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 5
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4
  },
  statSub: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 2
  },
  sectionCard: {
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14
  },
  infoField: {
    marginBottom: 14
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4
  },
  fieldVal: {
    fontSize: 14,
    fontWeight: '600'
  },
  inputEdit: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14
  },
  saveBtn: {
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700'
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000070',
    justifyContent: 'center',
    padding: 20
  },
  modalBox: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '700'
  },
  modalFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6
  },
  modalInput: {
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14
  },
  modalSubmitBtn: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20
  },
  modalSubmitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700'
  }
});
