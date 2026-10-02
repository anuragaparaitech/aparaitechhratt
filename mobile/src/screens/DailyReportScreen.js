import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { reportsAPI } from '../services/api';
import { REVENUE_PER_CONVERSION } from '../config/env';

export default function DailyReportScreen({ navigation }) {
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'history'
  const [pastReports, setPastReports] = useState([]);

  // Auto-filled info
  const todayDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Form Fields
  const [connectedCalls, setConnectedCalls] = useState('');
  const [callsAbove3Min, setCallsAbove3Min] = useState('');
  const [groupsCreated, setGroupsCreated] = useState('');
  const [membersInGroups, setMembersInGroups] = useState('');
  const [onboardingConversions, setOnboardingConversions] = useState('0');
  const [finalizeConversions, setFinalizeConversions] = useState('0');
  const [fullConversions, setFullConversions] = useState('0');
  const [remarks, setRemarks] = useState('');
  const [existingReport, setExistingReport] = useState(null);

  useEffect(() => {
    fetchTodayStatus();
    fetchPastReports();
  }, []);

  const fetchTodayStatus = async () => {
    try {
      setLoading(true);
      const res = await reportsAPI.getTodayStatus();
      if (res?.submitted && res.report) {
        setExistingReport(res.report);
        setConnectedCalls(String(res.report.connectedCalls || ''));
        setCallsAbove3Min(String(res.report.callsAbove3Min || ''));
        setGroupsCreated(String(res.report.groupsCreated || ''));
        setMembersInGroups(String(res.report.membersInGroups || ''));
        setOnboardingConversions(String(res.report.onboardingConversions ?? 0));
        setFinalizeConversions(String(res.report.finalizeConversions ?? 0));
        setFullConversions(String(res.report.fullConversions ?? (res.report.todayConversions && !res.report.onboardingConversions && !res.report.finalizeConversions ? res.report.todayConversions : 0)));
        setRemarks(res.report.remarks || '');
      }
    } catch (err) {
      console.warn('Today report status error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPastReports = async () => {
    try {
      const res = await reportsAPI.getDaily();
      setPastReports(res?.data || []);
    } catch (err) {
      console.warn('Past reports fetch error:', err);
    }
  };

  const onbNum = Math.max(0, parseInt(onboardingConversions, 10) || 0);
  const finNum = Math.max(0, parseInt(finalizeConversions, 10) || 0);
  const fullNum = Math.max(0, parseInt(fullConversions, 10) || 0);
  const totalConversions = onbNum + finNum + fullNum;
  const calculatedRevenue = (onbNum * 1500) + (finNum * 4500) + (fullNum * 6000);

  const handleSubmit = async () => {
    if (connectedCalls === '' || callsAbove3Min === '' || groupsCreated === '' || membersInGroups === '') {
      Alert.alert('Required Fields', 'Please complete call and group metric fields before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        connectedCalls: Number(connectedCalls) || 0,
        callsAbove3Min: Number(callsAbove3Min) || 0,
        groupsCreated: Number(groupsCreated) || 0,
        membersInGroups: Number(membersInGroups) || 0,
        onboardingConversions: onbNum,
        finalizeConversions: finNum,
        fullConversions: fullNum,
        todayConversions: totalConversions,
        remarks: remarks.trim()
      };

      const res = await reportsAPI.submitDaily(payload);
      Alert.alert('✅ Success', res.message || 'Daily working report recorded successfully.');
      fetchTodayStatus();
      fetchPastReports();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Submission failed';
      Alert.alert('Submission Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Sub Tabs */}
      <View style={[styles.tabBar, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'form' && styles.tabItemActive]}
          onPress={() => setActiveTab('form')}
        >
          <Text style={[styles.tabText, activeTab === 'form' && styles.tabTextActive]}>
            📝 Report Form
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'history' && styles.tabItemActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            📊 History ({pastReports.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'form' ? (
          <>
            {/* Auto-filled Identity Card */}
            <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 10 }]}>
                👤 Employee Auto-Filled Information
              </Text>
              <View style={styles.autoGrid}>
                <View style={styles.autoItem}>
                  <Text style={styles.autoLabel}>Name</Text>
                  <Text style={[styles.autoValue, { color: theme.text }]}>{currentUser?.name}</Text>
                </View>
                <View style={styles.autoItem}>
                  <Text style={styles.autoLabel}>Emp ID</Text>
                  <Text style={[styles.autoValue, { color: theme.text }]}>{currentUser?.empId || 'AP-EMP'}</Text>
                </View>
                <View style={styles.autoItem}>
                  <Text style={styles.autoLabel}>Team</Text>
                  <Text style={[styles.autoValue, { color: theme.text }]}>{currentUser?.department || 'BDA'}</Text>
                </View>
                <View style={styles.autoItem}>
                  <Text style={styles.autoLabel}>Date</Text>
                  <Text style={[styles.autoValue, { color: theme.text }]}>{todayDate}</Text>
                </View>
                <View style={styles.autoItem}>
                  <Text style={styles.autoLabel}>Time</Text>
                  <Text style={[styles.autoValue, { color: theme.text }]}>{currentTime}</Text>
                </View>
                <View style={styles.autoItem}>
                  <Text style={styles.autoLabel}>Status</Text>
                  <Text style={[styles.autoValue, { color: existingReport ? '#15803d' : '#d97706' }]}>
                    {existingReport ? 'Submitted (Can Edit)' : 'Pending'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Input Fields */}
            <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 14 }]}>
                📞 Daily Performance Metrics
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Total Connected Calls *</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  placeholder="0"
                  placeholderTextColor="#94a3b8"
                  value={connectedCalls}
                  onChangeText={setConnectedCalls}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Calls Above 3 Minutes *</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  placeholder="0"
                  placeholderTextColor="#94a3b8"
                  value={callsAbove3Min}
                  onChangeText={setCallsAbove3Min}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Today Groups Created *</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  placeholder="0"
                  placeholderTextColor="#94a3b8"
                  value={groupsCreated}
                  onChangeText={setGroupsCreated}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Total Members in Groups *</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  placeholder="0"
                  placeholderTextColor="#94a3b8"
                  value={membersInGroups}
                  onChangeText={setMembersInGroups}
                  keyboardType="number-pad"
                />
              </View>

              {/* Product Conversions Split (₹6,000 Model) */}
              <View style={[styles.splitBox, { borderColor: theme.border }]}>
                <View style={styles.splitBoxHeader}>
                  <Text style={[styles.splitBoxTitle, { color: theme.text }]}>
                    🎯 Conversions Split (₹6k Model)
                  </Text>
                  <View style={styles.totalBadge}>
                    <Text style={styles.totalBadgeText}>Total: {totalConversions}</Text>
                  </View>
                </View>

                {/* 1st Part Onboarding */}
                <View style={styles.splitRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.splitRowTitle, { color: '#0284c7' }]}>1st Part Onboarding</Text>
                    <Text style={styles.splitRowSub}>+₹1,500 each</Text>
                  </View>
                  <TextInput
                    style={[styles.splitInput, { color: theme.text, borderColor: theme.border }]}
                    placeholder="0"
                    placeholderTextColor="#94a3b8"
                    value={onboardingConversions}
                    onChangeText={setOnboardingConversions}
                    keyboardType="number-pad"
                  />
                  <Text style={styles.splitRowSubtotal}>= ₹{(onbNum * 1500).toLocaleString('en-IN')}</Text>
                </View>

                {/* 2nd Part Finalize */}
                <View style={styles.splitRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.splitRowTitle, { color: '#7c3aed' }]}>2nd Part Finalize</Text>
                    <Text style={styles.splitRowSub}>+₹4,500 each</Text>
                  </View>
                  <TextInput
                    style={[styles.splitInput, { color: theme.text, borderColor: theme.border }]}
                    placeholder="0"
                    placeholderTextColor="#94a3b8"
                    value={finalizeConversions}
                    onChangeText={setFinalizeConversions}
                    keyboardType="number-pad"
                  />
                  <Text style={styles.splitRowSubtotal}>= ₹{(finNum * 4500).toLocaleString('en-IN')}</Text>
                </View>

                {/* 3rd Option Full Payment */}
                <View style={styles.splitRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.splitRowTitle, { color: '#16a34a' }]}>3rd Full Payment</Text>
                    <Text style={styles.splitRowSub}>+₹6,000 each</Text>
                  </View>
                  <TextInput
                    style={[styles.splitInput, { color: theme.text, borderColor: theme.border }]}
                    placeholder="0"
                    placeholderTextColor="#94a3b8"
                    value={fullConversions}
                    onChangeText={setFullConversions}
                    keyboardType="number-pad"
                  />
                  <Text style={styles.splitRowSubtotal}>= ₹{(fullNum * 6000).toLocaleString('en-IN')}</Text>
                </View>

                {/* Revenue Estimation Box */}
                <View style={styles.revenueBox}>
                  <Text style={styles.revenueLabel}>Total Today's Revenue:</Text>
                  <Text style={styles.revenueAmount}>₹{calculatedRevenue.toLocaleString('en-IN')}</Text>
                </View>
              </View>

              {/* Remarks */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Remarks / High-Intent Leads</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border }]}
                  placeholder="e.g. 2 candidate follow-ups scheduled tomorrow..."
                  placeholderTextColor="#94a3b8"
                  value={remarks}
                  onChangeText={setRemarks}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: theme.accent }]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {existingReport ? '💾 Update Today\'s Report' : '🚀 Submit Daily Report'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* History Tab */
          <View>
            {pastReports.length === 0 ? (
              <Text style={styles.emptyText}>No past daily reports submitted yet.</Text>
            ) : (
              pastReports.map((item, idx) => (
                <View key={item._id || idx} style={[styles.historyCard, { backgroundColor: theme.cardBackground }]}>
                  <View style={styles.histHeader}>
                    <Text style={[styles.histDate, { color: theme.text }]}>{item.reportDate}</Text>
                    <Text style={styles.histTime}>{item.reportTime}</Text>
                  </View>

                  <View style={styles.histGrid}>
                    <Text style={styles.histMetric}>📞 Calls: {item.connectedCalls} (&gt;3m: {item.callsAbove3Min})</Text>
                    <Text style={styles.histMetric}>👥 Groups: {item.groupsCreated} (Members: {item.membersInGroups})</Text>
                    <Text style={styles.histMetric}>🎯 Conversions: {item.todayConversions}</Text>
                    <Text style={styles.histRevenue}>💰 Revenue: ₹{(item.revenue || 0).toLocaleString('en-IN')}</Text>
                  </View>

                  {item.remarks ? (
                    <Text style={styles.histRemarks}>"{item.remarks}"</Text>
                  ) : null}
                </View>
              ))
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
    padding: 6,
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
    fontSize: 13,
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800'
  },
  autoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  autoItem: {
    width: '46%'
  },
  autoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  autoValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2
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
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f8fafc'
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top'
  },
  splitBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    backgroundColor: '#f8fafc'
  },
  splitBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  splitBoxTitle: {
    fontSize: 13,
    fontWeight: '800'
  },
  totalBadge: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  totalBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1d4ed8'
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 8,
    marginBottom: 8
  },
  splitRowTitle: {
    fontSize: 12,
    fontWeight: '800'
  },
  splitRowSub: {
    fontSize: 10,
    color: '#64748b'
  },
  splitInput: {
    width: 55,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 14,
    marginHorizontal: 8
  },
  splitRowSubtotal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    minWidth: 70,
    textAlign: 'right'
  },
  revenueBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  revenueLabel: {
    fontSize: 11,
    color: '#1e40af',
    fontWeight: '600',
    flex: 1
  },
  revenueAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2563eb'
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800'
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginVertical: 30
  },
  historyCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1
  },
  histHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 6
  },
  histDate: {
    fontSize: 14,
    fontWeight: '800'
  },
  histTime: {
    fontSize: 12,
    color: '#64748b'
  },
  histGrid: {
    gap: 4
  },
  histMetric: {
    fontSize: 12,
    color: '#334155'
  },
  histRevenue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
    marginTop: 2
  },
  histRemarks: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#64748b',
    marginTop: 6
  }
});
