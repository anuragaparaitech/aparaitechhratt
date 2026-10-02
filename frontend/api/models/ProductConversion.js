import mongoose from 'mongoose'

const ProductConversionSchema = new mongoose.Schema({
  candidateName: {
    type: String,
    required: [true, 'Candidate name is required'],
    trim: true
  },
  candidateEmail: {
    type: String,
    required: [true, 'Candidate email is required'],
    lowercase: true,
    trim: true
  },
  candidatePhone: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true
  },
  collegeName: {
    type: String,
    required: [true, 'College name is required'],
    trim: true
  },
  paymentType: {
    type: String,
    enum: ['onboarding', 'finalize', 'full'],
    required: [true, 'Payment type is required'] // onboarding: ₹1,500 | finalize: ₹4,500 | full: ₹6,000
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentUtr: {
    type: String,
    required: [true, 'Payment UTR / Transaction ID is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['onboarding_pending_final', 'completed'],
    default: 'completed'
  },
  onboardingDate: {
    type: String, // YYYY-MM-DD
    required: true
  },
  dueDate: {
    type: String, // YYYY-MM-DD (7 days after onboardingDate)
    required: true
  },
  finalizeUtr: {
    type: String,
    default: '',
    trim: true
  },
  finalizeDate: {
    type: String,
    default: '',
    trim: true
  },
  finalizeAmount: {
    type: Number,
    default: 0
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  loggedByEmployeeId: {
    type: String,
    required: true,
    trim: true
  },
  loggedByName: {
    type: String,
    required: true,
    trim: true
  },
  loggedByEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  teamName: {
    type: String,
    default: 'BDA Team',
    trim: true
  },
  remarks: {
    type: String,
    default: '',
    trim: true
  },
  receiptUrl: {
    type: String,
    default: ''
  },
  receiptName: {
    type: String,
    default: '',
    trim: true
  },
  finalizeReceiptUrl: {
    type: String,
    default: ''
  },
  finalizeReceiptName: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
})

// Index for search & queries
ProductConversionSchema.index({ onboardingDate: -1, loggedByEmail: 1 })
ProductConversionSchema.index({ status: 1, dueDate: 1 })

const ProductConversion = mongoose.model('ProductConversion', ProductConversionSchema)
export default ProductConversion
