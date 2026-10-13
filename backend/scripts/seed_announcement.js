import mongoose from 'mongoose'
import Announcement from '../models/Announcement.js'

const uri = 'mongodb+srv://portalaparaitech_db_user:BIoRSFJc7Yc6aReK@cluster0.ndpqh89.mongodb.net/aparaitech_attendance?retryWrites=true&w=majority'

async function seedAnnouncement() {
  await mongoose.connect(uri)
  console.log('Connected to MongoDB Atlas')

  const existing = await Announcement.findOne({
    title: { $regex: 'Mandatory 2-Slot Daily Work Report', $options: 'i' }
  })

  if (existing) {
    console.log('Announcement already exists:', existing._id)
  } else {
    const created = await Announcement.create({
      title: '📢 Mandatory 2-Slot Daily Work Report Process (Today Only - 13 Oct 2026)',
      content: `Attention all BDA Employees & Interns:

For today only (13th October 2026), there is a mandatory two-stage Daily Working Report submission process:

1️⃣ Slot 1 (Pre-Lunch Report): Must be submitted before proceeding to lunch break. Enter all morning calling stats and mid-day progress.
2️⃣ Slot 2 (Final Logout Report): Must be submitted at the end of the shift before checking out. Enter final conversions and end-of-day metrics.

The portal has been updated to accept both reports for today. Checkout validation is enabled for Slot 2. Please ensure 100% compliance.`,
      category: 'Policy',
      targetTeam: 'BDA',
      priority: 'Urgent',
      postedBy: 'Management / HR Operations',
      isPinned: true
    })
    console.log('Created urgent announcement:', created._id)
  }

  await mongoose.disconnect()
  console.log('Done')
}

seedAnnouncement().catch(err => {
  console.error('Error seeding announcement:', err)
  process.exit(1)
})
