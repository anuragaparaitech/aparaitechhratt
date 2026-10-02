import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Navigation & Tabs
import BottomTabNavigator from './BottomTabNavigator';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import PasscodeScreen from '../screens/PasscodeScreen';
import FaceLoginScreen from '../screens/FaceLoginScreen';

// Feature Detail Screens
import DailyReportScreen from '../screens/DailyReportScreen';
import MailBlastScreen from '../screens/MailBlastScreen';
import PerformanceScreen from '../screens/PerformanceScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import RevenueTrackerScreen from '../screens/RevenueTrackerScreen';
import LeaveManagementScreen from '../screens/LeaveManagementScreen';
import DocumentCenterScreen from '../screens/DocumentCenterScreen';
import AnnouncementsScreen from '../screens/AnnouncementsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import TaskManagementScreen from '../screens/TaskManagementScreen';
import MessageCenterScreen from '../screens/MessageCenterScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { currentUser, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: '#0a192f' }]}>
        <View style={styles.splashBrand}>
          <Text style={styles.splashTitle}>APARAITECH</Text>
          <Text style={styles.splashSubtitle}>SOFTWARE WORK PORTAL</Text>
        </View>
        <ActivityIndicator size="large" color="#3b82f6" style={styles.spinner} />
        <Text style={styles.loadingNote}>Verifying Secure Session...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!currentUser ? (
        // Unauthenticated Stack
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="PasscodeLogin" component={PasscodeScreen} />
          <Stack.Screen name="FaceLogin" component={FaceLoginScreen} />
        </Stack.Group>
      ) : (
        // Authenticated Stack
        <Stack.Group>
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen name="DailyReport" component={DailyReportScreen} />
          <Stack.Screen name="MailBlast" component={MailBlastScreen} />
          <Stack.Screen name="Performance" component={PerformanceScreen} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          <Stack.Screen name="RevenueTracker" component={RevenueTrackerScreen} />
          <Stack.Screen name="LeaveManagement" component={LeaveManagementScreen} />
          <Stack.Screen name="Documents" component={DocumentCenterScreen} />
          <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="AttendanceDetail" component={AttendanceScreen} />
          <Stack.Screen name="TaskDetail" component={TaskManagementScreen} />
          <Stack.Screen name="MessageDetail" component={MessageCenterScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  splashBrand: {
    alignItems: 'center',
    marginBottom: 20
  },
  splashTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2
  },
  splashSubtitle: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 4
  },
  spinner: {
    marginVertical: 20
  },
  loadingNote: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500'
  }
});
