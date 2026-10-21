import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

async function check() {
  await mongoose.connect(process.env.MONGODB_URI)

  const collections = await mongoose.connection.db.listCollections().toArray()
  for (const col of collections) {
    const count = await mongoose.connection.db.collection(col.name).countDocuments({
      $or: [
        { employeeEmail: /anurag.*aparaitech/i },
        { email: /anurag.*aparaitech/i },
        { repositoryUrl: /anurag.*aparaitech/i }
      ]
    })
    if (count > 0) {
      console.log(`Collection "${col.name}" has ${count} matching records`)
      const items = await mongoose.connection.db.collection(col.name).find({
        $or: [
          { employeeEmail: /anurag.*aparaitech/i },
          { email: /anurag.*aparaitech/i },
          { repositoryUrl: /anurag.*aparaitech/i }
        ]
      }).toArray()
      items.forEach(it => {
        console.log(` - ID: ${it._id} | Title/Name: ${it.title || it.name || it.employeeName} | Repo: ${it.repositoryUrl || ''}`)
      })
    }
  }

  await mongoose.disconnect()
}

check().catch(console.error)
