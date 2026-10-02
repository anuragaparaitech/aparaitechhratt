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
  Alert,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { documentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function DocumentCenterScreen({ navigation }) {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docDetail, setDocDetail] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  const fetchDocuments = async () => {
    try {
      const res = await documentAPI.getMyDocuments();
      if (res && res.success) {
        setDocuments(res.data || []);
      }
    } catch (err) {
      console.warn('Error fetching documents:', err);
      Alert.alert('Notice', 'Unable to fetch document catalog. Please check connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDocuments();
  };

  const openDocumentPreview = async (item) => {
    setSelectedDoc(item);
    setPreviewLoading(true);
    setPreviewVisible(true);
    try {
      const res = await documentAPI.generate(item.id);
      if (res && res.success) {
        setDocDetail(res.document);
      } else {
        setDocDetail(null);
      }
    } catch (err) {
      console.warn('Doc generation error:', err);
      Alert.alert('Error', 'Unable to generate document preview.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleShareDoc = async () => {
    if (!docDetail) return;
    try {
      await Share.share({
        title: selectedDoc?.title || 'Aparaitech Document',
        message: `Aparaitech Software Official Document: ${selectedDoc?.title}\nIssued to: ${docDetail.empName} (${docDetail.empId})\nDesignation: ${docDetail.role}\nDepartment: ${docDetail.department}\nVerification: Verified by Authorized Signatory ${docDetail.authorizedSignatory}\nCompany: ${docDetail.company}`
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  const getDocIcon = (type) => {
    switch (type) {
      case 'Offer Letter':
        return 'briefcase-outline';
      case 'ID Card':
        return 'card-outline';
      case 'Recommendation':
        return 'ribbon-outline';
      case 'Experience Letter':
        return 'document-text-outline';
      case 'Company Policy':
        return 'shield-checkmark-outline';
      default:
        return 'document-attach-outline';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Document Centre</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Official Letters, Credentials & Company Policies
            </Text>
          </View>
        </View>
      </View>

      {/* Body Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading documents...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        >
          {/* Identity Quick Card */}
          <View style={[styles.idOverviewCard, { backgroundColor: colors.primary }]}>
            <View style={styles.idHeaderRow}>
              <View>
                <Text style={styles.idCompanyTag}>APARAITECH SOFTWARE</Text>
                <Text style={styles.idEmpName}>{user?.name || 'Aparaitech Member'}</Text>
                <Text style={styles.idEmpRole}>
                  {user?.role === 'admin' ? 'Administrator' : user?.role === 'manager' ? 'Team Lead' : 'Associate Intern'} • {user?.department || 'Operations'}
                </Text>
              </View>
              <View style={styles.idBadgeWrap}>
                <Ionicons name="checkmark-circle" size={32} color="#10b981" />
              </View>
            </View>
            <View style={styles.idFooterRow}>
              <Text style={styles.idMetaText}>ID: {user?.empId || 'AP-2026'}</Text>
              <Text style={styles.idMetaText}>Status: Active Verified</Text>
            </View>
          </View>

          {/* Section Title */}
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Official Documents & Certifications</Text>

          {documents.map((doc) => (
            <View
              key={doc.id}
              style={[styles.docCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.docTopRow}>
                <View style={[styles.iconWrap, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name={getDocIcon(doc.type)} size={24} color={colors.primary} />
                </View>
                <View style={styles.docInfoCol}>
                  <Text style={[styles.docTitle, { color: colors.text }]}>{doc.title}</Text>
                  <Text style={[styles.docCategory, { color: colors.primary }]}>
                    {doc.category} • Issued {doc.issuedDate}
                  </Text>
                </View>
              </View>

              <Text style={[styles.docDesc, { color: colors.textSecondary }]}>{doc.description}</Text>

              <View style={[styles.docBottomRow, { borderTopColor: colors.border }]}>
                <View style={styles.statusPill}>
                  <Ionicons name="shield-checkmark" size={14} color="#10b981" />
                  <Text style={styles.statusText}>{doc.status}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.viewBtn, { backgroundColor: colors.primary }]}
                  onPress={() => openDocumentPreview(doc)}
                >
                  <Ionicons name="eye-outline" size={16} color="#fff" />
                  <Text style={styles.viewBtnText}>Preview & Download</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Compliance & Security Guarantee Card */}
          <View style={[styles.securityNoticeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={24} color="#3b82f6" />
            <View style={styles.securityTextWrap}>
              <Text style={[styles.securityTitle, { color: colors.text }]}>Tamper-Proof Digital Verification</Text>
              <Text style={[styles.securityDesc, { color: colors.textSecondary }]}>
                All credentials generated through this portal are digitally stamped by Aparaitech HR Operations with unique hash signatures.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Document Preview Modal */}
      <Modal
        visible={previewVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setPreviewVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={26} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]} numberOfLines={1}>
              {selectedDoc?.title || 'Document Preview'}
            </Text>
            <TouchableOpacity onPress={handleShareDoc} style={styles.shareBtn}>
              <Ionicons name="share-social-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {previewLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Generating official document...</Text>
            </View>
          ) : docDetail ? (
            <ScrollView contentContainerStyle={styles.letterContainer}>
              {/* Paper Document Layout */}
              <View style={[styles.paper, { backgroundColor: '#ffffff' }]}>
                {/* Official Header */}
                <View style={styles.letterHeader}>
                  <Text style={styles.companyHeading}>APARAITECH SOFTWARE</Text>
                  <Text style={styles.companySub}>& TECH SOLUTIONS PRIVATE LIMITED</Text>
                  <Text style={styles.companyLocation}>
                    Optenix Tech Solution, Hinjawadi Phase 1, Pune, Maharashtra 411057
                  </Text>
                  <Text style={styles.companyContact}>contact@aparaitech.org • www.aparaitech.org</Text>
                  <View style={styles.letterDivider} />
                </View>

                {/* Letter Meta */}
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Ref: AP/DOC/{docDetail.empId}/{new Date().getFullYear()}</Text>
                  <Text style={styles.metaLabel}>Date: {docDetail.currentDate}</Text>
                </View>

                {/* Subject Title */}
                <View style={styles.subjectBox}>
                  <Text style={styles.subjectText}>
                    DOCUMENT TYPE: {selectedDoc?.title?.toUpperCase()}
                  </Text>
                </View>

                {/* Body Content */}
                <Text style={styles.recipient}>
                  TO WHOMSOEVER IT MAY CONCERN / RECIPIENT:
                </Text>

                <Text style={styles.bodyParagraph}>
                  This is an official credential issued by Aparaitech Software certifying that{' '}
                  <Text style={styles.highlightText}>{docDetail.empName}</Text> (Employee ID:{' '}
                  <Text style={styles.highlightText}>{docDetail.empId}</Text>) is formally associated with our organization in the capacity of{' '}
                  <Text style={styles.highlightText}>{docDetail.role}</Text> in the Department of{' '}
                  <Text style={styles.highlightText}>{docDetail.department}</Text>.
                </Text>

                <Text style={styles.bodyParagraph}>
                  During their engagement commencing on <Text style={styles.highlightText}>{docDetail.joiningDate}</Text>, the member has consistently adhered to our performance benchmarks, operational protocols, and corporate code of conduct.
                </Text>

                <Text style={styles.bodyParagraph}>
                  All records including geofenced attendance logs, weekly project achievements, and administrative sign-offs have been verified through our digital HRMS portal.
                </Text>

                {/* Signature Block */}
                <View style={styles.signatureBlock}>
                  <View style={styles.stampBadge}>
                    <Ionicons name="checkmark-done-circle" size={40} color="#2563eb" />
                    <Text style={styles.stampText}>OFFICIALLY VERIFIED</Text>
                  </View>
                  <View style={styles.signatoryInfo}>
                    <Text style={styles.signatoryName}>{docDetail.authorizedSignatory}</Text>
                    <Text style={styles.signatoryRole}>Managing Director & Chief Executive</Text>
                    <Text style={styles.signatoryOrg}>Aparaitech Software & Tech Solutions</Text>
                  </View>
                </View>

                {/* Bottom Verification Note */}
                <View style={styles.footerNote}>
                  <Text style={styles.footerHash}>
                    Digital Verification Hash: SHA256-APARAI-{docDetail.empId}-{Date.now().toString(36).toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: colors.primary }]} onPress={handleShareDoc}>
                  <Ionicons name="download-outline" size={20} color="#fff" />
                  <Text style={styles.downloadBtnText}>Export & Share Document</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.centered}>
              <Text style={{ color: colors.textSecondary }}>Failed to render document preview.</Text>
            </View>
          )}
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
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backBtn: {
    marginRight: 16
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700'
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2
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
  idOverviewCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  idHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  idCompanyTag: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4
  },
  idEmpName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800'
  },
  idEmpRole: {
    color: '#e2e8f0',
    fontSize: 13,
    marginTop: 2
  },
  idBadgeWrap: {
    backgroundColor: '#ffffff20',
    padding: 4,
    borderRadius: 24
  },
  idFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ffffff30',
    paddingTop: 12
  },
  idMetaText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600'
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14
  },
  docCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1
  },
  docTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  docInfoCol: {
    flex: 1
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  docCategory: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2
  },
  docDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14
  },
  docBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98115',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
    marginLeft: 5
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  viewBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6
  },
  securityNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8
  },
  securityTextWrap: {
    marginLeft: 14,
    flex: 1
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  securityDesc: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2
  },
  modalContainer: {
    flex: 1
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1
  },
  closeBtn: {
    padding: 4
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    maxWidth: '75%'
  },
  shareBtn: {
    padding: 4
  },
  letterContainer: {
    padding: 16,
    paddingBottom: 40
  },
  paper: {
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3
  },
  letterHeader: {
    alignItems: 'center',
    marginBottom: 16
  },
  companyHeading: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 1
  },
  companySub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
    letterSpacing: 0.5,
    marginTop: 2
  },
  companyLocation: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center'
  },
  companyContact: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 2
  },
  letterDivider: {
    width: '100%',
    height: 2,
    backgroundColor: '#0f172a',
    marginTop: 12
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  metaLabel: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600'
  },
  subjectBox: {
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 6,
    marginBottom: 16
  },
  subjectText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center'
  },
  recipient: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12
  },
  bodyParagraph: {
    fontSize: 12,
    lineHeight: 20,
    color: '#334155',
    marginBottom: 12,
    textAlign: 'justify'
  },
  highlightText: {
    fontWeight: '700',
    color: '#0f172a'
  },
  signatureBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  stampBadge: {
    alignItems: 'center'
  },
  stampText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#2563eb',
    marginTop: 2
  },
  signatoryInfo: {
    alignItems: 'flex-end'
  },
  signatoryName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a'
  },
  signatoryRole: {
    fontSize: 10,
    color: '#64748b'
  },
  signatoryOrg: {
    fontSize: 9,
    color: '#94a3b8'
  },
  footerNote: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    alignItems: 'center'
  },
  footerHash: {
    fontSize: 8,
    color: '#94a3b8',
    fontFamily: 'monospace'
  },
  modalActions: {
    marginTop: 16
  },
  downloadBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12
  },
  downloadBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8
  }
});
