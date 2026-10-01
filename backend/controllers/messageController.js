import Message from '../models/Message.js'
import Employee from '../models/Employee.js'
import { saveBase64File } from '../utils/fileSaver.js'
import { sendAdminMessageEmail } from '../services/emailService.js'

// Helper to construct absolute attachment URL
const getAbsoluteAttachmentUrl = (req, relUrl) => {
  if (!relUrl) return null
  return `${req.protocol}://${req.get('host')}${relUrl}`
}

export const sendMessageToEmployee = async (req, res) => {
  const { employeeId } = req.params
  const { subject, message, attachment } = req.body
  const adminId = req.user._id

  console.log(`[API Request] POST /api/messages/send/${employeeId} by Admin ID ${adminId}`)

  if (!subject || !message) {
    return res.status(400).json({ success: false, message: 'Subject and message are required' })
  }

  try {
    const employee = await Employee.findById(employeeId)
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' })
    }

    let attachmentUrl = null
    let attachmentPath = null

    if (attachment) {
      const relPath = saveBase64File(attachment, 'uploads')
      attachmentUrl = getAbsoluteAttachmentUrl(req, relPath)
      attachmentPath = relPath ? relPath.substring(1) : null // Remove leading slash for local filepath
    }

    // Create Message log
    const msg = new Message({
      senderAdminId: adminId,
      recipientEmployeeId: employee._id,
      isBroadcast: false,
      subject,
      message,
      attachmentUrl,
      deliveryStatus: 'pending'
    })

    await msg.save()

    // Send email immediately
    let deliveryStatus = 'delivered'
    try {
      await sendAdminMessageEmail(employee, subject, message, attachmentPath, req.user.name)
    } catch (emailErr) {
      console.error(`[API Mail Error] Failed to send email to ${employee.email}:`, emailErr.message)
      deliveryStatus = 'failed'
    }

    // Update delivery status
    msg.deliveryStatus = deliveryStatus
    await msg.save()

    console.log(`[API Success] Message saved & email ${deliveryStatus} to ${employee.email}`)

    return res.status(200).json({
      success: true,
      emailSent: deliveryStatus === 'delivered',
      message: deliveryStatus === 'delivered' ? 'Message sent successfully' : 'Message saved, but email delivery failed',
      data: msg
    })
  } catch (error) {
    console.error(`[API Error] Error sending message:`, error.stack)
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

export const sendBulkMessages = async (req, res) => {
  const { employeeIds, subject, message, attachment } = req.body
  const adminId = req.user._id

  console.log(`[API Request] POST /api/messages/send-bulk by Admin ID ${adminId}. Count: ${employeeIds?.length}`)

  if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Recipient employee IDs are required' })
  }
  if (!subject || !message) {
    return res.status(400).json({ success: false, message: 'Subject and message are required' })
  }

  try {
    const employees = await Employee.find({ _id: { $in: employeeIds } })
    if (employees.length === 0) {
      return res.status(404).json({ success: false, message: 'No valid employees found' })
    }

    let attachmentUrl = null
    let attachmentPath = null

    if (attachment) {
      const relPath = saveBase64File(attachment, 'uploads')
      attachmentUrl = getAbsoluteAttachmentUrl(req, relPath)
      attachmentPath = relPath ? relPath.substring(1) : null
    }

    let sentCount = 0
    let failedCount = 0

    // Send emails and log records asynchronously
    const sendPromises = employees.map(async (employee) => {
      const msg = new Message({
        senderAdminId: adminId,
        recipientEmployeeId: employee._id,
        isBroadcast: false,
        subject,
        message,
        attachmentUrl,
        deliveryStatus: 'pending'
      })
      await msg.save()

      let deliveryStatus = 'delivered'
      try {
        await sendAdminMessageEmail(employee, subject, message, attachmentPath, req.user.name)
        sentCount++
      } catch (err) {
        console.error(`[API Mail Error] Bulk email failed for ${employee.email}:`, err.message)
        failedCount++
        deliveryStatus = 'failed'
      }

      msg.deliveryStatus = deliveryStatus
      await msg.save()
    })

    await Promise.all(sendPromises)

    console.log(`[API Success] Bulk messages sent. Success: ${sentCount}, Failed: ${failedCount}`)

    return res.status(200).json({
      success: true,
      emailSent: failedCount === 0,
      message: `Messages processed. Delivered: ${sentCount}, Failed: ${failedCount}`,
      sentCount,
      failedCount
    })
  } catch (error) {
    console.error(`[API Error] Error in bulk send:`, error.stack)
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}


export const broadcastMessage = async (req, res) => {
  const { subject, message, attachment } = req.body
  const adminId = req.user._id

  console.log(`[API Request] POST /api/messages/broadcast by Admin ID ${adminId}`)

  if (!subject || !message) {
    return res.status(400).json({ success: false, message: 'Subject and message are required' })
  }

  try {
    const activeEmployees = await Employee.find({ role: 'employee', status: 'active' })
    if (activeEmployees.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No active employees found to send messages to.',
        sentCount: 0,
        failedCount: 0
      })
    }

    let attachmentUrl = null
    let attachmentPath = null

    if (attachment) {
      const relPath = saveBase64File(attachment, 'uploads')
      attachmentUrl = getAbsoluteAttachmentUrl(req, relPath)
      attachmentPath = relPath ? relPath.substring(1) : null
    }

    // Save one broadcast message record in DB
    const msg = new Message({
      senderAdminId: adminId,
      recipientEmployeeId: null,
      isBroadcast: true,
      subject,
      message,
      attachmentUrl,
      deliveryStatus: 'pending'
    })

    await msg.save()

    // Send emails asynchronously
    let sentCount = 0
    let failedCount = 0

    // Map mail promises to avoid blocking the main event loop
    const mailPromises = activeEmployees.map(async (employee) => {
      try {
        await sendAdminMessageEmail(employee, subject, message, attachmentPath, req.user.name)
        sentCount++
      } catch (err) {
        console.error(`[API Mail Error] Broadcast email failed for ${employee.email}:`, err.message)
        failedCount++
      }
    })

    // Wait for all emails to attempt delivery
    await Promise.all(mailPromises)

    // Update status
    msg.deliveryStatus = failedCount === 0 ? 'delivered' : (sentCount > 0 ? 'delivered' : 'failed')
    await msg.save()

    console.log(`[API Success] Broadcast completed. Sent: ${sentCount}, Failed: ${failedCount}`)

    return res.status(200).json({
      success: true,
      message: 'Broadcast completed successfully',
      sentCount,
      failedCount,
      totalEmployees: activeEmployees.length,
      data: msg
    })
  } catch (error) {
    console.error(`[API Error] Error during broadcast:`, error.stack)
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

export const getAdminMessageHistory = async (req, res) => {
  const { search, type, page = 1, limit = 10 } = req.query
  const adminId = req.user._id

  console.log(`[API Request] GET /api/messages/admin/history. Query:`, req.query)

  try {
    let query = { senderAdminId: adminId }

    if (type === 'individual') {
      query.isBroadcast = false
    } else if (type === 'broadcast') {
      query.isBroadcast = true
    }

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const total = await Message.countDocuments(query)
    const records = await Message.find(query)
      .populate('recipientEmployeeId', 'name empId email department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    return res.status(200).json({
      success: true,
      data: records,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error(`[API Error] Error loading history:`, error.stack)
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

export const getEmployeeMessages = async (req, res) => {
  const employeeId = req.user._id

  console.log(`[API Request] GET /api/messages/employee for Employee ID ${employeeId}`)

  try {
    // Find all messages that are broadcast OR directed to this specific employee
    const records = await Message.find({
      $or: [
        { isBroadcast: true },
        { recipientEmployeeId: employeeId }
      ]
    })
      .populate('senderAdminId', 'name email')
      .sort({ createdAt: -1 })

    // Map records to check if read
    const formattedRecords = records.map(rec => {
      const isRead = rec.readBy.includes(employeeId)
      return {
        _id: rec._id,
        sender: rec.senderAdminId ? rec.senderAdminId.name : 'Administrator',
        subject: rec.subject,
        message: rec.message,
        attachmentUrl: rec.attachmentUrl,
        isBroadcast: rec.isBroadcast,
        isRead,
        createdAt: rec.createdAt
      }
    })

    const unreadCount = formattedRecords.filter(r => !r.isRead).length

    return res.status(200).json({
      success: true,
      data: formattedRecords,
      unreadCount
    })
  } catch (error) {
    console.error(`[API Error] Error loading employee messages:`, error.stack)
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

export const markMessageAsRead = async (req, res) => {
  const { id } = req.params
  const employeeId = req.user._id

  console.log(`[API Request] PUT /api/messages/${id}/read by Employee ID ${employeeId}`)

  try {
    const msg = await Message.findById(id)
    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found' })
    }

    // Add employee to readBy if not already read
    if (!msg.readBy.includes(employeeId)) {
      msg.readBy.push(employeeId)
      await msg.save()
    }

    return res.status(200).json({
      success: true,
      message: 'Message marked as read successfully'
    })
  } catch (error) {
    console.error(`[API Error] Error marking message read:`, error.stack)
    return res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}
