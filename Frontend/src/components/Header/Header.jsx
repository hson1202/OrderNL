import React from 'react'
import './Header.css'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <div className='header'>
        <div className='header-contents'>
            <h2>Order your favourite food here</h2>
            <p>Choose from a diverse menu featuring a delectable array of dishes crafted with the finest ingredients and culinary expertise.Our mission is to satisfy your carvings and elevate your dining experience, one delicious meal at a time.</p>
            <div className="header-buttons">
              <Link to='/menu'>
                <button className="view-menu-btn">View Menu</button>
              </Link>
              <Link to='/reservation'>
                <button className="booking-btn">Book a Table</button>
              </Link>
            </div>
        </div>
    </div>
  )
}

export default Header;