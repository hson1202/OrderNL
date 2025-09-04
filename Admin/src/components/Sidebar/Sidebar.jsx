import React from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Sidebar = () => {
  const { t } = useTranslation();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Admin</h2>
      </div>
      <div className="sidebar-options">
        <NavLink to='/admin' className="sidebar-option" end>
          <div className="sidebar-icon">📊</div>
          <p>{t('nav.dashboard')}</p>
        </NavLink>
        <NavLink to='/admin/orders' className="sidebar-option">
          <div className="sidebar-icon">📦</div>
          <p>{t('nav.orders')}</p>
        </NavLink>
        <NavLink to='/admin/category' className="sidebar-option">
          <div className="sidebar-icon">🏷️</div>
          <p>{t('nav.categories')}</p>
        </NavLink>
        <NavLink to='/admin/products' className="sidebar-option">
          <div className="sidebar-icon">🍽️</div>
          <p>{t('nav.products')}</p>
        </NavLink>
        <NavLink to='/admin/reservations' className="sidebar-option">
          <div className="sidebar-icon">📅</div>
          <p>Reservations</p>
        </NavLink>
        <NavLink to='/admin/messages' className="sidebar-option">
          <div className="sidebar-icon">💬</div>
          <p>Messages</p>
        </NavLink>
        <NavLink to='/admin/users' className="sidebar-option">
          <div className="sidebar-icon">👥</div>
          <p>{t('nav.users')}</p>
        </NavLink>
        <NavLink to='/admin/permissions' className="sidebar-option">
          <div className="sidebar-icon">🔐</div>
          <p>{t('nav.permissions')}</p>
        </NavLink>
        <NavLink to='/admin/blog' className="sidebar-option">
          <div className="sidebar-icon">📝</div>
          <p>{t('nav.blog')}</p>
        </NavLink>
      
      </div>
    </div>
  )
}

export default Sidebar