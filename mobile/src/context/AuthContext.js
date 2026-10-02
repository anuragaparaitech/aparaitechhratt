import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnrolled, setBiometricEnrolled] = useState(false);
  const inactivityTimerRef = useRef(null);

  // Check hardware biometric support
  useEffect(() => {
    checkBiometrics();
    loadStoredSession();
  }, []);

  // Inactivity auto-logout reset on user activity
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    // 30-minute auto logout timer
    inactivityTimerRef.current = setTimeout(() => {
      if (currentUser) {
        logout('Session expired due to 30 minutes of inactivity');
      }
    }, 30 * 60 * 1000);
  };

  const checkBiometrics = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setBiometricAvailable(compatible);
      if (compatible) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setBiometricEnrolled(enrolled);
      }
    } catch (e) {
      console.warn('Biometric check failed:', e);
    }
  };

  const loadStoredSession = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('aparaitech_token');
      const savedUser = await AsyncStorage.getItem('aparaitech_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setCurrentUser(JSON.parse(savedUser));
        resetInactivityTimer();
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    } finally {
      setLoading(false);
    }
  };

  // 1. Email + Password Login
  const loginWithCredentials = async (email, password) => {
    const res = await authAPI.login(email.trim().toLowerCase(), password);
    if (res.token && res.user) {
      await AsyncStorage.setItem('aparaitech_token', res.token);
      await AsyncStorage.setItem('aparaitech_user', JSON.stringify(res.user));
      setToken(res.token);
      setCurrentUser(res.user);
      resetInactivityTimer();
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  // 2. 4-Digit Passcode PIN Login
  const loginWithPasscode = async (email, passcode) => {
    const res = await authAPI.passcodeLogin(email ? email.trim().toLowerCase() : null, passcode);
    if (res.token && res.user) {
      await AsyncStorage.setItem('aparaitech_token', res.token);
      await AsyncStorage.setItem('aparaitech_user', JSON.stringify(res.user));
      setToken(res.token);
      setCurrentUser(res.user);
      resetInactivityTimer();
      return res.user;
    }
    throw new Error(res.message || 'Passcode verification failed');
  };

  // 3. Biometric Fingerprint / Face ID Quick Unlock
  const loginWithBiometrics = async () => {
    if (!biometricAvailable || !biometricEnrolled) {
      throw new Error('Biometric hardware not available or enrolled on this device');
    }

    const authResult = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Aparaitech Work Portal',
      fallbackLabel: 'Use 4-digit PIN',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false
    });

    if (authResult.success) {
      const savedToken = await AsyncStorage.getItem('aparaitech_token');
      const savedUser = await AsyncStorage.getItem('aparaitech_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setCurrentUser(JSON.parse(savedUser));
        resetInactivityTimer();
        return JSON.parse(savedUser);
      } else {
        throw new Error('Please login once with email or PIN first before using Biometrics');
      }
    } else {
      throw new Error('Biometric authentication cancelled or unverified');
    }
  };

  // 4. Face Recognition Direct Login Session Injection
  const setFaceAuthenticatedUser = async (user, authToken) => {
    await AsyncStorage.setItem('aparaitech_token', authToken);
    await AsyncStorage.setItem('aparaitech_user', JSON.stringify(user));
    setToken(authToken);
    setCurrentUser(user);
    resetInactivityTimer();
  };

  // 5. Update user in state and storage
  const updateUserProfile = async (updatedFields) => {
    const updated = { ...currentUser, ...updatedFields };
    await AsyncStorage.setItem('aparaitech_user', JSON.stringify(updated));
    setCurrentUser(updated);
  };

  // 6. Logout
  const logout = async (reason) => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    try {
      await AsyncStorage.removeItem('aparaitech_token');
      await AsyncStorage.removeItem('aparaitech_user');
    } catch (e) {}
    setToken(null);
    setCurrentUser(null);
    if (reason) {
      console.log('Logged out:', reason);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      user: currentUser,
      token,
      loading,
      biometricAvailable,
      biometricEnrolled,
      loginWithCredentials,
      loginWithPasscode,
      loginWithBiometrics,
      setFaceAuthenticatedUser,
      updateUserProfile,
      logout,
      resetInactivityTimer
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
