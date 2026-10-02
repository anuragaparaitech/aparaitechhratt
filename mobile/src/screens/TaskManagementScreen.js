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
import { taskAPI } from '../services/api';

export default function TaskManagementScreen() {
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Pending' | 'In Progress' | 'Completed'

  // Task Creation Modal (Manager/Admin)
  const [createModal, setCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [assignEmail, setAssignEmail] = useState('');
  const [deadline, setDeadline] = useState('2026-10-15');
  const [priority, setPriority] = useState('Normal');
  const [creating, setCreating] = useState(false);

  // Task Details Modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentText, setCommentText] = useState('');

  const isManagerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'hr';

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = isManagerOrAdmin
        ? await taskAPI.getAllTasks()
        : await taskAPI.getMyTasks();
      if (res?.success) {
        setTasks(res.data || []);
      }
    } catch (err) {
      console.warn('Fetch tasks error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const handleCreateTask = async () => {
    if (!newTitle.trim() || !newDesc.trim() || !assignEmail.trim()) {
      Alert.alert('Required Fields', 'Please complete title, description, and assignee email.');
      return;
    }

    setCreating(true);
    try {
      await taskAPI.create({
        title: newTitle.trim(),
        description: newDesc.trim(),
        assignedToEmail: assignEmail.trim(),
        deadline,
        priority
      });
      Alert.alert('Task Assigned', 'The task was assigned successfully.');
      setCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      setAssignEmail('');
      fetchTasks();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to assign task');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await taskAPI.updateStatus(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      if (selectedTask?._id === taskId) {
        setSelectedTask(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedTask) return;
    try {
      await taskAPI.addComment(selectedTask._id, commentText.trim());
      setCommentText('');
      fetchTasks();
    } catch (err) {
      Alert.alert('Error', 'Failed to post comment');
    }
  };

  const filtered = tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Bar */}
      <View style={[styles.headerBar, { backgroundColor: theme.cardBackground }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Corporate Task Board</Text>
          <Text style={styles.headerSubtitle}>
            {isManagerOrAdmin ? 'Manage team tasks & deliverables' : 'Your assigned milestones & deadlines'}
          </Text>
        </View>

        {isManagerOrAdmin && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setCreateModal(true)}
          >
            <Text style={styles.addBtnText}>+ Assign</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterScroll}>
        {['all', 'Pending', 'In Progress', 'Completed'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, statusFilter === f && styles.filterChipActive]}
            onPress={() => setStatusFilter(f)}
          >
            <Text style={[styles.filterChipText, statusFilter === f && styles.filterChipTextActive]}>
              {f === 'all' ? 'All Tasks' : f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.accent]} />}
      >
        {loading ? (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 30 }} />
        ) : filtered.length === 0 ? (
          <Text style={styles.emptyText}>No tasks found in this section.</Text>
        ) : (
          filtered.map(t => {
            const isCompleted = t.status === 'Completed';
            const isInProg = t.status === 'In Progress';
            return (
              <TouchableOpacity
                key={t._id}
                style={[styles.taskCard, { backgroundColor: theme.cardBackground }]}
                onPress={() => setSelectedTask(t)}
              >
                <View style={styles.taskCardHeader}>
                  <View style={[
                    styles.priorityTag,
                    t.priority === 'Urgent' ? styles.tagUrgent : (t.priority === 'Important' ? styles.tagImportant : styles.tagNormal)
                  ]}>
                    <Text style={styles.priorityTagText}>{t.priority}</Text>
                  </View>
                  <Text style={styles.taskDeadline}>📅 Due: {t.deadline}</Text>
                </View>

                <Text style={[styles.taskTitle, { color: theme.text }]}>{t.title}</Text>
                <Text style={styles.taskDesc} numberOfLines={2}>{t.description}</Text>

                <View style={styles.taskFooter}>
                  <Text style={styles.assigneeText}>
                    👤 {t.assignedToName} ({t.teamName})
                  </Text>
                  <View style={[
                    styles.statusPill,
                    isCompleted ? styles.pillCompleted : (isInProg ? styles.pillProgress : styles.pillPending)
                  ]}>
                    <Text style={[
                      styles.statusPillText,
                      isCompleted ? styles.pillCompletedText : (isInProg ? styles.pillProgressText : styles.pillPendingText)
                    ]}>
                      {t.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Task Details Modal */}
      <Modal visible={Boolean(selectedTask)} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Task Details</Text>
              <TouchableOpacity onPress={() => setSelectedTask(null)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={[styles.detailTitle, { color: theme.text }]}>{selectedTask?.title}</Text>
              <Text style={styles.detailMeta}>
                Assigned To: {selectedTask?.assignedToName} • By: {selectedTask?.assignedByName}
              </Text>
              <Text style={styles.detailMeta}>Deadline: {selectedTask?.deadline}</Text>

              <Text style={[styles.sectionSubtitle, { color: theme.text }]}>Description:</Text>
              <Text style={styles.detailDesc}>{selectedTask?.description}</Text>

              {/* Status Update Quick Buttons */}
              <Text style={[styles.sectionSubtitle, { color: theme.text, marginTop: 14 }]}>Update Status:</Text>
              <View style={styles.statusButtonsRow}>
                {['Pending', 'In Progress', 'Completed'].map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusBtn,
                      selectedTask?.status === s && styles.statusBtnActive
                    ]}
                    onPress={() => handleUpdateStatus(selectedTask?._id, s)}
                  >
                    <Text style={[
                      styles.statusBtnText,
                      selectedTask?.status === s && styles.statusBtnTextActive
                    ]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Comments Section */}
              <Text style={[styles.sectionSubtitle, { color: theme.text, marginTop: 14 }]}>
                Comments ({selectedTask?.comments?.length || 0}):
              </Text>
              {selectedTask?.comments?.map((c, i) => (
                <View key={i} style={styles.commentBox}>
                  <Text style={styles.commentSender}>{c.senderName}:</Text>
                  <Text style={styles.commentBody}>{c.text}</Text>
                </View>
              ))}

              <View style={styles.commentInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1, color: theme.text, borderColor: theme.border }]}
                  placeholder="Add comment..."
                  placeholderTextColor="#94a3b8"
                  value={commentText}
                  onChangeText={setCommentText}
                />
                <TouchableOpacity style={styles.commentSendBtn} onPress={handleAddComment}>
                  <Text style={styles.commentSendBtnText}>Post</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Task Creation Modal (Manager/Admin) */}
      <Modal visible={createModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Assign New Task</Text>
              <TouchableOpacity onPress={() => setCreateModal(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, marginBottom: 10 }]}
              placeholder="Task Title"
              placeholderTextColor="#94a3b8"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: 'top', color: theme.text, borderColor: theme.border, marginBottom: 10 }]}
              placeholder="Task Description..."
              placeholderTextColor="#94a3b8"
              value={newDesc}
              onChangeText={setNewDesc}
              multiline
            />

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, marginBottom: 10 }]}
              placeholder="Assignee Work Email"
              placeholderTextColor="#94a3b8"
              value={assignEmail}
              onChangeText={setAssignEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, marginBottom: 14 }]}
              placeholder="Deadline (YYYY-MM-DD)"
              placeholderTextColor="#94a3b8"
              value={deadline}
              onChangeText={setDeadline}
            />

            <TouchableOpacity
              style={styles.createSubmitBtn}
              onPress={handleCreateTask}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.createSubmitText}>Assign Task</Text>
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
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800'
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  addBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800'
  },
  filterScroll: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  filterChipActive: {
    backgroundColor: '#0a192f',
    borderColor: '#0a192f'
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
    padding: 16,
    paddingBottom: 40
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginVertical: 40
  },
  taskCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  tagUrgent: {
    backgroundColor: '#fee2e2'
  },
  tagImportant: {
    backgroundColor: '#fef3c7'
  },
  tagNormal: {
    backgroundColor: '#f1f5f9'
  },
  priorityTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f172a'
  },
  taskDeadline: {
    fontSize: 11,
    color: '#64748b'
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4
  },
  taskDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
    marginBottom: 10
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
    paddingTop: 8
  },
  assigneeText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600'
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12
  },
  pillCompleted: {
    backgroundColor: '#dcfce7'
  },
  pillCompletedText: {
    color: '#15803d',
    fontSize: 10,
    fontWeight: '800'
  },
  pillProgress: {
    backgroundColor: '#e0f2fe'
  },
  pillProgressText: {
    color: '#0369a1',
    fontSize: 10,
    fontWeight: '800'
  },
  pillPending: {
    backgroundColor: '#fef3c7'
  },
  pillPendingText: {
    color: '#b45309',
    fontSize: 10,
    fontWeight: '800'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 47, 0.7)',
    justifyContent: 'center',
    padding: 20
  },
  modalCard: {
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800'
  },
  closeText: {
    fontSize: 18,
    color: '#94a3b8'
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6
  },
  detailMeta: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 4
  },
  detailDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center'
  },
  statusBtnActive: {
    backgroundColor: '#2563eb'
  },
  statusBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b'
  },
  statusBtnTextActive: {
    color: '#ffffff'
  },
  commentBox: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6
  },
  commentSender: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb'
  },
  commentBody: {
    fontSize: 12,
    color: '#334155'
  },
  commentInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13
  },
  commentSendBtn: {
    backgroundColor: '#0a192f',
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center'
  },
  commentSendBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12
  },
  createSubmitBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  createSubmitText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14
  }
});
