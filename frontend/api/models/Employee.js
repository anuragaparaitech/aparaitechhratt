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
  // Face Enrollment Fields (optional — added by webcam feature)
  faceImageUrl: {
    type: String // Relative URL path: /face-uploads/emp-xxx.jpg
  },
  faceEnrolledAt: {
    type: Date // When the face was last enrolled/updated
  },
  faceDescriptor: {
    type: [Number] // 128-dimensional face embedding vector (Float32Array serialized as plain array)
  }
}, {
  timestamps: true
})

const Employee = mongoose.model('Employee', EmployeeSchema)
export default Employee
