import ProductConversion from '../models/ProductConversion.js'
import Employee from '../models/Employee.js'

// Helper for IST Date (YYYY-MM-DD)
const getKolkataDate = () => {
  const now = new Date()
  const kolkataStr = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  const kDate = new Date(kolkataStr)
  const year = kDate.getFullYear()
  const month = String(kDate.getMonth() + 1).padStart(2, '0')
  const day = String(kDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Helper to add days to YYYY-MM-DD
const addDaysToDate = (dateStr, days = 7) => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  const y2 = dt.getUTCFullYear()
  const m2 = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const d2 = String(dt.getUTCDate()).padStart(2, '0')
  return `${y2}-${m2}-${d2}`
}

// Calculate days between two YYYY-MM-DD dates
const getDaysDiff = (date1, date2) => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = d2.getTime() - d1.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

// @desc    Log a new product conversion / onboarding payment
// @route   POST /api/conversions
// @access  Private (Employees, BDA, Managers, Admin)
export const createConversion = async (req, res) => {
  try {
    const {
      candidateName,
      candidateEmail,
      candidatePhone,
      collegeName,
      paymentType,
      paymentUtr,
      remarks,
      customDate
    } = req.body

    if (!candidateName || !candidateEmail || !candidatePhone || !collegeName || !paymentType || !paymentUtr) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Candidate Name, Email, Phone, College, Payment Type, and Payment UTR) are required.'
      })
    }

    const validTypes = ['onboarding', 'finalize', 'full']
    if (!validTypes.includes(paymentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment type. Must be "onboarding" (₹1,500), "finalize" (₹4,500), or "full" (₹6,000).'
      })
    }

    const user = req.user
    const emp = await Employee.findOne({ email: user.email.toLowerCase() })

    const today = customDate || getKolkataDate()
    const dueDate = addDaysToDate(today, 7)

    let amount = 0
    let status = 'completed'
    let finalizeAmount = 0
    let finalizeUtr = ''
    let finalizeDate = ''

    if (paymentType === 'onboarding') {
      amount = 1500
      status = 'onboarding_pending_final'
    } else if (paymentType === 'finalize') {
      amount = 4500
      status = 'completed'
      finalizeAmount = 4500
      finalizeUtr = paymentUtr.trim()
      finalizeDate = today
    } else if (paymentType === 'full') {
      amount = 6000
      status = 'completed'
    }

    const totalPaid = amount + finalizeAmount

    const newRecord = new ProductConversion({
      candidateName: candidateName.trim(),
      candidateEmail: candidateEmail.toLowerCase().trim(),
      candidatePhone: candidatePhone.trim(),
      collegeName: collegeName.trim(),
      paymentType,
      amount,
      paymentUtr: paymentUtr.trim(),
      status,
      onboardingDate: today,
      dueDate,
      finalizeUtr,
      finalizeDate,
      finalizeAmount,
      totalPaid,
      loggedByEmployeeId: emp?.empId || user.empId || 'AP-USER',
      loggedByName: emp?.name || user.name || 'Team Associate',
      loggedByEmail: user.email.toLowerCase().trim(),
      teamName: emp?.department || 'BDA Team',
      remarks: (remarks || '').trim()
    })

    await newRecord.save()

    res.status(201).json({
      success: true,
      message: `Product conversion recorded successfully! Added ₹${amount.toLocaleString('en-IN')} to company revenue.`,
      conversion: newRecord
    })
  } catch (error) {
    console.error('createConversion error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to record product conversion',
      error: error.message
    })
  }
}

// @desc    Get all product conversions & onboarding pipeline
// @route   GET /api/conversions
// @access  Private
export const getConversions = async (req, res) => {
  try {
    const { search, status, dueOnly, myOnly } = req.query
    const today = getKolkataDate()

    let query = {}

    if (myOnly === 'true' && req.user.role !== 'admin') {
      query.loggedByEmail = req.user.email.toLowerCase()
    }

    if (status && status !== 'all') {
      query.status = status
    }

    if (search) {
      const s = search.trim()
      query.$or = [
        { candidateName: { $regex: s, $options: 'i' } },
        { candidateEmail: { $regex: s, $options: 'i' } },
        { candidatePhone: { $regex: s, $options: 'i' } },
        { collegeName: { $regex: s, $options: 'i' } },
        { paymentUtr: { $regex: s, $options: 'i' } },
        { finalizeUtr: { $regex: s, $options: 'i' } },
        { loggedByName: { $regex: s, $options: 'i' } }
      ]
    }

    const allRecords = await ProductConversion.find(query).sort({ createdAt: -1 })

    // Annotate records with elapsed days and due status
    const annotated = allRecords.map(item => {
      const doc = item.toObject()
      const daysSinceOnboarding = getDaysDiff(doc.onboardingDate, today)
      const isDue = doc.status === 'onboarding_pending_final' && daysSinceOnboarding >= 7
      return {
        ...doc,
        daysSinceOnboarding,
        isDue,
        pendingAmount: doc.status === 'onboarding_pending_final' ? 4500 : 0
      }
    })

    const finalRecords = dueOnly === 'true'
      ? annotated.filter(r => r.isDue)
      : annotated

    // Summary calculations across all conversions
    const totalRevenue = annotated.reduce((acc, curr) => acc + (curr.amount || 0) + (curr.finalizeAmount || 0), 0)
    const onboardingCount = annotated.filter(r => r.paymentType === 'onboarding').length
    const pendingFinalizeCount = annotated.filter(r => r.status === 'onboarding_pending_final').length
    const dueFollowUpsCount = annotated.filter(r => r.isDue).length
    const fullPaymentCount = annotated.filter(r => r.paymentType === 'full').length
    const finalizedCount = annotated.filter(r => r.finalizeAmount > 0 || r.paymentType === 'finalize').length

    res.json({
      success: true,
      data: finalRecords,
      summary: {
        totalRevenue,
        totalConversions: annotated.length,
        onboardingCount,
        pendingFinalizeCount,
        dueFollowUpsCount,
        fullPaymentCount,
        finalizedCount,
        todayDate: today
      }
    })
  } catch (error) {
    console.error('getConversions error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve product conversions',
      error: error.message
    })
  }
}

// @desc    Complete finalize payment for a candidate (remaining ₹4,500)
// @route   PATCH /api/conversions/:id/finalize
// @access  Private (Admin, Managers, or the Employee who logged it)
export const finalizePayment = async (req, res) => {
  try {
    const { id } = req.params
    const { finalizeUtr, remarks } = req.body

    if (!finalizeUtr || !finalizeUtr.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Finalize payment UTR / Transaction Reference ID is required.'
      })
    }

    const conversion = await ProductConversion.findById(id)
    if (!conversion) {
      return res.status(404).json({ success: false, message: 'Conversion record not found.' })
    }

    if (conversion.status === 'completed') {
      return res.status(400).json({ success: false, message: 'This candidate has already completed full payment.' })
    }

    const today = getKolkataDate()
    conversion.finalizeUtr = finalizeUtr.trim()
    conversion.finalizeDate = today
    conversion.finalizeAmount = 4500
    conversion.totalPaid = (conversion.amount || 1500) + 4500
    conversion.status = 'completed'
    if (remarks) {
      conversion.remarks = conversion.remarks
        ? `${conversion.remarks} | Finalize: ${remarks.trim()}`
        : remarks.trim()
    }

    await conversion.save()

    res.json({
      success: true,
      message: `Finalize payment of ₹4,500 recorded! Total product payment of ₹6,000 completed.`,
      conversion
    })
  } catch (error) {
    console.error('finalizePayment error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to finalize payment',
      error: error.message
    })
  }
}

// @desc    Get 7-Day Follow-Up Alerts for Admin
// @route   GET /api/conversions/admin-alerts
// @access  Private (Admin & Managers)
export const getAdminAlerts = async (req, res) => {
  try {
    const today = getKolkataDate()
    const pendingOnboardings = await ProductConversion.find({ status: 'onboarding_pending_final' })

    const dueCandidates = pendingOnboardings
      .map(item => {
        const doc = item.toObject()
        const days = getDaysDiff(doc.onboardingDate, today)
        return {
          ...doc,
          daysSinceOnboarding: days,
          isDue: days >= 7
        }
      })
      .filter(item => item.isDue)

    res.json({
      success: true,
      count: dueCandidates.length,
      alerts: dueCandidates
    })
  } catch (error) {
    console.error('getAdminAlerts error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve follow-up alerts',
      error: error.message
    })
  }
}
