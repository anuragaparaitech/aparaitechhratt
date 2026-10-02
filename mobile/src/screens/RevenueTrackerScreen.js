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

export default function RevenueTrackerScreen() {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revenueData, setRevenueData] = useState(null);
  const [activeTab, setActiveTab] = useState('teams'); // 'teams' | 'employees' | 'trends'

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const res = await analyticsAPI.getRevenue();
      if (res?.success) {
        setRevenueData(res.data);
      }
    } catch (err) {
      console.warn('Revenue fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRevenue();
  };

  const summary = revenueData?.summary || {};
  const teamBreakdown = revenueData?.teamBreakdown || [];
  const employeeBreakdown = revenueData?.employeeBreakdown || [];
  const monthlyTrends = revenueData?.monthlyTrends || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <Text style={styles.bannerTag}>💰 FINANCIAL YIELD DASHBOARD</Text>
        <Text style={styles.bannerTitle}>Commercial Revenue Tracker</Text>
        <Text style={styles.bannerSub}>Real-time yield at ₹6,000 per confirmed product conversion</Text>

        <View style={styles.kpiTotalCard}>
          <Text style={styles.kpiTotalLabel}>TOTAL COMPANY RECORDED REVENUE</Text>
          <Text style={styles.kpiTotalVal}>₹{(summary.totalRevenue || 0).toLocaleString('en-IN')}</Text>
          <Text style={styles.kpiTotalSub}>
            {summary.totalConversions || 0} total product conversions • {summary.totalReports || 0} verified reports
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)' }}>
            <Text style={{ color: '#93c5fd', fontSize: 11, fontWeight: '700' }}>Part 1: ₹1,500</Text>
            <Text style={{ color: '#86efac', fontSize: 11, fontWeight: '700' }}>Part 2: ₹4,500</Text>
            <Text style={{ color: '#fbcfe8', fontSize: 11, fontWeight: '700' }}>Full: ₹6,000</Text>
          </View>
        </View>
      </View>

      {/* Breakdown Tab Selector */}
      <View style={[styles.tabBar, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'teams' && styles.tabItemActive]}
          onPress={() => setActiveTab('teams')}
        >
          <Text style={[styles.tabText, activeTab === 'teams' && styles.tabTextActive]}>
            🏢 Teams ({teamBreakdown.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'employees' && styles.tabItemActive]}
          onPress={() => setActiveTab('employees')}
        >
          <Text style={[styles.tabText, activeTab === 'employees' && styles.tabTextActive]}>
            👥 Employees ({employeeBreakdown.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'trends' && styles.tabItemActive]}
          onPress={() => setActiveTab('trends')}
        >
          <Text style={[styles.tabText, activeTab === 'trends' && styles.tabTextActive]}>
            📈 Trends
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.accent]} />}
      >
        {loading ? (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 30 }} />
        ) : (
          <>
            {activeTab === 'teams' && (
              <View>
                {teamBreakdown.map((t) => (
                  <View key={t._id} style={[styles.breakdownCard, { backgroundColor: theme.cardBackground }]}>
                    <View style={styles.breakdownHeader}>
                      <Text style={[styles.breakdownTitle, { color: theme.text }]}>
                        {t._id || 'BDA Team'}
                      </Text>
                      <Text style={styles.revenueGreen}>₹{(t.revenue || 0).toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.breakdownStatsRow}>
                      <Text style={styles.statChip}>🎯 {t.conversions} Admissions</Text>
                      <Text style={styles.statChip}>📋 {t.reports} Submissions</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'employees' && (
              <View>
                {employeeBreakdown.map((e) => (
                  <View key={e.email} style={[styles.breakdownCard, { backgroundColor: theme.cardBackground }]}>
                    <View style={styles.breakdownHeader}>
                      <View>
                        <Text style={[styles.breakdownTitle, { color: theme.text }]}>{e.name}</Text>
                        <Text style={styles.empSub}>{e.team} • {e.empId}</Text>
                      </View>
                      <Text style={styles.revenueGreen}>₹{(e.totalRevenue || 0).toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.breakdownStatsRow}>
                      <Text style={styles.statChip}>🎯 {e.totalConversions} Conversions</Text>
                      <Text style={styles.statChip}>📞 {e.totalCalls} Calls</Text>
                      <Text style={styles.statChip}>📋 {e.reportCount} Reports</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'trends' && (
              <View>
                {monthlyTrends.map((m) => (
                  <View key={m.month} style={[styles.breakdownCard, { backgroundColor: theme.cardBackground }]}>
                    <View style={styles.breakdownHeader}>
                      <Text style={[styles.breakdownTitle, { color: theme.text }]}>
                        🗓️ {m.month}
                      </Text>
                      <Text style={styles.revenueGreen}>₹{(m.revenue || 0).toLocaleString('en-IN')}</Text>
                    </View>
                    <Text style={styles.monthSub}>
                      {m.conversions} confirmed admissions registered
                    </Text>
                  </View>
                ))}
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
  headerBanner: {
    backgroundColor: '#0a192f',
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  },
  bannerTag: {
    color: '#a7f3d0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900'
  },
  bannerSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16
  },
  kpiTotalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)'
  },
  kpiTotalLabel: {
    fontSize: 10,
    color: '#a7f3d0',
    fontWeight: '800',
    letterSpacing: 0.5
  },
  kpiTotalVal: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    marginVertical: 4
  },
  kpiTotalSub: {
    fontSize: 11,
    color: '#cbd5e1'
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10
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
  breakdownCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: '800'
  },
  empSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  revenueGreen: {
    fontSize: 17,
    fontWeight: '900',
    color: '#059669'
  },
  breakdownStatsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap'
  },
  statChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 11,
    color: '#334155',
    fontWeight: '600'
  },
  monthSub: {
    fontSize: 12,
    color: '#64748b'
  }
});
