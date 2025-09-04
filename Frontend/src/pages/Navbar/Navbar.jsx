import React, { useContext, useState, useEffect } from 'react'
import './Navbar.css'
import {assets} from '../../assets/assets'
import {Link, useNavigate, useLocation} from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher'


const Navbar = ({setShowLogin}) => {
    
    const { t } = useTranslation();
    const [menu,setMenu]=useState("menu");
    const {token,setToken, isMobileMenuOpen, setIsMobileMenuOpen}=useContext(StoreContext);
    const location = useLocation();
    
    const navigate = useNavigate();
    const logout =()=>{
        localStorage.removeItem("token");
        setToken("");
        navigate("/");
        setIsMobileMenuOpen(false);
    }

    // Update active menu based on current location
    useEffect(() => {
        const path = location.pathname;
        if (path === '/' || path === '/menu') setMenu("menu");
        else if (path === '/about') setMenu("about");
        // else if (path === '/blog') setMenu("blog");
        else if (path === '/contact') setMenu("contact");
        else if (path === '/reservation') setMenu("reservation");
        else if (path === '/track-order') setMenu("track");
        else setMenu("");
    }, [location]);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobileMenuOpen && !event.target.closest('.navbar')) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isMobileMenuOpen]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleNavLinkClick = (menuItem) => {
        setMenu(menuItem);
        setIsMobileMenuOpen(false);
    };

    const handleLoginClick = () => {
        setShowLogin(true);
        setIsMobileMenuOpen(false);
    };
  
    return (

        <div className='navbar'>
            <Link to='/' onClick={() => handleNavLinkClick("menu")} className='logo-text'>
                ORDER
            </Link>

            {/* Mobile center language switcher */}
            <div className="mobile-lang-center">
                <LanguageSwitcher />
            </div>

            {/* Desktop Menu */}
            <ul className='navbar-menu desktop-menu'>
                <Link to='/' onClick={()=>setMenu("menu")} className={menu==="menu"?"active":""}>{t('nav.menu')}</Link>
                <Link to='/about' onClick={()=>setMenu("about")} className={menu==="about"?"active":""}>{t('nav.about')}</Link>
                {/* <Link to='/blog' onClick={()=>setMenu("blog")} className={menu==="blog"?"active":""}>{t('nav.blog')}</Link> */}
                <Link to='/contact' onClick={()=>setMenu("contact")} className={menu==="contact"?"active":""}>{t('nav.contact')}</Link>
                <Link to='/reservation' onClick={()=>setMenu("reservation")} className={menu==="reservation"?"active":""}>{t('nav.booking')}</Link>
                {token && <Link to='/admin' onClick={()=>setMenu("admin")} className={menu==="admin"?"active":""}>Admin</Link>}
            </ul>
            
            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}>
                <ul className='navbar-menu mobile-menu'>
                    <Link to='/' onClick={() => handleNavLinkClick("menu")} className={menu==="menu"?"active":""}>{t('nav.menu')}</Link>
                    <Link to='/about' onClick={() => handleNavLinkClick("about")} className={menu==="about"?"active":""}>{t('nav.about')}</Link>
                    {/* <Link to='/blog' onClick={() => handleNavLinkClick("blog")} className={menu==="blog"?"active":""}>{t('nav.blog')}</Link> */}
                    <Link to='/contact' onClick={() => handleNavLinkClick("contact")} className={menu==="contact"?"active":""}>{t('nav.contact')}</Link>
                    <Link to='/reservation' onClick={() => handleNavLinkClick("reservation")} className={menu==="reservation"?"active":""}>{t('nav.booking')}</Link>
                    
                    {/* Account Section in Mobile Menu */}
                    <div className="mobile-account-section">
                        <div className="mobile-account-divider"></div>
                        <div className="mobile-account-title">{t('nav.account')}</div>
                        
                        {!token ? (
                            <button onClick={handleLoginClick} className="mobile-login-btn">
                                {t('common.login')}
                            </button>
                        ) : (
                            <div className="mobile-account-options">
                                <button 
                                    onClick={() => {
                                        navigate('/myorders');
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="mobile-account-btn"
                                >
                                    <img src={assets.bag_icon} alt="" />
                                    <span>{t('nav.myOrders')}</span>
                                </button>
                                <button onClick={logout} className="mobile-account-btn">
                                    <img src={assets.logout_icon} alt="" />
                                    <span>{t('common.logout')}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </ul>
            </div>
        
            <div className="navbar-right">
                {/* Desktop language switcher */}
                <LanguageSwitcher />
                {/* Desktop Login Button - Hidden on Mobile */}
                {!token ? (
                    <button onClick={()=>setShowLogin(true)} className="login-btn desktop-login-btn">
                        {t('common.login')}
                    </button>
                ) : (
                    <div className="navbar-profile desktop-profile">
                        <img src={assets.profile_icon} alt=''></img>
                        <ul className="nav-profile-dropdown">
                            <li onClick={()=>{navigate('/myorders'); setIsMobileMenuOpen(false);}}>
                                <img src={assets.bag_icon} alt="" />
                                <p>{t('nav.myOrders')}</p>
                            </li>
                            <hr />
                            <li onClick={logout}>
                                <img src={assets.logout_icon} alt="" />
                                <p>{t('common.logout')}</p>
                            </li>
                        </ul>
                    </div>
                )}

                {/* Hamburger Menu Button - stays on the far right on mobile */}
                <button 
                    className={`hamburger-menu ${isMobileMenuOpen ? 'active' : ''}`}
                    onClick={toggleMobileMenu}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </div>
  )
}

export default Navbar