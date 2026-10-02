import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

// Route Imports
import authRoutes from './_backend/routes/authRoutes.js'
import employeeRoutes from './_backend/routes/employeeRoutes.js'
import attendanceRoutes from './_backend/routes/attendanceRoutes.js'
import holidayRoutes from './_backend/routes/holidayRoutes.js'
import messageRoutes from './_backend/routes/messageRoutes.js'
import faceRoutes from './_backend/routes/faceRoutes.js'
import reportRoutes from './_backend/routes/reportRoutes.js'
import analyticsRoutes from './_backend/routes/analyticsRoutes.js'
import leaveRoutes from './_backend/routes/leaveRoutes.js'
import taskRoutes from './_backend/routes/taskRoutes.js'
import announcementRoutes from './_backend/routes/announcementRoutes.js'
import documentRoutes from './_backend/routes/documentRoutes.js'
import productConversionRoutes from './_backend/routes/productConversionRoutes.js'
import { seedDatabase } from './_backend/controllers/employeeController.js'

dotenv.config()

const app = express()

// ── Fallback Credentials for 100% Reliable Atlas Connection ──
const MONGODB_ATLAS_URI = process.env.MONGODB_URI || 'mongodb+srv://portalaparaitech_db_user:BIoRSFJc7Yc6aReK@cluster0.ndpqh89.mongodb.net/aparaitech_attendance?retryWrites=true&w=majority'

// Global Mongoose Connection Cache for Serverless Execution
let cached = global.mongooseInstance
if (!cached) {
  cached = global.mongooseInstance = { conn: null, promise: null, seeded: false }
}

async function connectToDatabase() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_ATLAS_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000
    }).then(async (m) => {
      console.log(`📡 MongoDB Atlas Connected to: ${m.connection.host}/${m.connection.name}`)
      if (!cached.seeded) {
        cached.seeded = true
        try {
          await seedDatabase()
        } catch (sErr) {
          console.warn('Seeding note:', sErr.message)
        }
      }
      return m
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    cached.promise = null
    console.error('❌ MongoDB Atlas Connection Error:', err.message)
    throw err
  }

  return cached.conn
}

// ── Global Middleware ──────────────────────────────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Ensure Database is connected before executing any route handler
app.use(async (req, res, next) => {
  try {
    await connectToDatabase()
    next()
  } catch (dbErr) {
    res.status(500).json({
      success: false,
      message: 'Failed to connect to MongoDB Atlas database',
      error: dbErr.message
    })
  }
})

// ── Unified Route Registration (Supports both /api/* and root /*) ─────────────
const apiRouter = express.Router()

apiRouter.use('/auth', authRoutes)
apiRouter.use('/employees', employeeRoutes)
apiRouter.use('/attendance', attendanceRoutes)
apiRouter.use('/holidays', holidayRoutes)
apiRouter.use('/messages', messageRoutes)
apiRouter.use('/face', faceRoutes)
apiRouter.use('/reports', reportRoutes)
apiRouter.use('/analytics', analyticsRoutes)
apiRouter.use('/leaves', leaveRoutes)
apiRouter.use('/tasks', taskRoutes)
apiRouter.use('/announcements', announcementRoutes)
apiRouter.use('/documents', documentRoutes)
apiRouter.use('/conversions', productConversionRoutes)

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'success',
    server: 'Vercel Serverless Function',
    database: 'MongoDB Atlas',
    host: mongoose.connection?.host || 'Connected',
    uptime: process.uptime()
  })
})

apiRouter.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Aparaitech HRMS API is online on Vercel Serverless!',
    database: 'MongoDB Atlas'
  })
})

// Mount on /api for regular client calls and / for direct serverless rewrites
app.use('/api', apiRouter)
app.use('/', apiRouter)

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Vercel API Error]:', err.stack)
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message
  })
})

export default app
