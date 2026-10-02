import mongoose from 'mongoose'

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Company', 'Team', 'Holiday', 'Policy', 'Event'],
    default: 'Company'
  },
  targetTeam: {
    type: String,
    default: 'All'
  },
  priority: {
    type: String,
    enum: ['Normal', 'Important', 'Urgent'],
    default: 'Normal'
  },
  postedBy: {
    type: String,
    required: true
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

const Announcement = mongoose.model('Announcement', announcementSchema)
export default Announcement
