import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { announcementAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function AnnouncementsScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();

  const isLeader = user?.role === 'admin' || user?.role === 'manager';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Modal State for New Announcement
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Company');
  const [newTargetTeam, setNewTargetTeam] = useState('All');
  const [newPriority, setNewPriority] = useState('Normal');
  const [isPinned, setIsPinned] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementAPI.getAll();
      if (res && res.success) {
        setAnnouncements(res.data || []);
      }
    } catch (err) {
      console.warn('Error fetching announcements:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  const handleCreateAnnouncement = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      Alert.alert('Required Fields', 'Please enter a title and announcement content.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await announcementAPI.create({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        targetTeam: newTargetTeam,
        priority: newPriority,
        isPinned
      });

      if (res && res.success) {
        Alert.alert('Success', 'Announcement broadcasted to portal successfully.');
        setModalVisible(false);
        setNewTitle('');
        setNewContent('');
        setNewCategory('Company');
        setNewTargetTeam('All');
        setNewPriority('Normal');
        setIsPinned(false);
        fetchAnnouncements();
      } else {
        Alert.alert('Error', res?.message || 'Failed to publish announcement.');
      }
    } catch (err) {
      console.warn('Publish error:', err);
      Alert.alert('Error', err.response?.data?.message || 'Server error publishing announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAnnouncements = announcements.filter((item) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Pinned') return item.isPinned;
    return item.category?.toLowerCase() === selectedFilter.toLowerCase();
  });

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return '#ef4444';
      case 'important':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleCol}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Announcements</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Official Bulletins & Notices
            </Text>
          </View>
          {isLeader && (
            <TouchableOpacity
              style={[styles.composeBtn, { backgroundColor: colors.primary }]}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="megaphone" size={16} color="#fff" />
              <Text style={styles.composeBtnText}>Post</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['All', 'Pinned', 'Company', 'Team', 'Holiday', 'Urgent'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterPill,
                {
                  backgroundColor:
                    selectedFilter === filter ? colors.primary : colors.surface,
                  borderColor: colors.border
                }
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  {
                    color: selectedFilter === filter ? '#ffffff' : colors.textSecondary,
                    fontWeight: selectedFilter === filter ? '700' : '500'
                  }
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading bulletins...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        >
          {filteredAnnouncements.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Announcements Found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                There are currently no circulars matching this criteria.
              </Text>
            </View>
          ) : (
            filteredAnnouncements.map((item) => (
              <View
                key={item._id}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: item.isPinned ? colors.primary : colors.border,
                    borderLeftColor: getPriorityColor(item.priority),
                    borderLeftWidth: 4
                  }
                ]}
              >
                {/* Top Badge Row */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.badgeGroup}>
                    {item.isPinned && (
                      <View style={[styles.pinnedBadge, { backgroundColor: colors.primary + '15' }]}>
                        <Ionicons name="pin" size={12} color={colors.primary} />
                        <Text style={[styles.pinnedBadgeText, { color: colors.primary }]}>PINNED</Text>
                      </View>
                    )}
                    <View style={[styles.categoryBadge, { backgroundColor: colors.border + '50' }]}>
                      <Text style={[styles.categoryBadgeText, { color: colors.textSecondary }]}>
                        {item.category?.toUpperCase() || 'GENERAL'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.priorityBadge,
                        { backgroundColor: getPriorityColor(item.priority) + '15' }
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityBadgeText,
                          { color: getPriorityColor(item.priority) }
                        ]}
                      >
                        {item.priority?.toUpperCase() || 'NORMAL'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>

                {/* Announcement Title */}
                <Text style={[styles.announcementTitle, { color: colors.text }]}>{item.title}</Text>

                {/* Announcement Content */}
                <Text style={[styles.announcementContent, { color: colors.textSecondary }]}>
                  {item.content}
                </Text>

                {/* Footer Info */}
                <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                  <View style={styles.authorRow}>
                    <Ionicons name="person-circle-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.authorText, { color: colors.textSecondary }]}>
                      Posted by: {item.postedBy || 'Administration'}
                    </Text>
                  </View>
                  <Text style={[styles.targetTeamText, { color: colors.primary }]}>
                    Target: {item.targetTeam || 'All Members'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Create Announcement Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalWrap, { backgroundColor: colors.background }]}>
          <View style={[styles.modalBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={26} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>New Announcement</Text>
            <View style={{ width: 26 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            {/* Title */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>Notice Title *</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }
              ]}
              placeholder="e.g. Revised Shift Schedules for BDA Interns"
              placeholderTextColor={colors.textSecondary}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            {/* Category Selection */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>Category</Text>
            <View style={styles.optionRow}>
              {['Company', 'Team', 'Holiday', 'Urgent'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: newCategory === cat ? colors.primary : colors.surface,
                      borderColor: colors.border
                    }
                  ]}
                  onPress={() => setNewCategory(cat)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      { color: newCategory === cat ? '#fff' : colors.text }
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Target Team Selection */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>Target Audience</Text>
            <View style={styles.optionRow}>
              {['All', 'BDA', 'Software Developer', 'HR'].map((team) => (
                <TouchableOpacity
                  key={team}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: newTargetTeam === team ? colors.primary : colors.surface,
                      borderColor: colors.border
                    }
                  ]}
                  onPress={() => setNewTargetTeam(team)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      { color: newTargetTeam === team ? '#fff' : colors.text }
                    ]}
                  >
                    {team}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Priority Selection */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>Priority Level</Text>
            <View style={styles.optionRow}>
              {['Normal', 'Important', 'Urgent'].map((pri) => (
                <TouchableOpacity
                  key={pri}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: newPriority === pri ? getPriorityColor(pri) : colors.surface,
                      borderColor: colors.border
                    }
                  ]}
                  onPress={() => setNewPriority(pri)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      { color: newPriority === pri ? '#fff' : colors.text }
                    ]}
                  >
                    {pri}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Pinned Switch */}
            <TouchableOpacity
              style={[styles.pinToggleRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setIsPinned(!isPinned)}
            >
              <View style={styles.pinTextCol}>
                <Text style={[styles.pinTitle, { color: colors.text }]}>Pin Announcement to Top</Text>
                <Text style={[styles.pinSub, { color: colors.textSecondary }]}>
                  Keep visible at top of all employee dashboards
                </Text>
              </View>
              <Ionicons
                name={isPinned ? 'checkbox' : 'square-outline'}
                size={24}
                color={isPinned ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Content Body */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>Bulletin Content *</Text>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }
              ]}
              placeholder="Enter official announcement details, instructions or guidelines..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={newContent}
              onChangeText={setNewContent}
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.publishSubmitBtn, { backgroundColor: colors.primary }]}
              onPress={handleCreateAnnouncement}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.publishBtnText}>Publish Notice</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12
  },
  backBtn: {
    marginRight: 14
  },
  headerTitleCol: {
    flex: 1
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700'
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  composeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  composeBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6
  },
  filterScroll: {
    paddingHorizontal: 20,
    marginTop: 4
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8
  },
  filterPillText: {
    fontSize: 12
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 14
  },
  emptySubtitle: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: '75%'
  },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6
  },
  pinnedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700'
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  dateText: {
    fontSize: 11
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 22
  },
  announcementContent: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  authorText: {
    fontSize: 11,
    marginLeft: 5
  },
  targetTeamText: {
    fontSize: 11,
    fontWeight: '600'
  },
  modalWrap: {
    flex: 1
  },
  modalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700'
  },
  modalScroll: {
    padding: 20,
    paddingBottom: 50
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 8
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14
  },
  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 14
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: '600'
  },
  pinToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 16
  },
  pinTextCol: {
    flex: 1,
    marginRight: 10
  },
  pinTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  pinSub: {
    fontSize: 11,
    marginTop: 2
  },
  publishSubmitBtn: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24
  },
  publishBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700'
  }
});
