import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import { seedDatabase } from './controllers/employeeController.js'
import authRoutes from './routes/authRoutes.js'
import employeeRoutes from './routes/employeeRoutes.js'
import attendanceRoutes from './routes/attendanceRoutes.js'
import holidayRoutes from './routes/holidayRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import faceRoutes from './routes/faceRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import leaveRoutes from './routes/leaveRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import announcementRoutes from './routes/announcementRoutes.js'
import documentRoutes from './routes/documentRoutes.js'
import productConversionRoutes from './routes/productConversionRoutes.js'
import leadRoutes from './routes/leadRoutes.js'
import { initScheduler } from './services/schedulerService.js'

// Load environment variables
dotenv.config()

// Connect to MongoDB Atlas and Seed Initial Data
connectDB().then(() => {
  seedDatabase()
  initScheduler()
})

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8081',
  'http://localhost:19006',
  'http://localhost',
  'https://localhost',
  'capacitor://localhost',
  'ionic://localhost'
]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    const isAllowed = allowedOrigins.indexOf(origin) !== -1 || 
                      origin.endsWith('.vercel.app') || 
                      origin.startsWith('https://aparaitech-') ||
                      origin.startsWith('https://localhost') ||
                      origin.startsWith('http://localhost') ||
                      origin.startsWith('capacitor://')
    if (isAllowed) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json({ limit: '50mb' })) // Increase payload limit to allow base64 file uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Serve uploaded attachments statically
app.use('/uploads', express.static('uploads'))
app.use('/face-uploads', express.static('face-uploads'))
app.use('/attendance-photos', express.static('attendance-photos'))
app.use('/profile-uploads', express.static('profile-uploads'))

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/holidays', holidayRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/face', faceRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/leaves', leaveRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/announcements', announcementRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/conversions', productConversionRoutes)
app.use('/api/product-conversions', productConversionRoutes)
app.use('/api/product_conversions', productConversionRoutes)
app.use('/api/leads', leadRoutes)

// Default Health Route
app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'Aparaitech HRMS API is online!' })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal server error', error: err.message })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
})
