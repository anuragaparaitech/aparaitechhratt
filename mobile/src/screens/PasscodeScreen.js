import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function PasscodeScreen({ navigation }) {
  const { loginWithPasscode } = useAuth();
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const verifyPin = async (completedPin) => {
    setLoading(true);
    try {
      await loginWithPasscode(email.trim() || null, completedPin);
    } catch (err) {
      setPin('');
      const msg = err.response?.data?.message || err.message || 'Incorrect 4-digit passcode';
      Alert.alert('Access Denied', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>4-Digit Security PIN</Text>
        <Text style={styles.subtitle}>Enter your personal passcode to unlock work portal</Text>
      </View>

      {/* Optional Email Identifier */}
      <View style={styles.emailContainer}>
        <TextInput
          style={styles.emailInput}
          placeholder="Optional: Enter email to unlock specific account"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      {/* PIN Dots Indicator */}
      <View style={styles.dotsRow}>
        {[0, 1, 2, 3].map((index) => {
          const filled = pin.length > index;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                filled ? styles.dotFilled : styles.dotEmpty
              ]}
            />
          );
        })}
      </View>

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.loaderText}>Verifying Passcode...</Text>
        </View>
      )}

      {/* Keypad */}
      <View style={styles.keypad}>
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['C', '0', '⌫']
        ].map((row, rIdx) => (
          <View key={rIdx} style={styles.keyRow}>
            {row.map((key) => {
              const isSpecial = key === 'C' || key === '⌫';
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.keyBtn, isSpecial && styles.specialKeyBtn]}
                  onPress={() => {
                    if (key === 'C') handleClear();
                    else if (key === '⌫') handleDelete();
                    else handleKeyPress(key);
                  }}
                  disabled={loading}
                >
                  <Text style={[styles.keyText, isSpecial && styles.specialKeyText]}>
                    {key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <Text style={styles.defaultHint}>Default initial passcode is 1234. Changeable in Settings.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    justifyContent: 'space-between',
    paddingBottom: 30
  },
  header: {
    alignItems: 'center'
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  backText: {
    color: '#93c5fd',
    fontSize: 16,
    fontWeight: '700'
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 10
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 6,
    textAlign: 'center'
  },
  emailContainer: {
    marginVertical: 10
  },
  emailInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    textAlign: 'center'
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 20
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10
  },
  dotEmpty: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'transparent'
  },
  dotFilled: {
    backgroundColor: '#2563eb',
    borderWidth: 2,
    borderColor: '#60a5fa'
  },
  loader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  loaderText: {
    color: '#93c5fd',
    fontSize: 13
  },
  keypad: {
    gap: 12,
    alignItems: 'center'
  },
  keyRow: {
    flexDirection: 'row',
    gap: 20
  },
  keyBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)'
  },
  keyText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff'
  },
  specialKeyBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)'
  },
  specialKeyText: {
    fontSize: 20,
    color: '#93c5fd'
  },
  defaultHint: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 11
  }
});
