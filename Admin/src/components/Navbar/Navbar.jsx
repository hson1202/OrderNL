import React from 'react'
import './Navbar.css'
import {assets} from '../../assets/assets'
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import '../../i18n'

const Navbar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setIsAuthenticated(false);
    navigate('/admin/login');
  };

  return (
    <div className='navbar'>
        <div className="navbar-logo">
          <h1>ORDER</h1>
        </div>
        <div className="navbar-right">
          <LanguageSwitcher />
          <div className="profile-section">
            <img className='profile' src={assets.profile_image} alt="" />
            <button onClick={handleLogout} className="logout-btn">
              🚪 {t('nav.logout')}
            </button>
          </div>
        </div>
    </div>
  )
}

export default Navbar