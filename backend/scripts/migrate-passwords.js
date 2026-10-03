import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '../.env') })

async function migrate() {
  console.log('Connecting to MongoDB Atlas...')
  await mongoose.connect(process.env.MONGODB_URI)
  const db = mongoose.connection.db

  const employees = await db.collection('employees').find({}).toArray()
  console.log(`Found ${employees.length} employees to update plainPassword & passcode.`)

  for (const emp of employees) {
    const isAdm = emp.role === 'admin' || emp.email === 'admin@aparaitech.com'
    const plainPwd = isAdm ? (process.env.ADMIN_PASSWORD || 'admin123') : (emp.plainPassword || 'Aparaitech123@')
    const pin = emp.passcode || '1234'

    await db.collection('employees').updateOne(
      { _id: emp._id },
      {
        $set: {
          plainPassword: plainPwd,
          passcode: pin
        }
      }
    )
    console.log(`Updated ${emp.name} (${emp.email}): plainPassword = ${plainPwd}, passcode = ${pin}`)
  }

  console.log('\nMigration successfully finished.')
  await mongoose.disconnect()
}

migrate().catch(err => {
  console.error('Migration error:', err)
  process.exit(1)
})
