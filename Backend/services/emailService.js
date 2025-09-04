import nodemailer from 'nodemailer'

// Create transporter (you'll need to configure this with your email provider)
export const createTransporter = () => {
  // TEMPORARILY DISABLED - Email service is turned off
  console.log('📧 Email service is temporarily disabled');
  return null;
  
  // Uncomment this when you want to enable email service
  /*
  // Check if email configuration is available
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('⚠️ Email configuration not found. Emails will not be sent.');
    return null;
  }
  
  try {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail', // 'gmail', 'outlook', 'yahoo', etc.
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD
      }
    })
  } catch (error) {
    console.error('❌ Error creating email transporter:', error.message);
    return null;
  }
  */
}

// Send reservation confirmation email
export const sendReservationConfirmation = async (reservation) => {
  try {
    const transporter = createTransporter()
    
    // If no transporter available, return success but log warning
    if (!transporter) {
      console.log('⚠️ Email not sent: Email service not configured');
      return { 
        success: true, 
        messageId: 'email_not_configured',
        message: 'Reservation saved but email not sent (email service not configured)'
      }
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: reservation.email,
      subject: 'Reservation Confirmation - VIET BOWLS',
      html: generateConfirmationEmailHTML(reservation),
      text: generateConfirmationEmailText(reservation)
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Confirmation email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error)
    return { success: false, error: error.message }
  }
}

// Send reservation status update email
export const sendStatusUpdateEmail = async (reservation, oldStatus, newStatus) => {
  try {
    const transporter = createTransporter()
    
    // If no transporter available, return success but log warning
    if (!transporter) {
      console.log('⚠️ Email not sent: Email service not configured');
      return { 
        success: true, 
        messageId: 'email_not_configured',
        message: 'Status updated but email not sent (email service not configured)'
      }
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: reservation.email,
      subject: `Reservation Status Updated - VIET BOWLS`,
      html: generateStatusUpdateEmailHTML(reservation, oldStatus, newStatus),
      text: generateStatusUpdateEmailText(reservation, oldStatus, newStatus)
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Status update email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('❌ Error sending status update email:', error)
    return { success: false, error: error.message }
  }
}

// Send contact message confirmation email
export const sendContactConfirmation = async (contactMessage, adminResponse = null) => {
  try {
    const transporter = createTransporter()
    
    // If no transporter available, return success but log warning
    if (!transporter) {
      console.log('⚠️ Email not sent: Email service not configured');
      return { 
        success: true, 
        messageId: 'email_not_configured',
        message: 'Contact message saved but email not sent (email service not configured)'
      }
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: contactMessage.email,
      subject: adminResponse ? 'Response to Your Message - VIET BOWLS' : 'Message Received - VIET BOWLS',
      html: generateContactConfirmationEmailHTML(contactMessage, adminResponse),
      text: generateContactConfirmationEmailText(contactMessage, adminResponse)
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Contact confirmation email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('❌ Error sending contact confirmation email:', error)
    return { success: false, error: error.message }
  }
}

// Send admin notification for new contact message
export const sendAdminNotification = async (contactMessage) => {
  try {
    const transporter = createTransporter()
    
    // If no transporter available, return success but log warning
    if (!transporter) {
      console.log('⚠️ Email not sent: Email service not configured');
      return { 
        success: true, 
        messageId: 'email_not_configured',
        message: 'Admin notification not sent (email service not configured)'
      }
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New Contact Message - ${contactMessage.subject.toUpperCase()} - VIET BOWLS`,
      html: generateAdminNotificationEmailHTML(contactMessage),
      text: generateAdminNotificationEmailText(contactMessage)
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Admin notification email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('❌ Error sending admin notification email:', error)
    return { success: false, error: error.message }
  }
}

// Generate HTML email content for confirmation
const generateConfirmationEmailHTML = (reservation) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const formatTime = (time) => {
    return time
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reservation Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .reservation-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #e74c3c; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .contact-info { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍜 VIET BOWLS</h1>
          <h2>Reservation Confirmation</h2>
        </div>
        
        <div class="content">
          <p>Dear <strong>${reservation.customerName}</strong>,</p>
          
          <p>Thank you for choosing VIET BOWLS! Your reservation has been received and is currently being reviewed.</p>
          
          <div class="reservation-details">
            <h3>📅 Reservation Details</h3>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${formatDate(reservation.reservationDate)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${formatTime(reservation.reservationTime)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Number of Guests:</span>
              <span class="value">${reservation.numberOfPeople} ${reservation.numberOfPeople === 1 ? 'person' : 'people'}</span>
            </div>
            ${reservation.note ? `
            <div class="detail-row">
              <span class="label">Special Requests:</span>
              <span class="value">${reservation.note}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="contact-info">
            <h4>📍 Restaurant Information</h4>
            <p><strong>Address:</strong> 123 Main Street, City, State 12345</p>
            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            <p><strong>Email:</strong> info@vietbowls.com</p>
          </div>
          
          <p><strong>Important Notes:</strong></p>
          <ul>
            <li>Please arrive 5-10 minutes before your reservation time</li>
            <li>We will confirm your booking within 2 hours</li>
            <li>For any changes, please contact us at least 24 hours in advance</li>
            <li>Dress code: Smart casual</li>
          </ul>
          
          <p>We look forward to serving you!</p>
          
          <p>Best regards,<br>
          <strong>The VIET BOWLS Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
          <p>© 2024 VIET BOWLS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate plain text email content for confirmation
const generateConfirmationEmailText = (reservation) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  return `
VIET BOWLS - Reservation Confirmation

Dear ${reservation.customerName},

Thank you for choosing VIET BOWLS! Your reservation has been received and is currently being reviewed.

RESERVATION DETAILS:
Date: ${formatDate(reservation.reservationDate)}
Time: ${reservation.reservationTime}
Number of Guests: ${reservation.numberOfPeople} ${reservation.numberOfPeople === 1 ? 'person' : 'people'}
${reservation.note ? `Special Requests: ${reservation.note}` : ''}

RESTAURANT INFORMATION:
Address: 123 Main Street, City, State 12345
Phone: +1 (555) 123-4567
Email: info@vietbowls.com

IMPORTANT NOTES:
- Please arrive 5-10 minutes before your reservation time
- We will confirm your booking within 2 hours
- For any changes, please contact us at least 24 hours in advance
- Dress code: Smart casual

We look forward to serving you!

Best regards,
The VIET BOWLS Team

---
This is an automated email. Please do not reply directly to this message.
© 2024 VIET BOWLS. All rights reserved.
  `
}

// Generate HTML email content for status updates
const generateStatusUpdateEmailHTML = (reservation, oldStatus, newStatus) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#28a745'
      case 'cancelled': return '#dc3545'
      case 'completed': return '#17a2b8'
      default: return '#ffc107'
    }
  }
  
  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmed'
      case 'cancelled': return 'Cancelled'
      case 'completed': return 'Completed'
      default: return 'Pending'
    }
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reservation Status Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .status-badge { 
          display: inline-block; 
          padding: 10px 20px; 
          background: ${getStatusColor(newStatus)}; 
          color: white; 
          border-radius: 20px; 
          font-weight: bold; 
          text-transform: uppercase; 
        }
        .reservation-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #e74c3c; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍜 VIET BOWLS</h1>
          <h2>Reservation Status Update</h2>
        </div>
        
        <div class="content">
          <p>Dear <strong>${reservation.customerName}</strong>,</p>
          
          <p>Your reservation status has been updated.</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <div class="status-badge">${getStatusText(newStatus)}</div>
          </div>
          
          <div class="reservation-details">
            <h3>📅 Reservation Details</h3>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${formatDate(reservation.reservationDate)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${reservation.reservationTime}</span>
            </div>
            <div class="detail-row">
              <span class="label">Number of Guests:</span>
              <span class="value">${reservation.numberOfPeople} ${reservation.numberOfPeople === 1 ? 'person' : 'people'}</span>
            </div>
            ${reservation.adminNote ? `
            <div class="detail-row">
              <span class="label">Admin Note:</span>
              <span class="value">${reservation.adminNote}</span>
            </div>
            ` : ''}
          </div>
          
          ${newStatus === 'confirmed' ? `
          <p><strong>Your reservation is confirmed! 🎉</strong></p>
          <p>Please arrive 5-10 minutes before your reservation time. We look forward to serving you!</p>
          ` : newStatus === 'cancelled' ? `
          <p><strong>Your reservation has been cancelled.</strong></p>
          <p>If you have any questions, please contact us directly.</p>
          ` : newStatus === 'completed' ? `
          <p><strong>Thank you for dining with us!</strong></p>
          <p>We hope you enjoyed your meal. Please visit us again soon!</p>
          ` : ''}
          
          <p>If you have any questions, please contact us:</p>
          <p><strong>Phone:</strong> +1 (555) 123-4567<br>
          <strong>Email:</strong> info@vietbowls.com</p>
          
          <p>Best regards,<br>
          <strong>The VIET BOWLS Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
          <p>© 2024 VIET BOWLS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate plain text email content for status updates
const generateStatusUpdateEmailText = (reservation, oldStatus, newStatus) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmed'
      case 'cancelled': return 'Cancelled'
      case 'completed': return 'Completed'
      default: return 'Pending'
    }
  }
  
  return `
VIET BOWLS - Reservation Status Update

Dear ${reservation.customerName},

Your reservation status has been updated to: ${getStatusText(newStatus)}

RESERVATION DETAILS:
Date: ${formatDate(reservation.reservationDate)}
Time: ${reservation.reservationTime}
Number of Guests: ${reservation.numberOfPeople} ${reservation.numberOfPeople === 1 ? 'person' : 'people'}
${reservation.adminNote ? `Admin Note: ${reservation.adminNote}` : ''}

${newStatus === 'confirmed' ? `
Your reservation is confirmed! 🎉

Please arrive 5-10 minutes before your reservation time. We look forward to serving you!
` : newStatus === 'cancelled' ? `
Your reservation has been cancelled.

If you have any questions, please contact us directly.
` : newStatus === 'completed' ? `
Thank you for dining with us!

We hope you enjoyed your meal. Please visit us again soon!
` : ''}

If you have any questions, please contact us:
Phone: +1 (555) 123-4567
Email: info@vietbowls.com

Best regards,
The VIET BOWLS Team

---
This is an automated email. Please do not reply directly to this message.
© 2024 VIET BOWLS. All rights reserved.
  `
}

// Generate HTML email content for contact confirmation
const generateContactConfirmationEmailHTML = (contactMessage, adminResponse = null) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getSubjectText = (subject) => {
    switch (subject) {
      case 'general': return 'General Inquiry'
      case 'reservation': return 'Reservation'
      case 'feedback': return 'Feedback'
      case 'complaint': return 'Complaint'
      case 'partnership': return 'Partnership'
      case 'other': return 'Other'
      default: return subject
    }
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${adminResponse ? 'Response to Your Message' : 'Message Received'}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .message-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #e74c3c; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .contact-info { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .admin-response { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍜 VIET BOWLS</h1>
          <p>${adminResponse ? 'Response to Your Message' : 'Message Received'}</p>
        </div>
        
        <div class="content">
          <p>Dear <strong>${contactMessage.name}</strong>,</p>
          
          ${adminResponse ? `
          <p>Thank you for contacting us. We have received your message and would like to provide you with a response:</p>
          
          <div class="admin-response">
            <h3>Our Response:</h3>
            <p>${adminResponse}</p>
          </div>
          
          <p>If you have any further questions or need additional assistance, please don't hesitate to contact us again.</p>
          ` : `
          <p>Thank you for contacting VIET BOWLS. We have received your message and will get back to you as soon as possible.</p>
          
          <p>Here are the details of your message:</p>
          `}
          
          <div class="message-details">
            <div class="detail-row">
              <span class="label">Subject:</span>
              <span class="value">${getSubjectText(contactMessage.subject)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Message:</span>
              <span class="value">${contactMessage.message}</span>
            </div>
            <div class="detail-row">
              <span class="label">Sent:</span>
              <span class="value">${formatDate(contactMessage.createdAt)}</span>
            </div>
          </div>
          
          <div class="contact-info">
            <h3>Contact Information</h3>
            <p><strong>Phone:</strong> +1 (555) 123-4567<br>
            <strong>Email:</strong> info@vietbowls.com<br>
            <strong>Address:</strong> 123 ABC Street, District 1, Ho Chi Minh City, Vietnam</p>
          </div>
          
          <p>Best regards,<br>
          <strong>The VIET BOWLS Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
          <p>© 2024 VIET BOWLS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate plain text email content for contact confirmation
const generateContactConfirmationEmailText = (contactMessage, adminResponse = null) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getSubjectText = (subject) => {
    switch (subject) {
      case 'general': return 'General Inquiry'
      case 'reservation': return 'Reservation'
      case 'feedback': return 'Feedback'
      case 'complaint': return 'Complaint'
      case 'partnership': return 'Partnership'
      case 'other': return 'Other'
      default: return subject
    }
  }
  
  return `
VIET BOWLS - ${adminResponse ? 'Response to Your Message' : 'Message Received'}

Dear ${contactMessage.name},

${adminResponse ? `
Thank you for contacting us. We have received your message and would like to provide you with a response:

OUR RESPONSE:
${adminResponse}

If you have any further questions or need additional assistance, please don't hesitate to contact us again.
` : `
Thank you for contacting VIET BOWLS. We have received your message and will get back to you as soon as possible.

Here are the details of your message:
`}

MESSAGE DETAILS:
Subject: ${getSubjectText(contactMessage.subject)}
Message: ${contactMessage.message}
Sent: ${formatDate(contactMessage.createdAt)}

CONTACT INFORMATION:
Phone: +1 (555) 123-4567
Email: info@vietbowls.com
Address: 123 ABC Street, District 1, Ho Chi Minh City, Vietnam

Best regards,
The VIET BOWLS Team

---
This is an automated email. Please do not reply directly to this message.
© 2024 VIET BOWLS. All rights reserved.
  `
}

// Generate HTML email content for admin notification
const generateAdminNotificationEmailHTML = (contactMessage) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getSubjectText = (subject) => {
    switch (subject) {
      case 'general': return 'General Inquiry'
      case 'reservation': return 'Reservation'
      case 'feedback': return 'Feedback'
      case 'complaint': return 'Complaint'
      case 'partnership': return 'Partnership'
      case 'other': return 'Other'
      default: return subject
    }
  }
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#e74c3c'
      case 'high': return '#f39c12'
      case 'medium': return '#3498db'
      case 'low': return '#27ae60'
      default: return '#3498db'
    }
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Contact Message - ${contactMessage.subject.toUpperCase()}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .message-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #e74c3c; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; font-size: 12px; font-weight: bold; }
        .customer-info { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍜 VIET BOWLS</h1>
          <p>New Contact Message - ${contactMessage.subject.toUpperCase()}</p>
        </div>
        
        <div class="content">
          <p>A new contact message has been received from the website.</p>
          
          <div class="customer-info">
            <h3>Customer Information</h3>
            <div class="detail-row">
              <span class="label">Name:</span>
              <span class="value">${contactMessage.name}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">${contactMessage.email}</span>
            </div>
            <div class="detail-row">
              <span class="label">Subject:</span>
              <span class="value">${getSubjectText(contactMessage.subject)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Priority:</span>
              <span class="value">
                <span class="priority-badge" style="background-color: ${getPriorityColor(contactMessage.priority)};">
                  ${contactMessage.priority.toUpperCase()}
                </span>
              </span>
            </div>
            <div class="detail-row">
              <span class="label">Received:</span>
              <span class="value">${formatDate(contactMessage.createdAt)}</span>
            </div>
          </div>
          
          <div class="message-details">
            <h3>Message Content</h3>
            <p>${contactMessage.message}</p>
          </div>
          
          <p><strong>Action Required:</strong> Please review this message and respond appropriately.</p>
          
          <p>You can manage this message through the admin panel.</p>
        </div>
        
        <div class="footer">
          <p>This is an automated notification email.</p>
          <p>© 2024 VIET BOWLS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate plain text email content for admin notification
const generateAdminNotificationEmailText = (contactMessage) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getSubjectText = (subject) => {
    switch (subject) {
      case 'general': return 'General Inquiry'
      case 'reservation': return 'Reservation'
      case 'feedback': return 'Feedback'
      case 'complaint': return 'Complaint'
      case 'partnership': return 'Partnership'
      case 'other': return 'Other'
      default: return subject
    }
  }
  
  return `
VIET BOWLS - New Contact Message

A new contact message has been received from the website.

CUSTOMER INFORMATION:
Name: ${contactMessage.name}
Email: ${contactMessage.email}
Subject: ${getSubjectText(contactMessage.subject)}
Priority: ${contactMessage.priority.toUpperCase()}
Received: ${formatDate(contactMessage.createdAt)}

MESSAGE CONTENT:
${contactMessage.message}

ACTION REQUIRED: Please review this message and respond appropriately.

You can manage this message through the admin panel.

---
This is an automated notification email.
© 2024 VIET BOWLS. All rights reserved.
  `
}
