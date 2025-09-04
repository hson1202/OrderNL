import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './ContactMessages.css'
import config from '../../config/config'

const ContactMessages = ({ url }) => {
  const { t } = useTranslation()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSubject, setFilterSubject] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({})
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [adminResponse, setAdminResponse] = useState('')

  useEffect(() => {
    fetchMessages()
  }, [currentPage, filterStatus, filterSubject, searchTerm])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('adminToken')
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterSubject !== 'all' && { subject: filterSubject }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`${config.BACKEND_URL}/api/contact?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      setMessages(data.data.messages)
      setTotalPages(data.data.pagination.totalPages)
      setStats(data.data.stats)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateMessageStatus = async (id, status, priority = null, tags = null) => {
    try {
      setUpdatingStatus(true)
      const token = localStorage.getItem('adminToken')
      
      const updateData = { status }
      if (priority) updateData.priority = priority
      if (tags) updateData.tags = tags

      const response = await fetch(`${config.BACKEND_URL}/api/contact/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        throw new Error('Failed to update message status')
      }

      const result = await response.json()
      if (result.success) {
        // Update local state
        setMessages(prev => 
          prev.map(msg => 
            msg._id === id 
              ? { ...msg, status, ...(priority && { priority }), ...(tags && { tags }) }
              : msg
          )
        )
        
        // Close modal if updating from modal
        if (showModal) {
          setShowModal(false)
          setSelectedMessage(null)
        }
        
        showNotification('Message status updated successfully!', 'success')
        fetchMessages() // Refresh to get updated stats
      }
    } catch (err) {
      console.error('Error updating message status:', err)
      showNotification('Error updating message status: ' + err.message, 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const addAdminResponse = async (id) => {
    if (!adminResponse.trim()) {
      showNotification('Please enter a response', 'error')
      return
    }

    try {
      setUpdatingStatus(true)
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch(`${config.BACKEND_URL}/api/contact/${id}/response`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          response: adminResponse.trim(),
          adminName: 'Admin'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add admin response')
      }

      const result = await response.json()
      if (result.success) {
        // Update local state
        setMessages(prev => 
          prev.map(msg => 
            msg._id === id 
              ? { 
                  ...msg, 
                  adminResponse: adminResponse.trim(),
                  respondedBy: 'Admin',
                  respondedAt: new Date(),
                  status: 'resolved'
                }
              : msg
          )
        )
        
        setAdminResponse('')
        setShowModal(false)
        setSelectedMessage(null)
        
        showNotification('Response added successfully!', 'success')
        fetchMessages() // Refresh to get updated stats
      }
    } catch (err) {
      console.error('Error adding admin response:', err)
      showNotification('Error adding response: ' + err.message, 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const deleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingId(id)
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch(`${config.BACKEND_URL}/api/contact/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete message')
      }

      setMessages(prev => prev.filter(msg => msg._id !== id))
      showNotification('Message deleted successfully', 'success')
      fetchMessages() // Refresh to get updated stats
    } catch (err) {
      console.error('Error deleting message:', err)
      showNotification('Error deleting message: ' + err.message, 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const openModal = (message) => {
    setSelectedMessage(message)
    setShowModal(true)
    setAdminResponse('')
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedMessage(null)
    setAdminResponse('')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return '#e74c3c'
      case 'read': return '#3498db'
      case 'in-progress': return '#f39c12'
      case 'resolved': return '#27ae60'
      case 'closed': return '#95a5a6'
      default: return '#6c757d'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'unread': return 'Unread'
      case 'read': return 'Read'
      case 'in-progress': return 'In Progress'
      case 'resolved': return 'Resolved'
      case 'closed': return 'Closed'
      default: return status
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#e74c3c'
      case 'high': return '#f39c12'
      case 'medium': return '#3498db'
      case 'low': return '#27ae60'
      default: return '#6c757d'
    }
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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const showNotification = (message, type = 'info') => {
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

  // Filter messages based on status, subject and search term
  const filteredMessages = messages.filter(message => {
    const matchesStatus = filterStatus === 'all' || message.status === filterStatus
    const matchesSubject = filterSubject === 'all' || message.subject === filterSubject
    const matchesSearch = 
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesSubject && matchesSearch
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

  if (loading && messages.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading contact messages...</p>
      </div>
    )
  }

  if (error && messages.length === 0) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h3>Error Loading Messages</h3>
        <p>{error}</p>
        <button onClick={fetchMessages} className="retry-btn">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="contact-messages-page">
      <div className="page-header">
        <h1>Contact Messages Management</h1>
        <p>Manage and respond to customer inquiries, feedback, and complaints</p>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.total || 0}</span>
            <span className="stat-label">Total Messages</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.unread || 0}</span>
            <span className="stat-label">Unread</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.resolved || 0}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, email, or message..."
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
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="subject-filter">
            <select 
              value={filterSubject} 
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <option value="all">All Subjects</option>
              <option value="general">General Inquiry</option>
              <option value="reservation">Reservation</option>
              <option value="feedback">Feedback</option>
              <option value="complaint">Complaint</option>
              <option value="partnership">Partnership</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="messages-table">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Received</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.map((message) => (
              <tr key={message._id} className={message.status === 'unread' ? 'unread-row' : ''}>
                <td>
                  <div className="customer-info">
                    <strong>{message.name}</strong>
                    <div>{message.email}</div>
                  </div>
                </td>
                <td>
                  <span className="subject-badge">
                    {getSubjectText(message.subject)}
                  </span>
                </td>
                <td>
                  <div className="message-preview">
                    {message.message.length > 100 
                      ? `${message.message.substring(0, 100)}...` 
                      : message.message
                    }
                  </div>
                </td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(message.status) }}
                  >
                    {getStatusText(message.status)}
                  </span>
                </td>
                <td>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(message.priority) }}
                  >
                    {message.priority.toUpperCase()}
                  </span>
                </td>
                <td>
                  {formatDate(message.createdAt)}
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-view"
                      onClick={() => openModal(message)}
                    >
                      View
                    </button>
                    <button 
                      className={`btn-delete ${deletingId === message._id ? 'deleting' : ''}`}
                      onClick={() => deleteMessage(message._id)}
                      disabled={deletingId === message._id}
                    >
                      {deletingId === message._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMessages.length === 0 && (
          <div className="no-messages">
            <div className="no-data-icon">📧</div>
            <p>No messages found matching your criteria.</p>
            {(searchTerm || filterStatus !== 'all' || filterSubject !== 'all') && (
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setFilterStatus('all')
                  setFilterSubject('all')
                }}
                className="clear-filters-btn"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="page-btn"
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* Message Detail Modal */}
      {showModal && selectedMessage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Message Details</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Customer Information */}
              <div className="detail-section">
                <h3>Customer Information</h3>
                <div className="info-row">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{selectedMessage.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{selectedMessage.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Subject:</span>
                  <span className="info-value">{getSubjectText(selectedMessage.subject)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Received:</span>
                  <span className="info-value">{formatDate(selectedMessage.createdAt)}</span>
                </div>
              </div>

              {/* Message Content */}
              <div className="detail-section">
                <h3>Message Content</h3>
                <div className="message-content">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Admin Response */}
              {selectedMessage.adminResponse && (
                <div className="detail-section">
                  <h3>Admin Response</h3>
                  <div className="admin-response">
                    <p><strong>Response:</strong> {selectedMessage.adminResponse}</p>
                    <p><strong>Responded by:</strong> {selectedMessage.respondedBy}</p>
                    <p><strong>Response time:</strong> {formatDate(selectedMessage.respondedAt)}</p>
                  </div>
                </div>
              )}

              {/* Status Management */}
              <div className="detail-section">
                <h3>Status Management</h3>
                <div className="status-actions">
                  <select 
                    value={selectedMessage.status}
                    onChange={(e) => {
                      setSelectedMessage({
                        ...selectedMessage,
                        status: e.target.value
                      })
                    }}
                  >
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  
                  <select 
                    value={selectedMessage.priority}
                    onChange={(e) => {
                      setSelectedMessage({
                        ...selectedMessage,
                        priority: e.target.value
                      })
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  
                  <button 
                    className="btn-update"
                    onClick={() => updateMessageStatus(
                      selectedMessage._id,
                      selectedMessage.status,
                      selectedMessage.priority
                    )}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>

              {/* Add Response */}
              {!selectedMessage.adminResponse && (
                <div className="detail-section">
                  <h3>Add Response</h3>
                  <textarea
                    placeholder="Enter your response to the customer..."
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    rows="4"
                  />
                  <button 
                    className="btn-respond"
                    onClick={() => addAdminResponse(selectedMessage._id)}
                    disabled={updatingStatus || !adminResponse.trim()}
                  >
                    {updatingStatus ? 'Sending...' : 'Send Response'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactMessages
