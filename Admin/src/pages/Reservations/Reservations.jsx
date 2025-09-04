import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './Reservations.css'
import config from '../../config/config'

const Reservations = ({ url }) => {
  const { t } = useTranslation()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${config.BACKEND_URL}/api/reservation`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(t('reservations.errors.failedToFetch'))
      }

      const data = await response.json()
      setReservations(data.data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching reservations:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateReservationStatus = async (id, status, adminNote = '') => {
    try {
      console.log('Updating reservation status:', { id, status, adminNote })
      setUpdatingStatus(true)
      const token = localStorage.getItem('adminToken')
      console.log('Token:', token ? 'Present' : 'Missing')
      
      const requestBody = { status, adminNote }
      console.log('Request body:', requestBody)
      
      const response = await fetch(`${config.BACKEND_URL}/api/reservation/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.log('Error response:', errorText)
        throw new Error(t('reservations.errors.failedToUpdate'))
      }

      const result = await response.json()
      if (result.success) {
        // Update local state
        setReservations(prev => 
          prev.map(res => 
            res._id === id 
              ? { 
                  ...res, 
                  status, 
                  adminNote, 
                  completedAt: status === 'completed' ? new Date() : (status === 'pending' ? null : res.completedAt),
                  completedBy: status === 'completed' ? 'Admin' : (status === 'pending' ? null : res.completedBy)
                }
              : res
          )
        )
        setShowModal(false)
        setSelectedReservation(null)
        
        // Show success message
        showNotification(t('reservations.messages.statusUpdatedSuccess'), 'success')
      }
    } catch (err) {
      console.error('Error updating reservation:', err)
      showNotification(t('reservations.errors.updateError') + ': ' + err.message, 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const deleteReservation = async (id) => {
    if (!window.confirm(t('reservations.confirmations.deleteReservation'))) {
      return
    }

    try {
      setDeletingId(id)
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${config.BACKEND_URL}/api/reservation/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(t('reservations.errors.failedToDelete'))
      }

      setReservations(prev => prev.filter(res => res._id !== id))
      showNotification(t('reservations.messages.deletedSuccess'), 'success')
    } catch (err) {
      console.error('Error deleting reservation:', err)
      showNotification(t('reservations.errors.deleteError') + ': ' + err.message, 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const openModal = (reservation) => {
    setSelectedReservation(reservation)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedReservation(null)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107'
      case 'completed': return '#28a745'
      case 'cancelled': return '#dc3545'
      default: return '#6c757d'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return t('reservations.status.pending')
      case 'completed': return t('reservations.status.completed')
      case 'cancelled': return t('reservations.status.cancelled')
      default: return status
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    const dayName = days[date.getDay()]
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    
    return `${dayName}, ${day}/${month}/${year}`
  }

  const formatTime = (timeString) => {
    return timeString
  }

  const showNotification = (message, type = 'info') => {
    // Simple notification system - you can replace this with react-toastify or similar
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    notification.textContent = message
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      max-width: 300px;
    `
    
    if (type === 'success') {
      notification.style.background = '#28a745'
    } else if (type === 'error') {
      notification.style.background = '#dc3545'
    } else {
      notification.style.background = '#007bff'
    }
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease'
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }

  // Filter reservations based on status and search term
  const filteredReservations = reservations.filter(reservation => {
    const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus
    const matchesSearch = 
      reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.phone.includes(searchTerm)
    
    return matchesStatus && matchesSearch
  })

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('reservations.loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h3>{t('reservations.errors.loadingError')}</h3>
        <p>{error}</p>
        <button onClick={fetchReservations} className="retry-btn">
          {t('reservations.actions.tryAgain')}
        </button>
      </div>
    )
  }

  return (
    <div className="reservations-page">
      <div className="page-header">
        <div className="header-content">
          <h1>{t('reservations.pageTitle')}</h1>
          <p>{t('reservations.pageDescription')}</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={fetchReservations}>
            <span>🔄</span> {t('common.refresh') || 'Refresh'}
          </button>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{reservations.length}</span>
            <span className="stat-label">{t('reservations.stats.total')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{reservations.filter(r => r.status === 'pending').length}</span>
            <span className="stat-label">{t('reservations.stats.pending')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{reservations.filter(r => r.status === 'completed').length}</span>
            <span className="stat-label">{t('reservations.stats.completed')}</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <input
              type="text"
              placeholder={t('reservations.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="status-filter">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">{t('reservations.filters.allStatus')}</option>
              <option value="pending">{t('reservations.filters.pending')}</option>
              <option value="completed">{t('reservations.filters.completed')}</option>
              <option value="cancelled">{t('reservations.filters.cancelled')}</option>

            </select>
          </div>

          <div className="date-filters">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              placeholder={t('reservations.filters.startDate')}
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              placeholder={t('reservations.filters.endDate')}
            />
            <button 
              className="filter-btn"
              onClick={() => {
                if (dateRange.startDate && dateRange.endDate) {
                  // Implement date range filtering
                  console.log('Filter by date range:', dateRange)
                }
              }}
            >
              {t('reservations.filters.filterByDate')}
            </button>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="reservations-table">
        <table>
          <thead>
            <tr>
              <th>{t('reservations.table.customer')}</th>
              <th>{t('reservations.table.contact')}</th>
              <th>{t('reservations.table.dateTime')}</th>
              <th>{t('reservations.table.guests')}</th>
              <th>{t('reservations.table.status')}</th>
              <th>{t('reservations.table.createdAt')}</th>
              <th>{t('reservations.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.map((reservation) => (
              <tr key={reservation._id}>
                <td>
                  <div className="customer-info">
                    <strong>{reservation.customerName}</strong>
                    {reservation.note && (
                      <span className="note-indicator" title={reservation.note}>📝</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    <div>{reservation.email}</div>
                    <div>{reservation.phone}</div>
                  </div>
                </td>
                <td>
                  <div className="datetime-info">
                    <div>{formatDate(reservation.reservationDate)}</div>
                    <div>{formatTime(reservation.reservationTime)}</div>
                  </div>
                </td>
                <td>
                  <span className="guests-count">{reservation.numberOfPeople}</span>
                </td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(reservation.status) }}
                  >
                    {getStatusText(reservation.status)}
                  </span>
                </td>
                <td>
                  {formatDate(reservation.createdAt)}
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-view"
                      onClick={() => openModal(reservation)}
                    >
                      {t('reservations.actions.view')}
                    </button>
                    <button 
                      className={`btn-delete ${deletingId === reservation._id ? 'deleting' : ''}`}
                      onClick={() => deleteReservation(reservation._id)}
                      disabled={deletingId === reservation._id}
                    >
                      {deletingId === reservation._id ? t('reservations.actions.deleting') : t('reservations.actions.delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredReservations.length === 0 && (
          <div className="no-reservations">
            <div className="no-data-icon">📅</div>
            <p>{t('reservations.noReservationsFound')}</p>
            {searchTerm || filterStatus !== 'all' ? (
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setFilterStatus('all')
                }}
                className="clear-filters-btn"
              >
                {t('reservations.clearFilters')}
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Reservation Detail Modal */}
      {showModal && selectedReservation && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Status Badge */}
            <div className={`modal-status-badge ${selectedReservation.status}`}>
              {getStatusText(selectedReservation.status)}
            </div>
            
            <div className="modal-header">
              <h2>{t('reservations.modal.detailTitle')}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Booking ID */}
              <p className="booking-id">
                {t('reservations.modal.bookingId')}: <strong>#{selectedReservation._id.slice(-6).toUpperCase()}</strong>
              </p>

              {/* Customer Information */}
              <div className="detail-section">
                <h3>{t('reservations.modal.customerInfoTitle')}</h3>
                <div className="info-row">
                  <span className="info-label">{t('reservations.modal.customerName')}:</span>
                  <span className="info-value highlight">{selectedReservation.customerName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{t('reservations.modal.phone')}:</span>
                  <span className="info-value">{selectedReservation.phone}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{t('reservations.modal.email')}:</span>
                  <span className="info-value">{selectedReservation.email}</span>
                </div>
              </div>

              {/* Reservation Information */}
              <div className="detail-section">
                <h3>{t('reservations.modal.reservationInfoTitle')}</h3>
                
                {/* Date Time Box */}
                <div className="date-time-box">
                  <div className="date">{formatDate(selectedReservation.reservationDate)}</div>
                  <div className="time">{formatTime(selectedReservation.reservationTime)}</div>
                </div>
                
                <div className="info-row">
                  <span className="info-label">{t('reservations.modal.numberOfGuests')}:</span>
                  <span className="info-value highlight">{selectedReservation.numberOfPeople} {t('reservations.modal.people')}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{t('reservations.modal.createdAt')}:</span>
                  <span className="info-value">{formatDate(selectedReservation.createdAt)} - {formatTime(selectedReservation.createdAt)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{t('reservations.modal.status')}:</span>
                  <span className="info-value highlight">{getStatusText(selectedReservation.status)}</span>
                </div>
              </div>

              {/* Special Requests */}
              {selectedReservation.note && (
                <div className="notes-section">
                  <div className="notes-title">{t('reservations.modal.notesTitle')}:</div>
                  <div className="notes-text">
                    {selectedReservation.note}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="modal-action-buttons">
               
                <button className="modal-btn modal-btn-secondary" onClick={() => {
                  // Print functionality
                  window.print()
                }}>
                  {t('reservations.modal.printDetails')}
                </button>
                <button className="modal-btn modal-btn-danger" onClick={() => {
                  // Cancel functionality
                  if (window.confirm(t('reservations.modal.confirmCancel'))) {
                    updateReservationStatus(selectedReservation._id, 'cancelled', t('reservations.modal.cancelledByAdmin'))
                  }
                }}>
                  {t('reservations.modal.cancel')}
                </button>
              </div>

                            {/* Status Management for Admin */}
              <div className="detail-section">
                <h3>{t('reservations.modal.statusManagementTitle')}</h3>
                <div className="status-actions">
                  <div className="status-change-info">
                    <p><strong>Trạng thái hiện tại:</strong> {getStatusText(selectedReservation.status)}</p>
                    <p><strong>Thay đổi thành:</strong></p>
                  </div>
                  
                  <select 
                    value={selectedReservation.status}
                    onChange={(e) => {
                      setSelectedReservation({
                        ...selectedReservation,
                        status: e.target.value
                      })
                    }}
                  >
                    <option value="pending">{t('reservations.modal.pending')}</option>
                    <option value="completed">{t('reservations.modal.completed')}</option>
                    <option value="cancelled">{t('reservations.modal.cancelled')}</option>
                  </select>
                  
                  <textarea
                    placeholder={t('reservations.modal.adminNotePlaceholder')}
                    value={selectedReservation.adminNote || ''}
                    onChange={(e) => {
                      setSelectedReservation({
                        ...selectedReservation,
                        adminNote: e.target.value
                      })
                    }}
                    rows="3"
                  />
                  
                  <button 
                    className={`btn-update ${updatingStatus ? 'updating' : ''}`}
                    onClick={() => updateReservationStatus(
                      selectedReservation._id,
                      selectedReservation.status,
                      selectedReservation.adminNote
                    )}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? t('reservations.modal.updating') : t('reservations.modal.updateStatus')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reservations
