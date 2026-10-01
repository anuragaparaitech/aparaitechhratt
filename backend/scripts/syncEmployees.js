import dotenv from 'dotenv'
import connectDB from '../config/db.js'
import { seedDatabase } from '../controllers/employeeController.js'
import mongoose from 'mongoose'

dotenv.config()

async function runSync() {
  try {
    console.log('🔄 Connecting to database for employee synchronization...')
    await connectDB()
    console.log('🔄 Running employee synchronization...')
    await seedDatabase()
    console.log('✨ All employee statuses and records successfully synchronized!')
    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('❌ Sync failed:', error.message)
    process.exit(1)
  }
}

runSync()
