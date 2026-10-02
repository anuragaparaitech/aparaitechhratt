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

export default function LeaderboardScreen() {
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  const [period, setPeriod] = useState('month'); // 'today' | 'month' | 'all'
  const [activeCategory, setActiveCategory] = useState('conversions'); // 'conversions' | 'calls' | 'blasts' | 'teams'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leaderboard, setLeaderboard] = useState({
    byConversions: [],
    byCalls: [],
    byMailBlasts: [],
    byTeams: []
  });

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await analyticsAPI.getLeaderboard(period);
      if (res?.success) {
        setLeaderboard(res.data || {});
      }
    } catch (err) {
      console.warn('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const getActiveList = () => {
    switch (activeCategory) {
      case 'conversions': return leaderboard.byConversions || [];
      case 'calls': return leaderboard.byCalls || [];
      case 'blasts': return leaderboard.byMailBlasts || [];
      case 'teams': return leaderboard.byTeams || [];
      default: return [];
    }
  };

  const list = getActiveList();

  const renderBadge = (rank) => {
    if (rank === 1) return <Text style={styles.goldBadge}>🥇</Text>;
    if (rank === 2) return <Text style={styles.silverBadge}>🥈</Text>;
    if (rank === 3) return <Text style={styles.bronzeBadge}>🥉</Text>;
    return (
      <View style={styles.rankCircle}>
        <Text style={styles.rankNum}>{rank}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <Text style={styles.bannerTag}>🏆 APARAITECH HONORS</Text>
        <Text style={styles.bannerTitle}>Company Leaderboard</Text>
        <Text style={styles.bannerSub}>Recognizing top performance across student admissions and outreach</Text>

        {/* Period Selector */}
        <View style={styles.periodRow}>
          {[
            { id: 'today', label: 'Today' },
            { id: 'month', label: 'This Month' },
            { id: 'all', label: 'All Time' }
          ].map(p => (
            <TouchableOpacity
              key={p.id}
              style={[styles.periodBtn, period === p.id && styles.periodBtnActive]}
              onPress={() => setPeriod(p.id)}
            >
              <Text style={[styles.periodText, period === p.id && styles.periodTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Category Pills */}
      <View style={styles.categoryScroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {[
            { id: 'conversions', label: '🎯 Conversions' },
            { id: 'calls', label: '📞 Connected Calls' },
            { id: 'blasts', label: '📧 Mail Blasts' },
            { id: 'teams', label: '🏢 Team Ranking' }
          ].map(c => (
            <TouchableOpacity
              key={c.id}
              style={[styles.catChip, activeCategory === c.id && styles.catChipActive]}
              onPress={() => setActiveCategory(c.id)}
            >
              <Text style={[styles.catChipText, activeCategory === c.id && styles.catChipTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Leaderboard List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.accent]} />}
      >
        {loading ? (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 30 }} />
        ) : list.length === 0 ? (
          <Text style={styles.emptyText}>No ranking records for this period.</Text>
        ) : (
          list.map((item, idx) => {
            const isMe = item._id === currentUser?.email?.toLowerCase();
            return (
              <View
                key={item._id || idx}
                style={[
                  styles.rankItem,
                  { backgroundColor: theme.cardBackground },
                  isMe && styles.myRankItem
                ]}
              >
                <View style={styles.rankLeft}>
                  {renderBadge(idx + 1)}
                  <View style={{ marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.rankName, { color: theme.text }]}>
                        {item.name || item._id}
                      </Text>
                      {isMe && (
                        <View style={styles.meBadge}>
                          <Text style={styles.meBadgeText}>YOU</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.rankSub}>
                      {item.team ? `${item.team} Team` : (item.empId || 'Associate')}
                    </Text>
                  </View>
                </View>

                <View style={styles.rankRight}>
                  {activeCategory === 'conversions' && (
                    <>
                      <Text style={styles.rankMainMetric}>{item.conversions} Confirmed</Text>
                      <Text style={styles.rankSubMetric}>₹{(item.revenue || 0).toLocaleString('en-IN')}</Text>
                    </>
                  )}
                  {activeCategory === 'calls' && (
                    <>
                      <Text style={styles.rankMainMetric}>{item.calls} Calls</Text>
                      <Text style={styles.rankSubMetric}>&gt;3m: {item.callsAbove3Min}</Text>
                    </>
                  )}
                  {activeCategory === 'blasts' && (
                    <>
                      <Text style={styles.rankMainMetric}>{item.emailsSent} Sent</Text>
                      <Text style={styles.rankSubMetric}>Replies: {item.responses}</Text>
                    </>
                  )}
                  {activeCategory === 'teams' && (
                    <>
                      <Text style={styles.rankMainMetric}>{item.conversions} Conv</Text>
                      <Text style={styles.rankSubMetric}>₹{(item.revenue || 0).toLocaleString('en-IN')}</Text>
                    </>
                  )}
                </View>
              </View>
            );
          })
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
    color: '#fde047',
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
    marginBottom: 14
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 3
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9
  },
  periodBtnActive: {
    backgroundColor: '#ffffff'
  },
  periodText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600'
  },
  periodTextActive: {
    color: '#0a192f',
    fontWeight: '800'
  },
  categoryScroll: {
    paddingVertical: 12
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  catChipActive: {
    backgroundColor: '#0a192f',
    borderColor: '#0a192f'
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b'
  },
  catChipTextActive: {
    color: '#ffffff'
  },
  listContent: {
    padding: 16,
    paddingBottom: 40
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginVertical: 40
  },
  rankItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1
  },
  myRankItem: {
    borderWidth: 2,
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff'
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  goldBadge: {
    fontSize: 26
  },
  silverBadge: {
    fontSize: 26
  },
  bronzeBadge: {
    fontSize: 26
  },
  rankCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rankNum: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b'
  },
  rankName: {
    fontSize: 14,
    fontWeight: '800'
  },
  meBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4
  },
  meBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900'
  },
  rankSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  rankRight: {
    alignItems: 'flex-end'
  },
  rankMainMetric: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a'
  },
  rankSubMetric: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
    marginTop: 2
  }
});
