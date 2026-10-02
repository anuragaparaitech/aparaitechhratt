import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { reportsAPI, analyticsAPI, attendanceAPI, messageAPI, announcementAPI } from '../services/api';
import { SHIFTS, REVENUE_PER_CONVERSION } from '../config/env';

export default function HomeScreen({ navigation }) {
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayReportStatus, setTodayReportStatus] = useState({ submitted: false });
  const [performance, setPerformance] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [announcements, setAnnouncements] = useState([]);

  const userShiftKey = currentUser?.shift || (currentUser?.department === 'Development' ? 'shift_1' : 'shift_2');
  const userShift = SHIFTS[userShiftKey] || SHIFTS.shift_1;

  const fetchData = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      // 1. Fetch Today's Daily Report status
      const repStatus = await reportsAPI.getTodayStatus().catch(() => ({ submitted: false }));
      setTodayReportStatus(repStatus);

      // 2. Fetch My Performance
      const perfRes = await analyticsAPI.getMyPerformance().catch(() => null);
      if (perfRes?.success) {
        setPerformance(perfRes.data);
      }

      // 3. Fetch Attendance
      const attData = await attendanceAPI.getAll({ email: currentUser?.email }).catch(() => null);
      if (attData) {
        const records = Array.isArray(attData) ? attData : (attData.data || attData.records || []);
        const todayRec = records.find(r => r.date === todayStr);
        setTodayAttendance(todayRec || null);

        const sessions = Array.isArray(attData) ? [] : (attData.liveSessions || []);
        const userSession = sessions.find(s => s.employeeEmail === currentUser?.email);
        setActiveSession(userSession || null);
      }

      // 4. Fetch Message Unread Count
      const msgRes = await messageAPI.getEmployeeMessages().catch(() => null);
      if (msgRes?.success) {
        setUnreadCount(msgRes.unreadCount || 0);
      }

      // 5. Fetch Announcements
      const annRes = await announcementAPI.getAll().catch(() => null);
      if (annRes?.success) {
        setAnnouncements(annRes.data || []);
      }
    } catch (err) {
      console.warn('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser?.email]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const todayRevenue = (performance?.today?.todayConversions || 0) * REVENUE_PER_CONVERSION;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.accent]} />
        }
      >
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greetingText}>Welcome back,</Text>
              <Text style={styles.userNameText}>{currentUser?.name || 'Associate'}</Text>
            </View>
            <View style={styles.roleChip}>
              <Text style={styles.roleChipText}>
                {currentUser?.role === 'admin' ? 'Super Admin' : (currentUser?.department || 'BDA')}
              </Text>
            </View>
          </View>

          <View style={styles.shiftBar}>
            <Text style={styles.shiftBarText}>
              🕒 {userShift.name} ({userShift.display})
            </Text>
          </View>
        </View>

        {/* 7 PM Daily Report Reminder Banner */}
        {!todayReportStatus.submitted && (
          <TouchableOpacity
            style={styles.reminderBanner}
            onPress={() => navigation.navigate('DailyReport')}
          >
            <Text style={styles.reminderIcon}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.reminderTitle}>Daily Working Report Pending</Text>
              <Text style={styles.reminderSubtitle}>
                Please submit today's connected calls, groups, and conversions.
              </Text>
            </View>
            <Text style={styles.reminderArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Live Attendance Card */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Today's Attendance Status</Text>
            <View style={[
              styles.statusBadge,
              activeSession ? styles.badgeActive : (todayAttendance?.checkOut ? styles.badgeCompleted : styles.badgePending)
            ]}>
              <Text style={[
                styles.statusBadgeText,
                activeSession ? styles.badgeActiveText : (todayAttendance?.checkOut ? styles.badgeCompletedText : styles.badgePendingText)
              ]}>
                {activeSession ? '● CHECKED IN' : (todayAttendance?.checkOut ? 'COMPLETED' : 'NOT CHECKED IN')}
              </Text>
            </View>
          </View>

          <View style={styles.attDetailsRow}>
            <View style={styles.attCol}>
              <Text style={styles.attLabel}>Check-In</Text>
              <Text style={[styles.attValue, { color: theme.text }]}>
                {todayAttendance?.checkIn || activeSession?.checkInTime || '—'}
              </Text>
            </View>
            <View style={styles.attDivider} />
            <View style={styles.attCol}>
              <Text style={styles.attLabel}>Check-Out</Text>
              <Text style={[styles.attValue, { color: theme.text }]}>
                {todayAttendance?.checkOut || '—'}
              </Text>
            </View>
            <View style={styles.attDivider} />
            <View style={styles.attCol}>
              <Text style={styles.attLabel}>Hours</Text>
              <Text style={[styles.attValue, { color: theme.text }]}>
                {todayAttendance?.workingHours ? `${todayAttendance.workingHours}h` : '—'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.punchActionBtn, { backgroundColor: theme.accent }]}
            onPress={() => navigation.navigate('Attendance')}
          >
            <Text style={styles.punchActionBtnText}>
              {activeSession ? '🔴 Check-Out with Face & GPS' : '🟢 Check-In with Face & GPS'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Core Quick Action Buttons */}
        <Text style={[styles.sectionHeading, { color: theme.text }]}>Working Portal Actions</Text>
        <View style={styles.actionsGrid}>
          {/* Daily Report Button */}
          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}
            onPress={() => navigation.navigate('DailyReport')}
          >
            <Text style={styles.tileIcon}>📋</Text>
            <Text style={[styles.tileTitle, { color: '#14532d' }]}>Daily Report</Text>
            <Text style={[styles.tileSub, { color: '#16a34a' }]}>
              {todayReportStatus.submitted ? '✅ Submitted (Edit)' : '⏳ Submit Form'}
            </Text>
          </TouchableOpacity>

          {/* Mail Blast Report Button */}
          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }]}
            onPress={() => navigation.navigate('MailBlast')}
          >
            <Text style={styles.tileIcon}>🚀</Text>
            <Text style={[styles.tileTitle, { color: '#0369a1' }]}>Mail Blast</Text>
            <Text style={[styles.tileSub, { color: '#0284c7' }]}>Campaign Outreach</Text>
          </TouchableOpacity>

          {/* Message Centre Button with Unread Badge */}
          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: '#fdf4ff', borderColor: '#f5d0fe' }]}
            onPress={() => navigation.navigate('Messages')}
          >
            <View style={styles.tileHeaderRow}>
              <Text style={styles.tileIcon}>✉️</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tileTitle, { color: '#581c87' }]}>Message Centre</Text>
            <Text style={[styles.tileSub, { color: '#7e22ce' }]}>
              {unreadCount > 0 ? `${unreadCount} unread notices` : 'Inbox & Directives'}
            </Text>
          </TouchableOpacity>

          {/* Performance Dashboard Button */}
          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}
            onPress={() => navigation.navigate('Performance')}
          >
            <Text style={styles.tileIcon}>📊</Text>
            <Text style={[styles.tileTitle, { color: '#78350f' }]}>My Performance</Text>
            <Text style={[styles.tileSub, { color: '#d97706' }]}>Trends & Targets</Text>
          </TouchableOpacity>
        </View>

        {/* Real-Time Performance & Revenue Snapshot */}
        <Text style={[styles.sectionHeading, { color: theme.text }]}>Today's Commercial Output</Text>
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={styles.kpiLabel}>CONNECTED CALLS</Text>
            <Text style={[styles.kpiValue, { color: theme.accent }]}>
              {performance?.today?.connectedCalls || 0}
            </Text>
            <Text style={styles.kpiSub}>&gt;3m: {performance?.today?.callsAbove3Min || 0}</Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={styles.kpiLabel}>CONVERSIONS</Text>
            <Text style={[styles.kpiValue, { color: theme.success }]}>
              {performance?.today?.todayConversions || 0}
            </Text>
            <Text style={styles.kpiSub}>Month: {performance?.monthly?.totalConversions || 0}</Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={styles.kpiLabel}>REVENUE (₹6K)</Text>
            <Text style={[styles.kpiValue, { color: '#059669' }]}>
              ₹{(todayRevenue || 0).toLocaleString('en-IN')}
            </Text>
            <Text style={styles.kpiSub}>Month: ₹{(performance?.monthly?.totalRevenue || 0).toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Quick Links Row: Leaderboard, Tasks, Documents, Leaves */}
        <Text style={[styles.sectionHeading, { color: theme.text }]}>Quick Access Hub</Text>
        <View style={styles.hubGrid}>
          <TouchableOpacity
            style={[styles.hubTile, { backgroundColor: theme.cardBackground }]}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Text style={styles.hubIcon}>🏆</Text>
            <Text style={[styles.hubTitle, { color: theme.text }]}>Leaderboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.hubTile, { backgroundColor: theme.cardBackground }]}
            onPress={() => navigation.navigate('Revenue')}
          >
            <Text style={styles.hubIcon}>💰</Text>
            <Text style={[styles.hubTitle, { color: theme.text }]}>Revenue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.hubTile, { backgroundColor: theme.cardBackground }]}
            onPress={() => navigation.navigate('Tasks')}
          >
            <Text style={styles.hubIcon}>✅</Text>
            <Text style={[styles.hubTitle, { color: theme.text }]}>Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.hubTile, { backgroundColor: theme.cardBackground }]}
            onPress={() => navigation.navigate('Leaves')}
          >
            <Text style={styles.hubIcon}>🏖️</Text>
            <Text style={[styles.hubTitle, { color: theme.text }]}>Leaves</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.hubTile, { backgroundColor: theme.cardBackground }]}
            onPress={() => navigation.navigate('Documents')}
          >
            <Text style={styles.hubIcon}>📁</Text>
            <Text style={[styles.hubTitle, { color: theme.text }]}>Documents</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.hubTile, { backgroundColor: theme.cardBackground }]}
            onPress={() => navigation.navigate('Announcements')}
          >
            <Text style={styles.hubIcon}>📢</Text>
            <Text style={[styles.hubTitle, { color: theme.text }]}>Notices</Text>
          </TouchableOpacity>
        </View>

        {/* Latest Announcement Preview */}
        {announcements.length > 0 && (
          <View style={[styles.announcementCard, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
            <View style={styles.annHeader}>
              <Text style={styles.annTag}>📢 LATEST NOTICE</Text>
              <Text style={styles.annDate}>
                {new Date(announcements[0].createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.annTitle}>{announcements[0].title}</Text>
            <Text style={styles.annBody} numberOfLines={2}>
              {announcements[0].content}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30
  },
  heroBanner: {
    backgroundColor: '#0a192f',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  greetingText: {
    fontSize: 12,
    color: '#93c5fd',
    fontWeight: '500'
  },
  userNameText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff'
  },
  roleChip: {
    backgroundColor: 'rgba(37, 99, 235, 0.3)',
    borderWidth: 1,
    borderColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20
  },
  roleChipText: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  shiftBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  shiftBarText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600'
  },
  reminderBanner: {
    backgroundColor: '#fffbeb',
    borderColor: '#f59e0b',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12
  },
  reminderIcon: {
    fontSize: 22
  },
  reminderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400e'
  },
  reminderSubtitle: {
    fontSize: 11,
    color: '#b45309',
    marginTop: 2
  },
  reminderArrow: {
    fontSize: 20,
    color: '#d97706',
    fontWeight: '700'
  },
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
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
    marginBottom: 14
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  badgeActive: {
    backgroundColor: '#dcfce7'
  },
  badgeActiveText: {
    color: '#15803d',
    fontSize: 10,
    fontWeight: '800'
  },
  badgeCompleted: {
    backgroundColor: '#e0f2fe'
  },
  badgeCompletedText: {
    color: '#0369a1',
    fontSize: 10,
    fontWeight: '800'
  },
  badgePending: {
    backgroundColor: '#f1f5f9'
  },
  badgePendingText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800'
  },
  attDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 14
  },
  attCol: {
    alignItems: 'center'
  },
  attLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4
  },
  attValue: {
    fontSize: 14,
    fontWeight: '700'
  },
  attDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0'
  },
  punchActionBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  punchActionBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.2
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20
  },
  actionTile: {
    width: '48%',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1
  },
  tileHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tileIcon: {
    fontSize: 24,
    marginBottom: 8
  },
  tileTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2
  },
  tileSub: {
    fontSize: 11,
    fontWeight: '600'
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800'
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20
  },
  kpiCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center'
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 4,
    textAlign: 'center'
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2
  },
  kpiSub: {
    fontSize: 9,
    color: '#94a3b8',
    textAlign: 'center'
  },
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20
  },
  hubTile: {
    width: '31%',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1
  },
  hubIcon: {
    fontSize: 22,
    marginBottom: 6
  },
  hubTitle: {
    fontSize: 12,
    fontWeight: '700'
  },
  announcementCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginTop: 4
  },
  annHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  annTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803d'
  },
  annDate: {
    fontSize: 10,
    color: '#16a34a'
  },
  annTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#14532d',
    marginBottom: 4
  },
  annBody: {
    fontSize: 12,
    color: '#166534',
    lineHeight: 16
  }
});
