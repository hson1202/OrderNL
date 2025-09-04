import reservationModel from "../models/reservationModel.js"
import { sendReservationConfirmation, sendStatusUpdateEmail } from "../services/emailService.js"

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Helper function to validate phone number
const isValidPhone = (phone) => {
  // Remove all non-digit characters and check if we have at least 10 digits
  const digitsOnly = phone.replace(/\D/g, '')
  return digitsOnly.length >= 10
}

// Helper function to check if date is in the past
const isDateInPast = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const reservationDate = new Date(date)
  reservationDate.setHours(0, 0, 0, 0)
  return reservationDate < today
}

// Helper function to check business hours
const isWithinBusinessHours = (date, time) => {
  const reservationDate = new Date(date)
  const dayOfWeek = reservationDate.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const timeHour = parseInt(time.split(':')[0])
  
  if (dayOfWeek === 0) { // Sunday
    return timeHour >= 11 && timeHour < 17
  } else { // Monday to Saturday
    return timeHour >= 11 && timeHour < 20
  }
}

// Helper function to generate available time slots based on day
const generateAvailableTimeSlots = (date) => {
  const reservationDate = new Date(date)
  const dayOfWeek = reservationDate.getDay()
  const slots = []
  
  if (dayOfWeek === 0) { // Sunday: 11:00 - 17:00
    for (let hour = 11; hour < 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      if (hour < 16) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`)
      }
    }
  } else { // Monday to Saturday: 11:00 - 20:00
    for (let hour = 11; hour < 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      if (hour < 19) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`)
      }
    }
  }
  
  return slots
}

// Create new reservation
export const createReservation = async (req, res) => {
    try {
        console.log('📝 Creating reservation with data:', req.body)
        const { customerName, phone, email, reservationDate, reservationTime, numberOfPeople, note } = req.body

        // Validate required fields
        if (!customerName || !phone || !email || !reservationDate || !reservationTime || !numberOfPeople) {
            return res.status(400).json({ 
                success: false, 
                message: "All required fields must be provided" 
            })
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide a valid email address" 
            })
        }

        // Validate phone format
        console.log('📞 Validating phone:', phone)
        if (!isValidPhone(phone)) {
            console.log('❌ Phone validation failed for:', phone)
            return res.status(400).json({ 
                success: false, 
                message: "Please provide a valid phone number" 
            })
        }
        console.log('✅ Phone validation passed')

        // Validate customer name (at least 2 characters)
        if (customerName.trim().length < 2) {
            return res.status(400).json({ 
                success: false, 
                message: "Customer name must be at least 2 characters long" 
            })
        }

        // Validate date (must not be in the past)
        if (isDateInPast(reservationDate)) {
            return res.status(400).json({ 
                success: false, 
                message: "Reservation date cannot be in the past. Please select today or a future date." 
            })
        }

        // Validate business hours
        if (!isWithinBusinessHours(reservationDate, reservationTime)) {
            const dayOfWeek = new Date(reservationDate).getDay()
            if (dayOfWeek === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Sunday reservations are only available from 11:00 AM to 5:00 PM" 
                })
            } else {
                return res.status(400).json({ 
                    success: false, 
                    message: "Monday to Saturday reservations are only available from 11:00 AM to 8:00 PM" 
                })
            }
        }

        // Validate number of people
        if (numberOfPeople < 1 || numberOfPeople > 20) {
            return res.status(400).json({ 
                success: false, 
                message: "Number of people must be between 1 and 20" 
            })
        }

        // Check if there's already a reservation for the same time slot
        const reservationDateTime = new Date(reservationDate)
        const existingReservation = await reservationModel.findOne({
            reservationDate: reservationDateTime,
            reservationTime: reservationTime,
            status: { $in: ['pending', 'confirmed'] }
        })

        if (existingReservation) {
            return res.status(400).json({ 
                success: false, 
                message: "This time slot is already booked. Please choose a different time." 
            })
        }

        const newReservation = new reservationModel({
            customerName: customerName.trim(),
            phone: phone.trim(),
            email: email.toLowerCase().trim(),
            reservationDate: reservationDateTime,
            reservationTime,
            numberOfPeople,
            note: note ? note.trim() : ''
        })

        console.log('💾 Saving reservation to database...')
        await newReservation.save()
        console.log('✅ Reservation saved successfully with ID:', newReservation._id)

        // Send confirmation email
        try {
            const emailResult = await sendReservationConfirmation(newReservation)
            if (emailResult && emailResult.success) {
                console.log('✅ Confirmation email sent successfully')
            } else {
                console.log('⚠️ Email not sent:', emailResult?.message || 'Unknown error')
            }
        } catch (emailError) {
            console.error('❌ Error sending confirmation email:', emailError)
            // Don't fail the reservation if email fails
        }

        const response = {
            success: true,
            message: "Reservation created successfully! We will confirm your booking within 2 hours. Please check your email for confirmation details.",
            data: newReservation
        }
        console.log('✅ Sending success response:', response)
        res.status(201).json(response)
    } catch (error) {
        console.error("❌ Error creating reservation:", error)
        console.error("❌ Error stack:", error.stack)
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            console.log('⚠️ Duplicate key error detected')
            return res.status(400).json({
                success: false,
                message: "A reservation with this information already exists"
            })
        }
        
        const errorResponse = {
            success: false,
            message: "Internal server error. Please try again later.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
        console.log('❌ Sending error response:', errorResponse)
        res.status(500).json(errorResponse)
    }
}

// Get all reservations (admin only)
export const getAllReservations = async (req, res) => {
    try {
        const reservations = await reservationModel.find().sort({ createdAt: -1 })
        
        res.status(200).json({
            success: true,
            data: reservations
        })
    } catch (error) {
        console.error("Error fetching reservations:", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

// Get reservation by ID
export const getReservationById = async (req, res) => {
    try {
        const { id } = req.params
        const reservation = await reservationModel.findById(id)
        
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: "Reservation not found"
            })
        }

        res.status(200).json({
            success: true,
            data: reservation
        })
    } catch (error) {
        console.error("Error fetching reservation:", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

// Update reservation status (admin only)
export const updateReservationStatus = async (req, res) => {
    try {
        console.log('Update reservation status request:', { 
            id: req.params.id, 
            body: req.body, 
            userId: req.body.userId,
            isAdmin: req.body.isAdmin 
        })
        
        const { id } = req.params
        const { status, adminNote } = req.body

        if (!status) {
            console.log('Status is missing')
            return res.status(400).json({
                success: false,
                message: "Status is required"
            })
        }

        const validStatuses = ['pending', 'completed', 'cancelled']
        console.log('Validating status:', status, 'against valid statuses:', validStatuses)
        if (!validStatuses.includes(status)) {
            console.log('Invalid status:', status)
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            })
        }

        // Get current reservation to check old status
        const currentReservation = await reservationModel.findById(id)
        if (!currentReservation) {
            return res.status(404).json({
                success: false,
                message: "Reservation not found"
            })
        }

        const oldStatus = currentReservation.status

        const updateData = { status }
        if (adminNote) updateData.adminNote = adminNote
        
        // If completing, add completion details
        if (status === 'completed') {
            updateData.completedBy = req.body.userId || 'Admin'
            updateData.completedAt = new Date()
        }
        
        // If going back to pending, clear completion details
        if (status === 'pending') {
            updateData.completedBy = null
            updateData.completedAt = null
        }

        console.log('Update data:', updateData)

        const updatedReservation = await reservationModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        )

        if (!updatedReservation) {
            return res.status(404).json({
                success: false,
                message: "Reservation not found"
            })
        }

        // Send status update email if status changed
        if (oldStatus !== status) {
            try {
                await sendStatusUpdateEmail(updatedReservation, oldStatus, status)
                console.log('Status update email sent successfully')
            } catch (emailError) {
                console.error('Error sending status update email:', emailError)
                // Don't fail the update if email fails
            }
        }

        res.status(200).json({
            success: true,
            message: "Reservation status updated successfully",
            data: updatedReservation
        })
    } catch (error) {
        console.error("Error updating reservation:", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

// Delete reservation (admin only)
export const deleteReservation = async (req, res) => {
    try {
        const { id } = req.params
        const deletedReservation = await reservationModel.findByIdAndDelete(id)

        if (!deletedReservation) {
            return res.status(404).json({
                success: false,
                message: "Reservation not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Reservation deleted successfully"
        })
    } catch (error) {
        console.error("Error deleting reservation:", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

// Get reservations by date range (admin only)
export const getReservationsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Start date and end date are required"
            })
        }

        const start = new Date(startDate)
        const end = new Date(endDate)

        const reservations = await reservationModel.find({
            reservationDate: {
                $gte: start,
                $lte: end
            }
        }).sort({ reservationDate: 1, reservationTime: 1 })

        res.status(200).json({
            success: true,
            data: reservations
        })
    } catch (error) {
        console.error("Error fetching reservations by date range:", error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

// Get available time slots for a specific date
export const getAvailableTimeSlots = async (req, res) => {
    try {
        const { date } = req.params
        
        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Date parameter is required"
            })
        }

        // Check if date is in the past
        if (isDateInPast(date)) {
            return res.status(400).json({
                success: false,
                message: "Cannot get time slots for past dates"
            })
        }

        const availableSlots = generateAvailableTimeSlots(date)
        
        res.status(200).json({
            success: true,
            data: {
                date,
                availableSlots,
                businessHours: new Date(date).getDay() === 0 
                    ? "Sunday: 11:00 AM - 5:00 PM"
                    : "Monday to Saturday: 11:00 AM - 8:00 PM"
            }
        })
    } catch (error) {
        console.error("Error getting available time slots:", error)
        res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
    }
}
