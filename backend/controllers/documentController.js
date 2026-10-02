import Employee from '../models/Employee.js'

// @desc    Get all available documents for logged in employee
// @route   GET /api/documents/my-documents
// @access  Private
export const getMyDocuments = async (req, res) => {
  try {
    const user = req.user
    const emp = await Employee.findOne({ email: user.email.toLowerCase() }) || user

    const docs = [
      {
        id: 'offer-letter',
        title: 'Official Offer Letter',
        category: 'Employment',
        type: 'Offer Letter',
        issuedDate: emp.joiningDate || '2026-01-15',
        status: 'Active / Verified',
        downloadUrl: `/api/documents/generate/offer-letter`,
        description: 'Official corporate appointment and terms of engagement with Aparaitech Software.'
      },
      {
        id: 'id-card',
        title: 'Company Digital Identity Card',
        category: 'Identification',
        type: 'ID Card',
        issuedDate: emp.joiningDate || '2026-01-15',
        status: 'Valid',
        downloadUrl: `/api/documents/generate/id-card`,
        description: 'Secure digital work credential containing biometric verification barcode and employee serial.'
      },
      {
        id: 'lor',
        title: 'Letter of Recommendation (LOR)',
        category: 'Appraisal',
        type: 'Recommendation',
        issuedDate: '2026-09-30',
        status: 'Approved by Director',
        downloadUrl: `/api/documents/generate/lor`,
        description: 'Executive appraisal certifying business impact, problem-solving, and dedication.'
      },
      {
        id: 'experience-letter',
        title: 'Work Experience Certificate',
        category: 'Certification',
        type: 'Experience Letter',
        issuedDate: '2026-10-01',
        status: 'Certified',
        downloadUrl: `/api/documents/generate/experience-letter`,
        description: 'Formal statement of tenure, designation, department responsibilities, and performance evaluation.'
      },
      {
        id: 'policy-handbook',
        title: 'Aparaitech Employee Handbook & Code of Conduct',
        category: 'Policy',
        type: 'Company Policy',
        issuedDate: '2026-01-01',
        status: 'Active Policy v2.4',
        downloadUrl: `/api/documents/generate/policy`,
        description: 'Operational guidelines, compliance rules, shift timings, and data confidentiality expectations.'
      }
    ]

    res.json({ success: true, data: docs })
  } catch (error) {
    console.error('getMyDocuments error:', error)
    res.status(500).json({ success: false, message: 'Server error retrieving documents', error: error.message })
  }
}

// @desc    Generate dynamic document content
// @route   GET /api/documents/generate/:docType
// @access  Private
export const generateDocument = async (req, res) => {
  try {
    const { docType } = req.params
    const user = req.user
    const emp = await Employee.findOne({ email: user.email.toLowerCase() }) || user

    const dateStr = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const docData = {
      empName: emp.name,
      empId: emp.empId || 'AP-EMP',
      email: emp.email,
      department: emp.department || 'Business Development',
      role: emp.role === 'admin' ? 'Administrator' : (emp.role === 'manager' ? 'Team Lead' : 'Associate'),
      joiningDate: emp.joiningDate || 'January 15, 2026',
      currentDate: dateStr,
      company: 'Aparaitech Software & Tech Solutions Pvt. Ltd.',
      address: 'Optenix Tech Solution, Hinjawadi Phase 1, Pune, Maharashtra 411057',
      authorizedSignatory: 'Anurag Patil (Managing Director)',
      docType
    }

    res.json({ success: true, document: docData })
  } catch (error) {
    console.error('generateDocument error:', error)
    res.status(500).json({ success: false, message: 'Server error generating document', error: error.message })
  }
}
