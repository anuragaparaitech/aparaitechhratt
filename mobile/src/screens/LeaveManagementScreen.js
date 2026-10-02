import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { leaveAPI } from '../services/api';

export default function LeaveManagementScreen() {
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [activeTab, setActiveTab] = useState('apply'); // 'apply' | 'my-leaves' | 'manager'

  // Application Form
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('2026-10-10');
  const [endDate, setEndDate] = useState('2026-10-11');
  const [totalDays, setTotalDays] = useState('2');
  const [reason, setReason] = useState('');
  const [applying, setApplying] = useState(false);

  const isManagerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'hr';

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = (activeTab === 'manager' && isManagerOrAdmin)
        ? await leaveAPI.getAllLeaves()
        : await leaveAPI.getMyLeaves();
      if (res?.success) {
        setLeaves(res.data || []);
      }
    } catch (err) {
      console.warn('Leaves fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'apply') {
      fetchLeaves();
    }
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaves();
  };

  const handleApplyLeave = async () => {
    if (!startDate.trim() || !endDate.trim() || !reason.trim()) {
      Alert.alert('Required Fields', 'Please complete the date range and reason.');
      return;
    }

    setApplying(true);
    try {
      await leaveAPI.apply({
        leaveType,
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        totalDays: Number(totalDays) || 1,
        reason: reason.trim()
      });
      Alert.alert('✅ Leave Submitted', 'Your leave application has been submitted to management for review.');
      setReason('');
      setActiveTab('my-leaves');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setApplying(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await leaveAPI.updateStatus(id, { status });
      Alert.alert('Updated', `Leave application marked as ${status}`);
      fetchLeaves();
    } catch (err) {
      Alert.alert('Error', 'Failed to update leave');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Sub Tabs */}
      <View style={[styles.tabBar, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'apply' && styles.tabItemActive]}
          onPress={() => setActiveTab('apply')}
        >
          <Text style={[styles.tabText, activeTab === 'apply' && styles.tabTextActive]}>
            📝 Apply
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'my-leaves' && styles.tabItemActive]}
          onPress={() => setActiveTab('my-leaves')}
        >
          <Text style={[styles.tabText, activeTab === 'my-leaves' && styles.tabTextActive]}>
            🏖️ My Leaves
          </Text>
        </TouchableOpacity>

        {isManagerOrAdmin && (
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'manager' && styles.tabItemActive]}
            onPress={() => setActiveTab('manager')}
          >
            <Text style={[styles.tabText, activeTab === 'manager' && styles.tabTextActive]}>
              👑 Review ({leaves.filter(l => l.status === 'Pending').length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={activeTab !== 'apply' ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.accent]} /> : undefined}
      >
        {activeTab === 'apply' ? (
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 14 }]}>
              Apply for Time Off / Leave
            </Text>

            {/* Leave Type Selector */}
            <Text style={styles.inputLabel}>Leave Type *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.leaveTypeScroll}>
              {['Casual Leave', 'Sick Leave', 'Privilege Leave', 'Emergency Leave', 'Exam Leave'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, leaveType === t && styles.typeChipActive]}
                  onPress={() => setLeaveType(t)}
                >
                  <Text style={[styles.typeChipText, leaveType === t && styles.typeChipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.dateRow}>
              <View style={styles.dateCol}>
                <Text style={styles.inputLabel}>Start Date (YYYY-MM-DD) *</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  placeholder="2026-10-10"
                  placeholderTextColor="#94a3b8"
                  value={startDate}
                  onChangeText={setStartDate}
                />
              </View>

              <View style={styles.dateCol}>
                <Text style={styles.inputLabel}>End Date (YYYY-MM-DD) *</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  placeholder="2026-10-11"
                  placeholderTextColor="#94a3b8"
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Total Days Count</Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                placeholder="1"
                placeholderTextColor="#94a3b8"
                value={totalDays}
                onChangeText={setTotalDays}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reason / Justification *</Text>
              <TextInput
                style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border }]}
                placeholder="e.g. Attending college practical examination..."
                placeholderTextColor="#94a3b8"
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: theme.accent }]}
              onPress={handleApplyLeave}
              disabled={applying}
            >
              {applying ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.applyBtnText}>Submit Leave Application</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* Leaves List (My Leaves or Manager Review) */
          <View>
            {loading ? (
              <ActivityIndicator color={theme.accent} style={{ marginTop: 30 }} />
            ) : leaves.length === 0 ? (
              <Text style={styles.emptyText}>No leave records found.</Text>
            ) : (
              leaves.map(l => {
                const isPending = l.status === 'Pending';
                const isApproved = l.status === 'Approved';
                return (
                  <View key={l._id} style={[styles.leaveCard, { backgroundColor: theme.cardBackground }]}>
                    <View style={styles.leaveHeader}>
                      <View>
                        <Text style={[styles.leaveTypeTitle, { color: theme.text }]}>{l.leaveType}</Text>
                        <Text style={styles.leaveApplicant}>
                          {l.employeeName} ({l.teamName}) • {l.totalDays} day(s)
                        </Text>
                      </View>
                      <View style={[
                        styles.statusTag,
                        isApproved ? styles.tagApproved : (isPending ? styles.tagPending : styles.tagRejected)
                      ]}>
                        <Text style={styles.statusTagText}>{l.status}</Text>
                      </View>
                    </View>

                    <Text style={styles.leaveDates}>
                      📅 {l.startDate} to {l.endDate}
                    </Text>
                    <Text style={styles.leaveReason}>"{l.reason}"</Text>

                    {/* Manager Approval Controls */}
                    {activeTab === 'manager' && isPending && (
                      <View style={styles.approvalRow}>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.approveBtn]}
                          onPress={() => handleUpdateStatus(l._id, 'Approved')}
                        >
                          <Text style={styles.actionBtnText}>✓ Approve</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionBtn, styles.rejectBtn]}
                          onPress={() => handleUpdateStatus(l._id, 'Rejected')}
                        >
                          <Text style={styles.actionBtnText}>✕ Reject</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })
            )}
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
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8
  },
  tabItemActive: {
    backgroundColor: '#0a192f'
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b'
  },
  tabTextActive: {
    color: '#ffffff'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  card: {
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  inputGroup: {
    marginBottom: 14
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6
  },
  leaveTypeScroll: {
    flexDirection: 'row',
    marginBottom: 14
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8
  },
  typeChipActive: {
    backgroundColor: '#0a192f'
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b'
  },
  typeChipTextActive: {
    color: '#ffffff'
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14
  },
  dateCol: {
    flex: 1
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f8fafc'
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top'
  },
  applyBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8
  },
  applyBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800'
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginVertical: 40
  },
  leaveCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1
  },
  leaveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  leaveTypeTitle: {
    fontSize: 15,
    fontWeight: '800'
  },
  leaveApplicant: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  tagApproved: {
    backgroundColor: '#dcfce7'
  },
  tagPending: {
    backgroundColor: '#fef3c7'
  },
  tagRejected: {
    backgroundColor: '#fee2e2'
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f172a'
  },
  leaveDates: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 6
  },
  leaveReason: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
    marginBottom: 10
  },
  approvalRow: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  approveBtn: {
    backgroundColor: '#16a34a'
  },
  rejectBtn: {
    backgroundColor: '#dc2626'
  },
  actionBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12
  }
});
