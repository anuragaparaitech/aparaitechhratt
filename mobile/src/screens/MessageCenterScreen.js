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
  Modal
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { messageAPI } from '../services/api';

export default function MessageCenterScreen({ navigation }) {
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'archived'
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all' | 'urgent' | 'important' | 'normal'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Compose Modal (for admin/manager)
  const [composeModalVisible, setComposeModalVisible] = useState(false);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composePriority, setComposePriority] = useState('normal');
  const [composeTargetTeam, setComposeTargetTeam] = useState('All');
  const [sending, setSending] = useState(false);

  const isManagerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'hr';

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await messageAPI.getEmployeeMessages();
      if (res?.success) {
        setMessages(res.data || []);
      }
    } catch (err) {
      console.warn('Fetch messages error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMessage = async (msg) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      try {
        await messageAPI.markAsRead(msg._id);
        setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isRead: true } : m));
      } catch (err) {
        console.warn('Mark read error:', err);
      }
    }
  };

  const handleToggleArchive = async (msgId) => {
    try {
      await messageAPI.toggleArchive(msgId);
      setMessages(prev => prev.map(m => m._id === msgId ? { ...m, isArchived: !m.isArchived } : m));
      if (selectedMessage?._id === msgId) {
        setSelectedMessage(null);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to archive message');
    }
  };

  const handleBroadcastMessage = async () => {
    if (!composeSubject.trim() || !composeBody.trim()) {
      Alert.alert('Required Fields', 'Please enter subject and message body.');
      return;
    }

    setSending(true);
    try {
      await messageAPI.broadcast({
        subject: composeSubject.trim(),
        message: composeBody.trim(),
        priority: composePriority,
        team: composeTargetTeam
      });
      Alert.alert('Sent', 'Directive broadcasted successfully.');
      setComposeModalVisible(false);
      setComposeSubject('');
      setComposeBody('');
      fetchMessages();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  const filtered = messages.filter(m => {
    const isArchived = Boolean(m.isArchived);
    if (activeTab === 'inbox' && isArchived) return false;
    if (activeTab === 'archived' && !isArchived) return false;

    if (priorityFilter !== 'all' && (m.priority || 'normal').toLowerCase() !== priorityFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const subMatch = (m.subject || '').toLowerCase().includes(q);
      const senderMatch = (m.sender || '').toLowerCase().includes(q);
      if (!subMatch && !senderMatch) return false;
    }

    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header with Compose Button */}
      <View style={[styles.topHeader, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.tabButtons}>
          <TouchableOpacity
            style={[styles.subTab, activeTab === 'inbox' && styles.subTabActive]}
            onPress={() => setActiveTab('inbox')}
          >
            <Text style={[styles.subTabText, activeTab === 'inbox' && styles.subTabTextActive]}>
              📥 Inbox ({messages.filter(m => !m.isArchived).length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTab, activeTab === 'archived' && styles.subTabActive]}
            onPress={() => setActiveTab('archived')}
          >
            <Text style={[styles.subTabText, activeTab === 'archived' && styles.subTabTextActive]}>
              🗄️ Archived
            </Text>
          </TouchableOpacity>
        </View>

        {isManagerOrAdmin && (
          <TouchableOpacity
            style={styles.composeBtn}
            onPress={() => setComposeModalVisible(true)}
          >
            <Text style={styles.composeBtnText}>✍️ Compose</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search & Priority Filter Row */}
      <View style={styles.filterRow}>
        <TextInput
          style={[styles.searchInput, { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          placeholder="🔍 Search directives..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.priorityFilterScroll}>
          {[
            { id: 'all', label: 'All' },
            { id: 'urgent', label: '🔴 Urgent' },
            { id: 'important', label: '🟠 Important' },
            { id: 'normal', label: '⚪ Normal' }
          ].map(p => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.filterChip,
                priorityFilter === p.id && styles.filterChipActive
              ]}
              onPress={() => setPriorityFilter(p.id)}
            >
              <Text style={[
                styles.filterChipText,
                priorityFilter === p.id && styles.filterChipTextActive
              ]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Message List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {loading ? (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <Text style={styles.emptyText}>No messages in this folder.</Text>
        ) : (
          filtered.map((msg) => {
            const isUrgent = (msg.priority || '').toLowerCase() === 'urgent';
            const isImportant = (msg.priority || '').toLowerCase() === 'important';

            return (
              <TouchableOpacity
                key={msg._id}
                style={[
                  styles.msgCard,
                  { backgroundColor: theme.cardBackground },
                  !msg.isRead && styles.msgUnread,
                  isUrgent && styles.cardUrgent,
                  isImportant && styles.cardImportant
                ]}
                onPress={() => handleOpenMessage(msg)}
              >
                <View style={styles.msgHeader}>
                  <View style={styles.senderInfo}>
                    <Text style={[styles.senderName, { color: theme.text }]}>
                      {msg.sender || 'Admin Executive'}
                    </Text>
                    {msg.isBroadcast && (
                      <View style={styles.broadcastTag}>
                        <Text style={styles.broadcastTagText}>ALL</Text>
                      </View>
                    )}
                  </View>

                  <View style={[
                    styles.priorityPill,
                    isUrgent ? styles.pillUrgent : (isImportant ? styles.pillImportant : styles.pillNormal)
                  ]}>
                    <Text style={styles.priorityPillText}>
                      {(msg.priority || 'Normal').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={[
                  styles.msgSubject,
                  { color: isUrgent ? '#dc2626' : (isImportant ? '#ea580c' : theme.text) },
                  !msg.isRead && { fontWeight: '900' }
                ]}>
                  {msg.subject}
                </Text>

                <Text style={styles.msgBodySnippet} numberOfLines={2}>
                  {msg.message}
                </Text>

                <View style={styles.msgFooter}>
                  <Text style={styles.msgDate}>
                    {new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <TouchableOpacity
                    style={styles.archiveAction}
                    onPress={() => handleToggleArchive(msg._id)}
                  >
                    <Text style={styles.archiveActionText}>
                      {msg.isArchived ? 'Unarchive' : 'Archive'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Message Reader Modal */}
      <Modal visible={Boolean(selectedMessage)} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.readerHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.readerSubject, { color: theme.text }]}>
                  {selectedMessage?.subject}
                </Text>
                <Text style={styles.readerSender}>
                  From: {selectedMessage?.sender} • {new Date(selectedMessage?.createdAt || Date.now()).toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedMessage(null)}>
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.readerBodyScroll}>
              <Text style={[styles.readerBody, { color: theme.text }]}>
                {selectedMessage?.message}
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelectedMessage(null)}
            >
              <Text style={styles.closeBtnText}>Close Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Compose Directive Modal (Manager/Admin) */}
      <Modal visible={composeModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.readerHeader}>
              <Text style={[styles.readerSubject, { color: theme.text }]}>Compose Directive</Text>
              <TouchableOpacity onPress={() => setComposeModalVisible(false)}>
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, marginBottom: 12 }]}
              placeholder="Notice Subject"
              placeholderTextColor="#94a3b8"
              value={composeSubject}
              onChangeText={setComposeSubject}
            />

            <TextInput
              style={[styles.input, styles.composeArea, { color: theme.text, borderColor: theme.border, marginBottom: 12 }]}
              placeholder="Message body / directive content..."
              placeholderTextColor="#94a3b8"
              value={composeBody}
              onChangeText={setComposeBody}
              multiline
            />

            {/* Priority Selector */}
            <View style={styles.composeOptionsRow}>
              {['normal', 'important', 'urgent'].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.prioritySelectBtn,
                    composePriority === p && styles.prioritySelectActive
                  ]}
                  onPress={() => setComposePriority(p)}
                >
                  <Text style={[
                    styles.prioritySelectText,
                    composePriority === p && styles.prioritySelectTextActive
                  ]}>
                    {p.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: theme.accent }]}
              onPress={handleBroadcastMessage}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.sendBtnText}>🚀 Dispatch Announcement</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  tabButtons: {
    flexDirection: 'row',
    gap: 8
  },
  subTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  subTabActive: {
    backgroundColor: '#0a192f'
  },
  subTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b'
  },
  subTabTextActive: {
    color: '#ffffff'
  },
  composeBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8
  },
  composeBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800'
  },
  filterRow: {
    padding: 12,
    gap: 8
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13
  },
  priorityFilterScroll: {
    flexDirection: 'row'
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    marginRight: 8
  },
  filterChipActive: {
    backgroundColor: '#0a192f'
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b'
  },
  filterChipTextActive: {
    color: '#ffffff'
  },
  listContent: {
    padding: 12,
    paddingBottom: 40
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginVertical: 40
  },
  msgCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1
  },
  msgUnread: {
    borderColor: '#93c5fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb'
  },
  cardUrgent: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444'
  },
  cardImportant: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b'
  },
  msgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  senderName: {
    fontSize: 13,
    fontWeight: '800'
  },
  broadcastTag: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4
  },
  broadcastTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#b45309'
  },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  pillUrgent: {
    backgroundColor: '#fee2e2'
  },
  pillImportant: {
    backgroundColor: '#fef3c7'
  },
  pillNormal: {
    backgroundColor: '#f1f5f9'
  },
  priorityPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0f172a'
  },
  msgSubject: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4
  },
  msgBodySnippet: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
    marginBottom: 8
  },
  msgFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc'
  },
  msgDate: {
    fontSize: 10,
    color: '#94a3b8'
  },
  archiveActionText: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '600'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 47, 0.7)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%'
  },
  readerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10
  },
  readerSubject: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4
  },
  readerSender: {
    fontSize: 11,
    color: '#64748b'
  },
  closeModalText: {
    fontSize: 20,
    color: '#94a3b8',
    padding: 4
  },
  readerBodyScroll: {
    marginVertical: 10
  },
  readerBody: {
    fontSize: 14,
    lineHeight: 22
  },
  closeBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },
  closeBtnText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 13
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14
  },
  composeArea: {
    height: 120,
    textAlignVertical: 'top'
  },
  composeOptionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  prioritySelectBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f1f5f9'
  },
  prioritySelectActive: {
    backgroundColor: '#0a192f'
  },
  prioritySelectText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b'
  },
  prioritySelectTextActive: {
    color: '#ffffff'
  },
  sendBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  sendBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14
  }
});
