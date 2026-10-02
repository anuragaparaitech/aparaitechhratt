import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../services/api';

export default function LoginScreen({ navigation }) {
  const { loginWithCredentials, loginWithBiometrics, biometricAvailable, biometricEnrolled } = useAuth();
  const { theme } = useTheme();

  const [authMode, setAuthMode] = useState('password'); // 'password' | 'passcode'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpStep, setOtpStep] = useState(1); // 1: enter email, 2: enter otp & new pwd
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Required Fields', 'Please enter your official email and password.');
      return;
    }
    setLoading(true);
    try {
      await loginWithCredentials(email.trim(), password);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      Alert.alert('Authentication Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricUnlock = async () => {
    try {
      await loginWithBiometrics();
    } catch (err) {
      Alert.alert('Biometric Login', err.message);
    }
  };

  const handleRequestOtp = async () => {
    if (!forgotEmail.trim()) {
      Alert.alert('Email Required', 'Please enter your registered company email.');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await authAPI.forgotPassword(forgotEmail.trim());
      Alert.alert('OTP Sent', res.message || 'Check your email for the 6-digit OTP code.');
      if (res.otpPreview) {
        setOtpCode(res.otpPreview); // Auto-fill in dev preview
      }
      setOtpStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP.';
      Alert.alert('Error', msg);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || !newPassword) {
      Alert.alert('Required Fields', 'Please enter the OTP code and your new password.');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await authAPI.verifyOtp(forgotEmail.trim(), otpCode.trim(), newPassword);
      Alert.alert('Success', res.message || 'Password has been reset successfully. Please login.');
      setForgotModal(false);
      setOtpStep(1);
      setForgotEmail('');
      setOtpCode('');
      setNewPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid or expired OTP.';
      Alert.alert('Verification Failed', msg);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.primary }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>⚡</Text>
          </View>
          <Text style={styles.brandTitle}>APARAITECH SOFTWARE</Text>
          <Text style={styles.brandSubtitle}>Company Work Portal • Mobile Suite</Text>
        </View>

        {/* Card Container */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          {/* Auth Method Selector */}
          <View style={styles.methodToggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, authMode === 'password' && styles.toggleBtnActive]}
              onPress={() => setAuthMode('password')}
            >
              <Text style={[styles.toggleText, authMode === 'password' && styles.toggleTextActive]}>
                Email & Password
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, authMode === 'passcode' && styles.toggleBtnActive]}
              onPress={() => {
                setAuthMode('passcode');
                navigation.navigate('Passcode');
              }}
            >
              <Text style={[styles.toggleText, authMode === 'passcode' && styles.toggleTextActive]}>
                4-Digit PIN
              </Text>
            </TouchableOpacity>
          </View>

          {/* Email & Password Form */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Official Work Email</Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              placeholder="e.g. anurag@aparaitech.org"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Account Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1, color: theme.text, borderColor: theme.border }]}
                placeholder="Enter password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(v => !v)}
              >
                <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => {
              setForgotEmail(email);
              setForgotModal(true);
            }}
          >
            <Text style={styles.forgotText}>Forgot Password? (Get OTP)</Text>
          </TouchableOpacity>

          {/* Primary Login Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.accent }]}
            onPress={handleEmailLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign In to Work Portal</Text>
            )}
          </TouchableOpacity>

          {/* Alternative Biometric & Face Options */}
          <View style={styles.quickAuthRow}>
            {/* Camera Face Recognition */}
            <TouchableOpacity
              style={styles.altAuthBtn}
              onPress={() => navigation.navigate('FaceLogin')}
            >
              <Text style={styles.altAuthIcon}>📸</Text>
              <Text style={[styles.altAuthLabel, { color: theme.text }]}>Face Login</Text>
            </TouchableOpacity>

            {/* Biometric Fingerprint / Face ID */}
            {biometricAvailable && biometricEnrolled && (
              <TouchableOpacity
                style={styles.altAuthBtn}
                onPress={handleBiometricUnlock}
              >
                <Text style={styles.altAuthIcon}>👆</Text>
                <Text style={[styles.altAuthLabel, { color: theme.text }]}>Biometrics</Text>
              </TouchableOpacity>
            )}

            {/* 4-Digit Passcode */}
            <TouchableOpacity
              style={styles.altAuthBtn}
              onPress={() => navigation.navigate('Passcode')}
            >
              <Text style={styles.altAuthIcon}>🔢</Text>
              <Text style={[styles.altAuthLabel, { color: theme.text }]}>PIN Pad</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security Notice */}
        <Text style={styles.securityFooter}>
          🔒 Protected by Master Terminal Gatekeeper • 256-Bit SSL Encryption
        </Text>
      </ScrollView>

      {/* Forgot Password OTP Modal */}
      <Modal visible={forgotModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Reset Password</Text>
              <TouchableOpacity onPress={() => setForgotModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {otpStep === 1 ? (
              <>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  Enter your registered email address to receive a secure 6-digit OTP.
                </Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border, marginTop: 12 }]}
                  placeholder="Official Email"
                  placeholderTextColor="#94a3b8"
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: theme.accent, marginTop: 16 }]}
                  onPress={handleRequestOtp}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Send OTP Code</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  Enter the 6-digit code sent to {forgotEmail} and choose your new password.
                </Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border, marginTop: 12 }]}
                  placeholder="6-Digit OTP"
                  placeholderTextColor="#94a3b8"
                  value={otpCode}
                  onChangeText={setOtpCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border, marginTop: 12 }]}
                  placeholder="New Password"
                  placeholderTextColor="#94a3b8"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: theme.success, marginTop: 16 }]}
                  onPress={handleVerifyOtp}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Verify OTP & Reset Password</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%'
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 28
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6
  },
  logoIcon: {
    fontSize: 32,
    color: '#ffffff'
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#93c5fd',
    marginTop: 4,
    fontWeight: '500'
  },
  card: {
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8
  },
  methodToggle: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10
  },
  toggleBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b'
  },
  toggleTextActive: {
    color: '#0a192f',
    fontWeight: '800'
  },
  inputGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#f8fafc'
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    padding: 6
  },
  eyeText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '700'
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20
  },
  forgotText: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '600'
  },
  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800'
  },
  quickAuthRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  altAuthBtn: {
    alignItems: 'center',
    gap: 4
  },
  altAuthIcon: {
    fontSize: 26
  },
  altAuthLabel: {
    fontSize: 11,
    fontWeight: '700'
  },
  securityFooter: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 24
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 47, 0.75)',
    justifyContent: 'center',
    padding: 20
  },
  modalCard: {
    borderRadius: 20,
    padding: 24
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800'
  },
  modalCloseText: {
    fontSize: 20,
    color: '#94a3b8',
    padding: 4
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18
  }
});
