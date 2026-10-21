import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

async function inspect() {
  await mongoose.connect(process.env.MONGODB_URI)
  const emps = await mongoose.connection.db.collection('employees').find({
    department: { $ne: 'BDA' }
  }).toArray()

  console.log(`Found ${emps.length} non-BDA employees:`)
  emps.forEach(e => {
    console.log(` - [${e.empId}] ${e.name} | Email: ${e.email} | Dept: "${e.department}" | Desig: "${e.designation}" | Role: "${e.role}"`)
  })

  await mongoose.disconnect()
}

inspect().catch(console.error)
