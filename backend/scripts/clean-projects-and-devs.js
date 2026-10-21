import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

async function cleanup() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB Atlas')

  // 1. Delete old projects created before Oct 21 OR with anuragaparaitech repo
  const projectsToDelete = await mongoose.connection.db.collection('projects').find({
    $or: [
      { repositoryUrl: /anurag.*aparaitech/i },
      { code: { $in: ['PRJ-HRMS', 'PRJ-LMS', 'PRJ-AI-CRM', 'AP-WP-939', 'PRJTEST'] } },
      { createdAt: { $lt: new Date('2026-10-21T00:00:00.000Z') } }
    ]
  }).toArray()

  console.log(`Found ${projectsToDelete.length} projects to delete:`)
  projectsToDelete.forEach(p => {
    console.log(` - Deleting Project: [${p.code}] "${p.title}" | Repo: ${p.repositoryUrl}`)
  })

  if (projectsToDelete.length > 0) {
    const deleteRes = await mongoose.connection.db.collection('projects').deleteMany({
      _id: { $in: projectsToDelete.map(p => p._id) }
    })
    console.log(`Deleted ${deleteRes.deletedCount} old projects`)
  }

  // 2. Delete test daily report by anurag.aparaitech@gmail.com
  const delReportRes = await mongoose.connection.db.collection('dailyreports').deleteMany({
    employeeEmail: 'anurag.aparaitech@gmail.com'
  })
  console.log(`Deleted ${delReportRes.deletedCount} dummy reports for anurag.aparaitech@gmail.com`)

  // 3. Ensure remaining projects are clean
  const remainingProjects = await mongoose.connection.db.collection('projects').find({}).toArray()
  console.log(`\nRemaining Active Projects (${remainingProjects.length}):`)
  remainingProjects.forEach(p => {
    console.log(` - [${p.code}] "${p.title}" | Repo: ${p.repositoryUrl}`)
  })

  // 4. Update software developer employee roles & designations in MongoDB
  const devUpdates = [
    { email: 'pratikumeshpawar@gmail.com', role: 'developer', designation: 'Software Developer', department: 'Software Development' },
    { email: 'dishamarne1@gmail.com', role: 'developer', designation: 'Software Development Intern', department: 'Software Development' },
    { email: 'bhumikajadhav007@gmail.com', role: 'developer', designation: 'Software Developer', department: 'Software Development' },
    { email: 'adityapol588@gmail.com', role: 'developer', designation: 'Software Developer', department: 'Software Development' },
    { email: 'vedantk.aparaitech@gmail.com', role: 'developer', designation: 'Software Developer', department: 'Software Development' },
    { email: 'pavan.nerkar.aparaitech@gmail.com', role: 'developer', designation: 'Software Developer', department: 'Software Development' },
    { email: 'rutikyadav2004@gmail.com', role: 'developer', designation: 'Full Stack Developer', department: 'Software Development' },
    { email: 'pavanmali0281@gmail.com', role: 'developer', designation: 'Frontend Engineer', department: 'Software Development' },
    { email: 'letsmailvivek100@gmail.com', role: 'developer', designation: 'Backend Developer', department: 'Software Development' },
    { email: 'kadammahesh803@gmail.com', role: 'developer', designation: 'QA & DevOps Engineer', department: 'Software Development' }
  ]

  for (const u of devUpdates) {
    const res = await mongoose.connection.db.collection('employees').updateOne(
      { email: u.email.toLowerCase() },
      { $set: { role: u.role, designation: u.designation, department: u.department } }
    )
    if (res.matchedCount > 0) {
      console.log(`Updated employee ${u.email}: role=${u.role}, designation=${u.designation}`)
    }
  }

  await mongoose.disconnect()
  console.log('\nCleanup & developer update completed successfully!')
}

cleanup().catch(console.error)
