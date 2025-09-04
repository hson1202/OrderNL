import React, { useState, useEffect } from 'react'
import './Users.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import '../../i18n'
import config from '../../config/config'

const Users = ({ url }) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  })
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      // Get admin token
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        console.error('❌ Admin not logged in. Please login again.');
        alert('Admin not logged in. Please login again.');
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`${config.BACKEND_URL}/api/admin/users`, { 
        headers: { 'token': adminToken } 
      })
      console.log('✅ Users fetched:', response.data)
      setUsers(response.data)
    } catch (error) {
      console.error('❌ Error fetching users:', error)
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('adminToken');
      } else {
        toast.error(t('users.fetchError', 'Failed to fetch users'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusToggle = async (userId, newStatus) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        alert('Admin not logged in. Please login again.');
        return;
      }

      await axios.put(`${config.BACKEND_URL}/api/admin/users/${userId}/status`, {
        status: newStatus
      }, { 
        headers: { 'token': adminToken } 
      })
      toast.success(t('users.statusUpdateSuccess', 'User status updated successfully'))
      fetchUsers()
    } catch (error) {
      console.error('❌ Error updating user status:', error)
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('adminToken');
      } else {
        toast.error(t('users.statusUpdateError', 'Failed to update user status'))
      }
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        alert('Admin not logged in. Please login again.');
        return;
      }

      await axios.put(`${config.BACKEND_URL}/api/admin/users/${userId}/role`, {
        role: newRole
      }, { 
        headers: { 'token': adminToken } 
      })
      toast.success(t('users.roleUpdateSuccess', 'User role updated successfully'))
      fetchUsers()
    } catch (error) {
      console.error('❌ Error updating user role:', error)
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('adminToken');
      } else {
        toast.error(t('users.roleUpdateError', 'Failed to update user role'))
      }
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm(t('users.deleteConfirm', 'Are you sure you want to delete this user? This action cannot be undone.'))) {
      try {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          alert('Admin not logged in. Please login again.');
          return;
        }

        await axios.delete(`${config.BACKEND_URL}/api/admin/users/${userId}`, { 
          headers: { 'token': adminToken } 
        })
        toast.success(t('users.deleteSuccess', 'User deleted successfully'))
        fetchUsers()
      } catch (error) {
        console.error('❌ Error deleting user:', error)
        if (error.response?.status === 401) {
          alert('Session expired. Please login again.');
          localStorage.removeItem('adminToken');
        } else {
          toast.error(t('users.deleteError', 'Failed to delete user'))
        }
      }
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      password: ''
    })
    setShowEditModal(true)
  }

  const handleEditFormChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    // Tạo object update chỉ với các fields có giá trị
    const updateData = {}
    if (editForm.name.trim()) updateData.name = editForm.name.trim()
    if (editForm.email.trim()) updateData.email = editForm.email.trim()
    if (editForm.phone.trim()) updateData.phone = editForm.phone.trim()
    if (editForm.address.trim()) updateData.address = editForm.address.trim()
    if (editForm.password.trim()) updateData.password = editForm.password.trim()

    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        alert('Admin not logged in. Please login again.');
        return;
      }

      await axios.put(`${config.BACKEND_URL}/api/admin/users/${editingUser._id}`, updateData, { 
        headers: { 'token': adminToken } 
      })
      toast.success(t('users.updateSuccess', 'User updated successfully'))
      setShowEditModal(false)
      setEditingUser(null)
      setEditForm({ name: '', email: '', phone: '', address: '', password: '' })
      fetchUsers()
    } catch (error) {
      console.error('❌ Error updating user:', error)
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('adminToken');
      } else {
        toast.error(t('users.updateError', 'Failed to update user'))
      }
    }
  }

  const handleCancelEdit = () => {
    setShowEditModal(false)
    setEditingUser(null)
    setEditForm({ name: '', email: '', phone: '', address: '', password: '' })
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const getStatusBadge = (status) => {
    return (
      <span className={`status-badge ${status}`}>
        {t(`users.statuses.${status}`, status.charAt(0).toUpperCase() + status.slice(1))}
      </span>
    )
  }

  const getRoleBadge = (role) => {
    return (
      <span className={`role-badge ${role}`}>
        {t(`users.roles.${role}`, role.charAt(0).toUpperCase() + role.slice(1))}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="users-loading">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className='users-page'>
      <div className="users-header">
        <div className="header-content">
          <h1>
            {t('users.title')}
            <span className="users-count">
              <span>{filteredUsers.length}</span> users
            </span>
          </h1>
          <p>{t('users.subtitle', 'Manage your application users')}</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={fetchUsers}>
            <span>🔄</span> {t('common.refresh') || 'Refresh'}
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder={t('users.searchPlaceholder', 'Search users by name or email...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="clear-search">
              ✕
            </button>
          )}
        </div>

        <div className="filter-box">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="role-filter"
          >
            <option value="all">{t('users.allRoles', 'All Roles')}</option>
            <option value="user">{t('users.roles.user', 'User')}</option>
            <option value="admin">{t('users.roles.admin', 'Admin')}</option>
            <option value="moderator">{t('users.roles.moderator', 'Moderator')}</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="users-list">
        {filteredUsers.length === 0 ? (
          <div className="no-users">
            <p>{t('users.noUsers', 'No users found')}</p>
          </div>
        ) : (
          <div className="users-grid">
            {filteredUsers.map((user) => (
              <div key={user._id} className="user-card">
                <div className="user-header">
                  <div className="user-avatar" data-initial={user.name ? user.name.charAt(0).toUpperCase() : 'U'}>
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} />
                    ) : (
                      <span>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <div className="user-info">
                    <h3>{user.name}</h3>
                    <p className="user-email">{user.email}</p>
                    <div className="user-badges">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>
                  </div>
                </div>

                <div className="user-details">
                  <div className="detail-item">
                    <span className="label">{t('users.registrationDate')}:</span>
                    <span className="value">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">{t('users.orderCount')}:</span>
                    <span className="value">{user.orderCount || 0}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">{t('users.lastLogin')}:</span>
                    <span className="value">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : t('users.never', 'Never')}
                    </span>
                  </div>
                </div>

                <div className="user-actions">
                  <div className="action-group">
                    <label>{t('users.status')}:</label>
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusToggle(user._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="active">{t('users.statuses.active', 'Active')}</option>
                      <option value="inactive">{t('users.statuses.inactive', 'Inactive')}</option>
                      <option value="suspended">{t('users.statuses.suspended', 'Suspended')}</option>
                    </select>
                  </div>

                  <div className="action-group">
                    <label>{t('users.role')}:</label>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="role-select"
                    >
                      <option value="user">{t('users.roles.user', 'User')}</option>
                      <option value="admin">{t('users.roles.admin', 'Admin')}</option>
                      <option value="moderator">{t('users.roles.moderator', 'Moderator')}</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleEditUser(user)}
                    className="btn-edit"
                  >
                    {t('users.editUser', 'Edit User')}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="btn-delete"
                  >
                    {t('users.deleteUser')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="modal-header">
              <h2>{t('users.editUser', 'Edit User')}</h2>
              <button 
                className="modal-close"
                onClick={handleCancelEdit}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>{t('users.name', 'Name')}:</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                  className="form-input"
                  placeholder={t('users.namePlaceholder', 'Enter user name')}
                />
              </div>
              
              <div className="form-group">
                <label>{t('users.email', 'Email')}:</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditFormChange}
                  className="form-input"
                  placeholder={t('users.emailPlaceholder', 'Enter user email')}
                />
              </div>
              
              <div className="form-group">
                <label>{t('users.phone', 'Phone')}:</label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditFormChange}
                  className="form-input"
                  placeholder={t('users.phonePlaceholder', 'Enter user phone')}
                />
              </div>
              
              <div className="form-group">
                <label>{t('users.address', 'Address')}:</label>
                <textarea
                  name="address"
                  value={editForm.address}
                  onChange={handleEditFormChange}
                  className="form-textarea"
                  placeholder={t('users.addressPlaceholder', 'Enter user address')}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>{t('users.password', 'New Password')}:</label>
                <input
                  type="password"
                  name="password"
                  value={editForm.password}
                  onChange={handleEditFormChange}
                  className="form-input"
                  placeholder={t('users.passwordPlaceholder', 'Leave blank to keep current password')}
                />
                <small className="form-help">
                  {t('users.passwordHelp', 'Leave blank if you don\'t want to change the password')}
                </small>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={handleCancelEdit}
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button 
                className="btn-save"
                onClick={handleUpdateUser}
              >
                {t('common.save', 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users 