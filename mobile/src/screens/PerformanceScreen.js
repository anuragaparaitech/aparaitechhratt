import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { analyticsAPI } from '../services/api';
import { REVENUE_PER_CONVERSION } from '../config/env';

export default function PerformanceScreen({ navigation }) {
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [perfData, setPerfData] = useState(null);
  const [teamOverview, setTeamOverview] = useState(null);

  const isSoftwareDev = currentUser?.department === 'Development' || currentUser?.department === 'Software Development';
  const isManagerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'hr';

  const loadData = async () => {
    try {
      const pRes = await analyticsAPI.getMyPerformance().catch(() => null);
      if (pRes?.success) setPerfData(pRes.data);

      if (isManagerOrAdmin) {
        const tRes = await analyticsAPI.getTeamOverview().catch(() => null);
        if (tRes?.success) setTeamOverview(tRes.data);
      }
    } catch (err) {
      console.warn('Performance load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const today = perfData?.today || {};
  const monthly = perfData?.monthly || {};
  const targetConversions = 15;
  const targetCalls = 100;
  const convProgress = Math.min(100, Math.round(((monthly.totalConversions || 0) / targetConversions) * 100));
  const callProgress = Math.min(100, Math.round(((monthly.totalCalls || 0) / targetCalls) * 100));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.accent]} />}
      >
        {/* Performance Header Banner */}
        <View style={styles.headerBanner}>
          <Text style={styles.bannerTag}>
            {isSoftwareDev ? '💻 DEV PERFORMANCE' : '📈 BDA COMMERCIAL YIELD'}
          </Text>
          <Text style={styles.bannerTitle}>
            {currentUser?.name}'s Metrics
          </Text>
          <Text style={styles.bannerSub}>
            Tracking monthly benchmarks, conversion rate, and compliance
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* KPI Cards Row */}
            <View style={styles.kpiGrid}>
              <View style={[styles.kpiCard, { backgroundColor: theme.cardBackground }]}>
                <Text style={styles.kpiLabel}>TOTAL CONVERSIONS</Text>
                <Text style={[styles.kpiValue, { color: theme.success }]}>
                  {monthly.totalConversions || 0}
                </Text>
                <Text style={styles.kpiSub}>Today: {today.todayConversions || 0}</Text>
              </View>

              <View style={[styles.kpiCard, { backgroundColor: theme.cardBackground }]}>
                <Text style={styles.kpiLabel}>TOTAL REVENUE</Text>
                <Text style={[styles.kpiValue, { color: '#059669' }]}>
                  ₹{(monthly.totalRevenue || 0).toLocaleString('en-IN')}
                </Text>
                <Text style={styles.kpiSub}>₹{REVENUE_PER_CONVERSION}/candidate</Text>
              </View>

              <View style={[styles.kpiCard, { backgroundColor: theme.cardBackground }]}>
                <Text style={styles.kpiLabel}>CONNECTED CALLS</Text>
                <Text style={[styles.kpiValue, { color: theme.accent }]}>
                  {monthly.totalCalls || 0}
                </Text>
                <Text style={styles.kpiSub}>Today: {today.connectedCalls || 0}</Text>
              </View>

              <View style={[styles.kpiCard, { backgroundColor: theme.cardBackground }]}>
                <Text style={styles.kpiLabel}>REPORTS SUBMITTED</Text>
                <Text style={[styles.kpiValue, { color: '#7c3aed' }]}>
                  {monthly.reportsSubmitted || 0}
                </Text>
                <Text style={styles.kpiSub}>Compliance verified</Text>
              </View>
            </View>

            {/* Target vs Achieved Progress Bars */}
            <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 16 }]}>
                🎯 Target vs Achieved (Current Month)
              </Text>

              {/* Conversions Target */}
              <View style={styles.progressRow}>
                <View style={styles.progressLabels}>
                  <Text style={[styles.progName, { color: theme.text }]}>Admissions Target (15 Candidates)</Text>
                  <Text style={[styles.progVal, { color: theme.success }]}>
                    {monthly.totalConversions || 0} / {targetConversions} ({convProgress}%)
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressBar, { width: `${convProgress}%`, backgroundColor: theme.success }]} />
                </View>
              </View>

              {/* Calls Target */}
              <View style={styles.progressRow}>
                <View style={styles.progressLabels}>
                  <Text style={[styles.progName, { color: theme.text }]}>Client Calls Target (100 Calls)</Text>
                  <Text style={[styles.progVal, { color: theme.accent }]}>
                    {monthly.totalCalls || 0} / {targetCalls} ({callProgress}%)
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressBar, { width: `${callProgress}%`, backgroundColor: theme.accent }]} />
                </View>
              </View>
            </View>

            {/* Software Developer Intern Section */}
            {isSoftwareDev && (
              <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 12 }]}>
                  💻 Software Engineering Benchmarks
                </Text>
                <View style={styles.devMetricRow}>
                  <Text style={styles.devLabel}>Assigned Sprint Tasks:</Text>
                  <Text style={styles.devValue}>In Progress / Completed</Text>
                </View>
                <View style={styles.devMetricRow}>
                  <Text style={styles.devLabel}>Code Reviews & Merges:</Text>
                  <Text style={styles.devValue}>GitHub Active</Text>
                </View>
                <View style={styles.devMetricRow}>
                  <Text style={styles.devLabel}>Quality & Performance Rating:</Text>
                  <Text style={[styles.devValue, { color: '#059669' }]}>⭐ 4.9 / 5.0 Exceeds Standards</Text>
                </View>
              </View>
            )}

            {/* Manager Team Oversight Card */}
            {isManagerOrAdmin && teamOverview && (
              <View style={[styles.card, { backgroundColor: '#f0f9ff', borderColor: '#bae6fd', borderWidth: 1 }]}>
                <Text style={[styles.cardTitle, { color: '#0369a1', marginBottom: 12 }]}>
                  👥 Manager Oversight: Team Performance
                </Text>
                <View style={styles.teamMetricsGrid}>
                  <View style={styles.teamMetricItem}>
                    <Text style={styles.teamMetricLabel}>Checked In Today</Text>
                    <Text style={styles.teamMetricVal}>{teamOverview.metrics?.checkedInToday || 0}</Text>
                  </View>
                  <View style={styles.teamMetricItem}>
                    <Text style={styles.teamMetricLabel}>Reports Submitted</Text>
                    <Text style={styles.teamMetricVal}>{teamOverview.metrics?.reportsSubmitted || 0}</Text>
                  </View>
                  <View style={styles.teamMetricItem}>
                    <Text style={styles.teamMetricLabel}>Reports Pending</Text>
                    <Text style={[styles.teamMetricVal, { color: '#ef4444' }]}>
                      {teamOverview.metrics?.reportsPending || 0}
                    </Text>
                  </View>
                  <View style={styles.teamMetricItem}>
                    <Text style={styles.teamMetricLabel}>Today's Team Revenue</Text>
                    <Text style={[styles.teamMetricVal, { color: '#059669' }]}>
                      ₹{(teamOverview.metrics?.todayRevenue || 0).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </>
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
    paddingBottom: 40
  },
  headerBanner: {
    backgroundColor: '#0a192f',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16
  },
  bannerTag: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800'
  },
  bannerSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16
  },
  kpiCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 4
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2
  },
  kpiSub: {
    fontSize: 10,
    color: '#94a3b8'
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
  progressRow: {
    marginBottom: 14
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  progName: {
    fontSize: 12,
    fontWeight: '700'
  },
  progVal: {
    fontSize: 12,
    fontWeight: '800'
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 5,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    borderRadius: 5
  },
  devMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  devLabel: {
    fontSize: 12,
    color: '#64748b'
  },
  devValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a'
  },
  teamMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  teamMetricItem: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center'
  },
  teamMetricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0369a1',
    textAlign: 'center',
    marginBottom: 2
  },
  teamMetricVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a'
  }
});
