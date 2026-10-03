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
import leadRoutes from './_backend/routes/leadRoutes.js'
import projectRoutes from './_backend/routes/projectRoutes.js'
import repoRoutes from './_backend/routes/repoRoutes.js'
import { seedDatabase } from './_backend/controllers/employeeController.js'

dotenv.config()

const app = express()

// ── Fallback Credentials for 100% Reliable Atlas Connection ──
const MONGODB_ATLAS_URI = process.env.MONGODB_URI || 'mongodb+srv://portalaparaitech_db_user:BIoRSFJc7Yc6aReK@cluster0.ndpqh89.mongodb.net/aparaitech_attendance?retryWrites=true&w=majority'

// Global Mongoose Connection Cache for Serverless Execution
let cached = global.mongooseInstance
if (!cached) {
  cached = global.mongooseInstance = { conn: null, promise: null }
}

async function connectToDatabase() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_ATLAS_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000
    }).then((m) => {
      console.log(`📡 MongoDB Atlas Connected to: ${m.connection.host}/${m.connection.name}`)
      return m
    }).catch(err => {
      cached.promise = null
      console.error('❌ MongoDB Atlas Connection Error:', err.message)
      throw err
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    cached.promise = null
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

// ── Diagnostic / Health Routes (Instant response without DB block) ────────────
const apiRouter = express.Router()

apiRouter.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState
  const stateNames = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' }
  res.json({
    status: 'success',
    server: 'Vercel Serverless Function',
    database: 'Enterprise Cloud Database',
    databaseState: stateNames[dbState] || dbState,
    host: 'cloud',
    uptime: process.uptime()
  })
})

apiRouter.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Aparaitech HRMS API is online on Vercel Serverless!',
    database: 'Enterprise Cloud Database'
  })
})

// Database Connection Middleware for all operational routes
const requireDatabase = async (req, res, next) => {
  try {
    await connectToDatabase()
    next()
  } catch (dbErr) {
    res.status(500).json({
      success: false,
      message: 'Failed to connect to cloud database. Please verify network access.',
      error: dbErr.message
    })
  }
}

apiRouter.use('/auth', requireDatabase, authRoutes)
apiRouter.use('/employees', requireDatabase, employeeRoutes)
apiRouter.use('/attendance', requireDatabase, attendanceRoutes)
apiRouter.use('/holidays', requireDatabase, holidayRoutes)
apiRouter.use('/messages', requireDatabase, messageRoutes)
apiRouter.use('/face', requireDatabase, faceRoutes)
apiRouter.use('/reports', requireDatabase, reportRoutes)
apiRouter.use('/analytics', requireDatabase, analyticsRoutes)
apiRouter.use('/leaves', requireDatabase, leaveRoutes)
apiRouter.use('/tasks', requireDatabase, taskRoutes)
apiRouter.use('/announcements', requireDatabase, announcementRoutes)
apiRouter.use('/documents', requireDatabase, documentRoutes)
apiRouter.use('/conversions', requireDatabase, productConversionRoutes)
apiRouter.use('/product-conversions', requireDatabase, productConversionRoutes)
apiRouter.use('/product_conversions', requireDatabase, productConversionRoutes)
apiRouter.use('/leads', requireDatabase, leadRoutes)
apiRouter.use('/projects', requireDatabase, projectRoutes)
apiRouter.use('/repos', requireDatabase, repoRoutes)

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
