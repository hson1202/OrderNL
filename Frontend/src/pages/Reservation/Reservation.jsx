import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';
import './Reservation.css';

// Import hero images
import back8 from '../../assets/back8.jpg';
import back9 from '../../assets/back9.jpg';
import back10 from '../../assets/back10.jpg';
import back11 from '../../assets/back11.jpg';
import back12 from '../../assets/back12.jpg';
import headerImg from '../../assets/header_img.png';

const Reservation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [reservationData, setReservationData] = useState({
    customerName: '',
    phone: '',
    email: '',
    reservationDate: '',
    reservationTime: '',
    numberOfPeople: 1,
    note: ''
  });

  // Reservation form states
  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationErrors, setReservationErrors] = useState({});
  const [reservationSuccess, setReservationSuccess] = useState(false);

  // Hero image rotation
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const heroImages = [back8, back9, back10, back11, back12, headerImg];

  const handleReservationChange = (e) => {
    const { name, value } = e.target;
    
    setReservationData({
      ...reservationData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (reservationErrors[name]) {
      setReservationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Client-side validation for reservation form
  const validateReservationForm = () => {
    const errors = {};
    
    if (!reservationData.customerName.trim()) {
      errors.customerName = 'Full name is required';
    } else if (reservationData.customerName.trim().length < 2) {
      errors.customerName = 'Name must be at least 2 characters long';
    }
    
    if (!reservationData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      // Remove all non-digit characters for length check
      const digitsOnly = reservationData.phone.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        errors.phone = 'Phone number must contain at least 10 digits';
      }
    }
    
    if (!reservationData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reservationData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!reservationData.reservationDate) {
      errors.reservationDate = 'Date is required';
    } else {
      const selectedDate = new Date(reservationData.reservationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.reservationDate = 'Cannot select a past date';
      }
    }
    
    if (!reservationData.reservationTime) {
      errors.reservationTime = 'Time is required';
    }
    
    if (!reservationData.numberOfPeople || reservationData.numberOfPeople < 1) {
      errors.numberOfPeople = 'Number of people is required';
    }
    
    return errors;
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateReservationForm();
    if (Object.keys(errors).length > 0) {
      setReservationErrors(errors);
      return;
    }

    try {
      setReservationLoading(true);
      setReservationErrors({});
      
      const response = await fetch(`${config.BACKEND_URL}/api/reservation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit reservation');
      }

      const result = await response.json();
      
      if (result.success) {
        setReservationSuccess(true);
        setReservationData({
          customerName: '',
          phone: '',
          email: '',
          reservationDate: '',
          reservationTime: '',
          numberOfPeople: 1,
          note: ''
        });
        
        // Show longer message if email service is disabled
        const messageDuration = result.messageId === 'email_not_configured' ? 7000 : 5000;
        setTimeout(() => {
          setReservationSuccess(false);
        }, messageDuration);
      }
    } catch (error) {
      console.error('Reservation error:', error);
      setReservationErrors({
        general: error.message
      });
    } finally {
      setReservationLoading(false);
    }
  };

  // Generate available time slots based on business hours
  const generateTimeSlots = (selectedDate) => {
    if (!selectedDate) return [];
    
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    
    let startHour = 11; // 11:00 AM
    let endHour = 20; // 8:00 PM
    
    // Sunday: 11:00 AM - 5:00 PM
    if (dayOfWeek === 0) {
      endHour = 17; // 5:00 PM
    }
    
    const timeSlots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    return timeSlots;
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get business hours text for selected date
  const getBusinessHoursText = (selectedDate) => {
    if (!selectedDate) return '';
    
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek === 0) {
      return 'Sunday: 11:00 AM - 5:00 PM';
    } else {
      return 'Monday-Saturday: 11:00 AM - 8:00 PM';
    }
  };

  // Update time slots when date changes
  const handleDateChange = (e) => {
    const { value } = e.target;
    setReservationData(prev => ({
      ...prev,
      reservationDate: value,
      reservationTime: '' // Reset time when date changes
    }));
  };

  // Handle phone input key press - only allow valid characters
  const handlePhoneKeyDown = (e) => {
    // Allow all navigation and control keys
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
    
    // Allow specific keys
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'Insert', 'PageUp', 'PageDown'
    ];
    
    if (allowedKeys.includes(e.key)) {
      return;
    }
    
    // Allow digits, +, spaces, parentheses, hyphens, and dots
    const allowedChars = /[\d\s\+\-\(\)\.]/;
    if (!allowedChars.test(e.key)) {
      e.preventDefault();
    }
  };

  // Generate time slots for selected date
  const timeSlots = generateTimeSlots(reservationData.reservationDate);

  // Auto-rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="reservation-page">
      <div className="reservation-hero">
        <div className="hero-background">
          <img 
            src={heroImages[currentHeroIndex]}
            alt="Reservation hero background"
            className="hero-bg-image"
          />
        </div>
        <div className="hero-content">
          <h1>Book Your Table</h1>
          <p>Reserve a table at Viet Bowls for an unforgettable dining experience</p>
        </div>
      </div>

      <div className="reservation-container">
        <div className="reservation-form-section">
          <h2>Make a Reservation</h2>
          <p>Please fill out the form below to reserve your table</p>
          
                     {/* Success Message - Inline */}
           {reservationSuccess && (
             <div className="success-message">
               <div className="success-icon">✅</div>
               <div className="success-content">
                 <h3>Reservation Submitted Successfully!</h3>
                 <p>We will contact you soon to confirm your reservation.</p>
                 <p className="email-note">
                   <small>📧 Note: Email confirmation is temporarily unavailable. We'll contact you via phone instead.</small>
                 </p>
               </div>
             </div>
           )}

           {/* Success Popup Modal */}
           {reservationSuccess && (
             <div className="success-popup-overlay">
               <div className="success-popup">
                 <button 
                   className="success-popup-close"
                   onClick={() => setReservationSuccess(false)}
                 >
                   ×
                 </button>
                 
                 <div className="success-popup-icon">🎉</div>
                 
                 <h3>Reservation Confirmed!</h3>
                 
                 <p>
                   Thank you for choosing Viet Bowls! Your table has been reserved successfully.
                 </p>
                 
                 <p>
                   We will contact you within 2 hours to confirm your booking details.
                 </p>
                 
                 <div className="email-note">
                   <strong>📧 Note:</strong> Email confirmation is temporarily unavailable. 
                   We'll contact you via phone instead.
                 </div>
                 
                 <div className="success-popup-actions">
                   <button 
                     className="success-popup-btn secondary"
                     onClick={() => setReservationSuccess(false)}
                   >
                     Close
                   </button>
                   <button 
                     className="success-popup-btn primary"
                     onClick={() => {
                       setReservationSuccess(false);
                       navigate('/');
                     }}
                   >
                     Back to Home
                   </button>
                 </div>
               </div>
             </div>
           )}

          {/* Error Message */}
          {reservationErrors.general && (
            <div className="error-message">
              <div className="error-icon">❌</div>
              <div className="error-content">
                <p>{reservationErrors.general}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleReservationSubmit} className="reservation-form">
            <div className="form-group">
              <label htmlFor="customerName">Full Name *</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={reservationData.customerName}
                onChange={handleReservationChange}
                required
                placeholder="Enter your full name"
                className={reservationErrors.customerName ? 'error' : ''}
              />
              {reservationErrors.customerName && (
                <span className="error-text">{reservationErrors.customerName}</span>
              )}
            </div>
            
                         <div className="form-group">
               <label htmlFor="phone">Phone Number *</label>
               <input
                 type="tel"
                 id="phone"
                 name="phone"
                 value={reservationData.phone}
                 onChange={handleReservationChange}
                 onKeyDown={handlePhoneKeyDown}
                 required
                 placeholder="Enter your phone number (e.g., +1 555-123-4567)"
                 className={reservationErrors.phone ? 'error' : ''}
               />
               {reservationErrors.phone && (
                 <span className="error-text">{reservationErrors.phone}</span>
               )}
             </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={reservationData.email}
                onChange={handleReservationChange}
                required
                placeholder="Enter your email address"
                className={reservationErrors.email ? 'error' : ''}
              />
              {reservationErrors.email && (
                <span className="error-text">{reservationErrors.email}</span>
              )}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reservationDate">Date *</label>
                <input
                  type="date"
                  id="reservationDate"
                  name="reservationDate"
                  value={reservationData.reservationDate}
                  onChange={handleDateChange}
                  required
                  min={getMinDate()}
                  className={reservationErrors.reservationDate ? 'error' : ''}
                />
                {reservationErrors.reservationDate && (
                  <span className="error-text">{reservationErrors.reservationDate}</span>
                )}
                {reservationData.reservationDate && (
                  <div className="business-hours-info">
                    <small>📅 {getBusinessHoursText(reservationData.reservationDate)}</small>
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="reservationTime">Time *</label>
                <select
                  id="reservationTime"
                  name="reservationTime"
                  value={reservationData.reservationTime}
                  onChange={handleReservationChange}
                  required
                  className={reservationErrors.reservationTime ? 'error' : ''}
                  disabled={!reservationData.reservationDate}
                >
                  <option value="">
                    {reservationData.reservationDate ? 'Select time' : 'Select date first'}
                  </option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {reservationErrors.reservationTime && (
                  <span className="error-text">{reservationErrors.reservationTime}</span>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="numberOfPeople">Number of People *</label>
              <select
                id="numberOfPeople"
                name="numberOfPeople"
                value={reservationData.numberOfPeople}
                onChange={handleReservationChange}
                required
                className={reservationErrors.numberOfPeople ? 'error' : ''}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
                ))}
              </select>
              {reservationErrors.numberOfPeople && (
                <span className="error-text">{reservationErrors.numberOfPeople}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="note">Special Requests</label>
              <textarea
                id="note"
                name="note"
                value={reservationData.note}
                onChange={handleReservationChange}
                rows="4"
                placeholder="Any special requests or dietary requirements?"
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => navigate('/')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={`submit-btn ${reservationLoading ? 'loading' : ''}`}
                disabled={reservationLoading}
              >
                {reservationLoading ? 'Submitting...' : 'Book Table'}
              </button>
            </div>
          </form>
        </div>

        <div className="reservation-info">
          <div className="info-card">
            <h3>Restaurant Hours</h3>
            <div className="hours">
              <div className="day">
                <span>Monday - Friday</span>
                <span>11:00 AM - 8:00 PM</span>
              </div>
              <div className="day">
                <span>Saturday</span>
                <span>11:00 AM - 8:00 PM</span>
              </div>
              <div className="day">
                <span>Sunday</span>
                <span>11:00 AM - 5:00 PM</span>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h3>Contact Information</h3>
            <div className="contact-info">
              <p>📍 123 Main Street, City, Country</p>
              <p>📞 +1 (555) 123-4567</p>
              <p>✉️ info@vietbowls.com</p>
            </div>
          </div>

          <div className="info-card">
            <h3>Reservation Policy</h3>
            <ul>
              <li>Reservations are held for 15 minutes</li>
              <li>Please arrive 5 minutes before your reservation time</li>
              <li>For groups of 8+, please call us directly</li>
              <li>Cancellations must be made 2 hours in advance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservation;
