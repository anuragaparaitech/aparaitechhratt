import Announcement from '../models/Announcement.js'

// @desc    Get announcements for employee or all
// @route   GET /api/announcements
// @access  Private
export const getAnnouncements = async (req, res) => {
  try {
    const userDept = req.user.department || 'BDA'
    const query = {
      $or: [
        { targetTeam: 'All' },
        { targetTeam: userDept }
      ]
    }
    const announcements = await Announcement.find(query).sort({ isPinned: -1, createdAt: -1 })
    res.json({ success: true, data: announcements })
  } catch (error) {
    console.error('getAnnouncements error:', error)
    res.status(500).json({ success: false, message: 'Server error fetching announcements', error: error.message })
  }
}

// @desc    Create announcement (Manager/Admin)
// @route   POST /api/announcements
// @access  Private (Manager/Admin)
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, category, targetTeam, priority, isPinned } = req.body

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' })
    }

    const announcement = new Announcement({
      title,
      content,
      category: category || 'Company',
      targetTeam: targetTeam || 'All',
      priority: priority || 'Normal',
      postedBy: req.user.name,
      isPinned: Boolean(isPinned)
    })

    await announcement.save()
    res.status(201).json({ success: true, message: 'Announcement published successfully', data: announcement })
  } catch (error) {
    console.error('createAnnouncement error:', error)
    res.status(500).json({ success: false, message: 'Server error creating announcement', error: error.message })
  }
}

// @desc    Delete announcement (Admin)
// @route   DELETE /api/announcements/:id
// @access  Private (Admin)
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' })
    }
    await announcement.deleteOne()
    res.json({ success: true, message: 'Announcement deleted' })
  } catch (error) {
    console.error('deleteAnnouncement error:', error)
    res.status(500).json({ success: false, message: 'Server error deleting announcement', error: error.message })
  }
}
