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

export default function MailBlastScreen({ navigation }) {
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'history'
  const [submitting, setSubmitting] = useState(false);
  const [collegesList, setCollegesList] = useState([]);
  const [pastBlasts, setPastBlasts] = useState([]);

  // Auto-filled info
  const todayDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Form Fields
  const [targetType, setTargetType] = useState('Random'); // 'Random' | 'College-wise'
  const [selectedCollege, setSelectedCollege] = useState('');
  const [customCollege, setCustomCollege] = useState('');
  const [templateUsed, setTemplateUsed] = useState('Product Outreach Campaign v2.1');
  const [emailsSent, setEmailsSent] = useState('');
  const [responsesReceived, setResponsesReceived] = useState('');
  const [bounceCount, setBounceCount] = useState('');
  const [status, setStatus] = useState('Completed'); // 'Completed' | 'Pending'
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchColleges();
    fetchPastBlasts();
  }, []);

  const fetchColleges = async () => {
    try {
      const res = await reportsAPI.getColleges();
      if (res?.data) {
        setCollegesList(res.data);
      }
    } catch (err) {
      console.warn('Colleges fetch error:', err);
    }
  };

  const fetchPastBlasts = async () => {
    try {
      const res = await reportsAPI.getMailBlast();
      setPastBlasts(res?.data || []);
    } catch (err) {
      console.warn('Past blasts fetch error:', err);
    }
  };

  const handleSubmit = async () => {
    if (!emailsSent.trim()) {
      Alert.alert('Required Field', 'Please enter total emails sent.');
      return;
    }

    if (targetType === 'College-wise' && !selectedCollege && !customCollege.trim()) {
      Alert.alert('College Required', 'Please select or enter the targeted college name.');
      return;
    }

    setSubmitting(true);
    try {
      const finalCollege = targetType === 'College-wise'
        ? (customCollege.trim() || selectedCollege)
        : null;

      const payload = {
        targetType,
        collegeName: finalCollege,
        templateUsed: templateUsed.trim(),
        emailsSent: Number(emailsSent) || 0,
        responsesReceived: Number(responsesReceived) || 0,
        bounceCount: Number(bounceCount) || 0,
        status,
        remarks: remarks.trim()
      };

      const res = await reportsAPI.submitMailBlast(payload);
      Alert.alert('✅ Campaign Recorded', res.message || 'Mail blast report logged successfully.');

      // Reset form
      setEmailsSent('');
      setResponsesReceived('');
      setBounceCount('');
      setRemarks('');
      setCustomCollege('');
      setSelectedCollege('');
      fetchPastBlasts();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit mail blast report';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Sub Tab Switcher */}
      <View style={[styles.tabBar, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'form' && styles.tabItemActive]}
          onPress={() => setActiveTab('form')}
        >
          <Text style={[styles.tabText, activeTab === 'form' && styles.tabTextActive]}>
            ✉️ Campaign Form
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'history' && styles.tabItemActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            📊 Blast History ({pastBlasts.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'form' ? (
          <>
            {/* Sender Identity Card */}
            <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 8 }]}>
                👤 Sender Auto-Filled Information
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
                  <Text style={[styles.autoValue, { color: theme.text }]}>{currentUser?.department || 'Outreach'}</Text>
                </View>
                <View style={styles.autoItem}>
                  <Text style={styles.autoLabel}>Date & Time</Text>
                  <Text style={[styles.autoValue, { color: theme.text }]}>{todayDate} • {currentTime}</Text>
                </View>
              </View>
            </View>

            {/* Campaign Parameters */}
            <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 14 }]}>
                🎯 Target Audience & Setup
              </Text>

              {/* Target Type Selector */}
              <Text style={styles.inputLabel}>Target Type *</Text>
              <View style={styles.targetRow}>
                <TouchableOpacity
                  style={[styles.targetBtn, targetType === 'Random' && styles.targetBtnActive]}
                  onPress={() => setTargetType('Random')}
                >
                  <Text style={[styles.targetBtnText, targetType === 'Random' && styles.targetBtnTextActive]}>
                    Random / Open Leads
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.targetBtn, targetType === 'College-wise' && styles.targetBtnActive]}
                  onPress={() => setTargetType('College-wise')}
                >
                  <Text style={[styles.targetBtnText, targetType === 'College-wise' && styles.targetBtnTextActive]}>
                    College-wise Targeted
                  </Text>
                </TouchableOpacity>
              </View>

              {/* College Selector (When College-wise selected) */}
              {targetType === 'College-wise' && (
                <View style={styles.collegePickerBox}>
                  <Text style={[styles.inputLabel, { color: '#0369a1' }]}>
                    Select Targeted College (Database):
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.collegeChipsRow}>
                    {collegesList.map((col) => (
                      <TouchableOpacity
                        key={col}
                        style={[
                          styles.collegeChip,
                          selectedCollege === col && styles.collegeChipActive
                        ]}
                        onPress={() => {
                          setSelectedCollege(col);
                          setCustomCollege('');
                        }}
                      >
                        <Text style={[
                          styles.collegeChipText,
                          selectedCollege === col && styles.collegeChipTextActive
                        ]}>
                          {col}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.border, marginTop: 8 }]}
                    placeholder="Or enter custom college / university name..."
                    placeholderTextColor="#94a3b8"
                    value={customCollege}
                    onChangeText={text => {
                      setCustomCollege(text);
                      if (text) setSelectedCollege('');
                    }}
                  />
                </View>
              )}

              {/* Email Template Used */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Template Used *</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  placeholder="Template Name"
                  placeholderTextColor="#94a3b8"
                  value={templateUsed}
                  onChangeText={setTemplateUsed}
                />
              </View>

              {/* Numerical Metrics */}
              <View style={styles.metricsRow}>
                <View style={styles.metricCol}>
                  <Text style={styles.inputLabel}>Total Sent *</Text>
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                    placeholder="0"
                    placeholderTextColor="#94a3b8"
                    value={emailsSent}
                    onChangeText={setEmailsSent}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={styles.metricCol}>
                  <Text style={styles.inputLabel}>Responses</Text>
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                    placeholder="0"
                    placeholderTextColor="#94a3b8"
                    value={responsesReceived}
                    onChangeText={setResponsesReceived}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={styles.metricCol}>
                  <Text style={styles.inputLabel}>Bounces</Text>
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                    placeholder="0"
                    placeholderTextColor="#94a3b8"
                    value={bounceCount}
                    onChangeText={setBounceCount}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              {/* Campaign Status Toggle */}
              <Text style={styles.inputLabel}>Campaign Status</Text>
              <View style={styles.targetRow}>
                <TouchableOpacity
                  style={[styles.targetBtn, status === 'Completed' && styles.statusCompletedActive]}
                  onPress={() => setStatus('Completed')}
                >
                  <Text style={[styles.targetBtnText, status === 'Completed' && styles.targetBtnTextActive]}>
                    ✅ Completed
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.targetBtn, status === 'Pending' && styles.statusPendingActive]}
                  onPress={() => setStatus('Pending')}
                >
                  <Text style={[styles.targetBtnText, status === 'Pending' && styles.targetBtnTextActive]}>
                    ⏳ In-Progress / Pending
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Remarks */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Remarks / Response Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border }]}
                  placeholder="e.g. Higher open rate noted on TPO batch..."
                  placeholderTextColor="#94a3b8"
                  value={remarks}
                  onChangeText={setRemarks}
                  multiline
                  numberOfLines={2}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: '#0284c7' }]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitBtnText}>🚀 Submit Mail Blast Report</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* History Tab */
          <View>
            {pastBlasts.length === 0 ? (
              <Text style={styles.emptyText}>No mail blast campaign reports recorded.</Text>
            ) : (
              pastBlasts.map((b, idx) => (
                <View key={b._id || idx} style={[styles.historyCard, { backgroundColor: theme.cardBackground }]}>
                  <View style={styles.histHeader}>
                    <Text style={[styles.histDate, { color: theme.text }]}>
                      {b.collegeName || 'Random Audience'}
                    </Text>
                    <View style={[
                      styles.histBadge,
                      b.status === 'Completed' ? styles.badgeGreen : styles.badgeYellow
                    ]}>
                      <Text style={styles.histBadgeText}>{b.status}</Text>
                    </View>
                  </View>

                  <Text style={styles.histTemplate}>Template: {b.templateUsed}</Text>

                  <View style={styles.histMetricsRow}>
                    <Text style={styles.histMetric}>📤 Sent: {b.emailsSent}</Text>
                    <Text style={styles.histMetric}>💬 Replies: {b.responsesReceived}</Text>
                    <Text style={styles.histMetric}>⚠️ Bounces: {b.bounceCount}</Text>
                  </View>

                  <Text style={styles.histDateSub}>
                    Submitted by {b.employeeName} on {b.reportDate} at {b.reportTime}
                  </Text>
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
    height: 60,
    textAlignVertical: 'top'
  },
  targetRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14
  },
  targetBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  targetBtnActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7'
  },
  statusCompletedActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a'
  },
  statusPendingActive: {
    backgroundColor: '#d97706',
    borderColor: '#d97706'
  },
  targetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b'
  },
  targetBtnTextActive: {
    color: '#ffffff'
  },
  collegePickerBox: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14
  },
  collegeChipsRow: {
    flexDirection: 'row',
    marginBottom: 6
  },
  collegeChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8
  },
  collegeChipActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7'
  },
  collegeChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155'
  },
  collegeChipTextActive: {
    color: '#ffffff'
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14
  },
  metricCol: {
    flex: 1
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
    alignItems: 'center',
    marginBottom: 4
  },
  histDate: {
    fontSize: 14,
    fontWeight: '800'
  },
  histBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  badgeGreen: {
    backgroundColor: '#dcfce7'
  },
  badgeYellow: {
    backgroundColor: '#fef3c7'
  },
  histBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f172a'
  },
  histTemplate: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 8
  },
  histMetricsRow: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6
  },
  histMetric: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155'
  },
  histDateSub: {
    fontSize: 10,
    color: '#94a3b8'
  }
});
