import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

async function inspect() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  const projects = await mongoose.connection.db.collection('projects').find({}).toArray()
  console.log(`\n=== PROJECTS IN DB (${projects.length}) ===`)
  projects.forEach((p, idx) => {
    console.log(`[${idx+1}] ID: ${p._id} | Code: ${p.code} | Title: "${p.title}" | CreatedAt: ${p.createdAt} | Repo: ${p.repositoryUrl}`)
  })

  const tasks = await mongoose.connection.db.collection('tasks').find({}).toArray()
  console.log(`\n=== TASKS IN DB (${tasks.length}) ===`)
  tasks.forEach((t, idx) => {
    console.log(`[${idx+1}] ID: ${t._id} | Title: "${t.title}" | ProjectId: ${t.projectId} | CreatedAt: ${t.createdAt}`)
  })

  const collections = await mongoose.connection.db.listCollections().toArray()
  console.log('\nAll collections:', collections.map(c => c.name))

  await mongoose.disconnect()
}

inspect().catch(console.error)
