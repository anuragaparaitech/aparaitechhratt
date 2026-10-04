import mongoose from 'mongoose'

const EmployeeSchema = new mongoose.Schema({
  empId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  plainPassword: {
    type: String,
    default: 'Aparaitech123@'
  },
  department: {
    type: String,
    required: true
  },
  joinDate: {
    type: String,
    required: true,
    default: () => new Date().toISOString().split('T')[0]
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'hr', 'employee'],
    default: 'employee'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  shift: {
    type: String,
    enum: ['shift_1', 'shift_2', 'shift_3'],
    default: 'shift_1'
  },
  phone: {
    type: String
  },
  dob: {
    type: String
  },
  designation: {
    type: String
  },
  profileImageUrl: {
    type: String
  },
  // Authentication & Passcode
  passcode: {
    type: String,
    default: '1234'
  },
  resetOtp: {
    code: String,
    expiresAt: Date
  },
  address: {
    type: String
  },
  emergencyContact: {
    type: String
  },
  // Face Enrollment Fields (ArcFace 512D + SCRFD + Anti-Spoofing)
  faceImageUrl: {
    type: String // Relative URL path: /face-uploads/emp-xxx.jpg
  },
  faceEnrolledAt: {
    type: Date // When the face was last enrolled/updated
  },
  faceDescriptor: {
    type: [Number] // 512-dimensional ArcFace or 128-dimensional legacy vector
  },
  faceEmbeddingModel: {
    type: String,
    enum: ['arcface-512d', 'face-api-128d'],
    default: 'arcface-512d'
  },
  livenessVerified: {
    type: Boolean,
    default: false
  },
  livenessScore: {
    type: Number
  }
}, {
  timestamps: true
})

const Employee = mongoose.model('Employee', EmployeeSchema)
export default Employee
