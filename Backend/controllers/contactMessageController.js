import ContactMessage from '../models/contactMessageModel.js'
import { sendContactConfirmation, sendAdminNotification } from '../services/emailService.js'

// Create new contact message
export const createContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      })
    }

    // Validate subject
    const validSubjects = ['general', 'reservation', 'feedback', 'complaint', 'partnership', 'other']
    if (!validSubjects.includes(subject)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid subject'
      })
    }

    // Validate message length
    if (message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters long'
      })
    }

    // Create new contact message
    const contactMessage = new ContactMessage({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject,
      message: message.trim(),
      priority: subject === 'complaint' ? 'high' : 'medium'
    })

    await contactMessage.save()

    // Send confirmation email to customer
    try {
      await sendContactConfirmation(contactMessage)
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError)
      // Don't fail the request if email fails
    }

    // Send notification to admin
    try {
      await sendAdminNotification(contactMessage)
    } catch (emailError) {
      console.error('Error sending admin notification:', emailError)
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.',
      data: {
        id: contactMessage._id,
        name: contactMessage.name,
        subject: contactMessage.subject,
        createdAt: contactMessage.createdAt
      }
    })

  } catch (error) {
    console.error('Error creating contact message:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    })
  }
}

// Get all contact messages (Admin only)
export const getAllContactMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, subject, search } = req.query

    // Build filter
    const filter = {}
    if (status && status !== 'all') filter.status = status
    if (subject && subject !== 'all') filter.subject = subject
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ]
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    // Get messages with pagination
    const messages = await ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v')

    // Get total count
    const total = await ContactMessage.countDocuments(filter)

    // Get statistics
    const stats = await ContactMessage.getStats()

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalMessages: total,
          hasNext: skip + messages.length < total,
          hasPrev: parseInt(page) > 1
        },
        stats
      }
    })

  } catch (error) {
    console.error('Error fetching contact messages:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages'
    })
  }
}

// Get single contact message (Admin only)
export const getContactMessage = async (req, res) => {
  try {
    const { id } = req.params

    const message = await ContactMessage.findById(id)
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      })
    }

    // Mark as read if status is unread
    if (message.status === 'unread') {
      message.status = 'read'
      await message.save()
    }

    res.json({
      success: true,
      data: message
    })

  } catch (error) {
    console.error('Error fetching contact message:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact message'
    })
  }
}

// Update contact message status (Admin only)
export const updateContactMessageStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, priority, tags } = req.body

    const message = await ContactMessage.findById(id)
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      })
    }

    // Update fields
    if (status) message.status = status
    if (priority) message.priority = priority
    if (tags) message.tags = tags

    await message.save()

    res.json({
      success: true,
      message: 'Contact message updated successfully',
      data: message
    })

  } catch (error) {
    console.error('Error updating contact message:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update contact message'
    })
  }
}

// Add admin response (Admin only)
export const addAdminResponse = async (req, res) => {
  try {
    const { id } = req.params
    const { response } = req.body

    if (!response || response.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Response must be at least 5 characters long'
      })
    }

    const message = await ContactMessage.findById(id)
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      })
    }

    // Add admin response
    await message.addAdminResponse(response.trim(), req.body.adminName || 'Admin')

    // Send response email to customer
    try {
      await sendContactConfirmation(message, response.trim())
    } catch (emailError) {
      console.error('Error sending response email:', emailError)
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Response added successfully',
      data: message
    })

  } catch (error) {
    console.error('Error adding admin response:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to add admin response'
    })
  }
}

// Delete contact message (Admin only)
export const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params

    const message = await ContactMessage.findByIdAndDelete(id)
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      })
    }

    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting contact message:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact message'
    })
  }
}

// Get contact message statistics (Admin only)
export const getContactMessageStats = async (req, res) => {
  try {
    const stats = await ContactMessage.getStats()
    
    // Get counts by subject
    const subjectStats = await ContactMessage.aggregate([
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 }
        }
      }
    ])

    // Get counts by priority
    const priorityStats = await ContactMessage.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ])

    // Get recent activity
    const recentMessages = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name subject status createdAt')

    res.json({
      success: true,
      data: {
        statusStats: stats,
        subjectStats,
        priorityStats,
        recentMessages
      }
    })

  } catch (error) {
    console.error('Error fetching contact message stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    })
  }
}
