import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

async function check() {
  await mongoose.connect(process.env.MONGODB_URI)

  const convCount = await mongoose.connection.db.collection('productconversions').countDocuments()
  console.log('Total conversions:', convCount)
  if (convCount > 0) {
    const sampleConv = await mongoose.connection.db.collection('productconversions').find({}).limit(3).toArray()
    console.log('Sample conversion:', JSON.stringify(sampleConv, null, 2))
  }

  const attCount = await mongoose.connection.db.collection('attendances').countDocuments()
  console.log('Total attendance records:', attCount)
  if (attCount > 0) {
    const sampleAtt = await mongoose.connection.db.collection('attendances').find({}).limit(2).toArray()
    console.log('Sample attendance:', JSON.stringify(sampleAtt, null, 2))
  }

  const leadCount = await mongoose.connection.db.collection('leads').countDocuments()
  console.log('Total leads:', leadCount)

  await mongoose.disconnect()
}

check().catch(console.error)
