import React, { useContext, useState } from 'react'
import { StoreContext } from '../../Context/StoreContext'
import CartPopup from '../CartPopup/CartPopup'
import './FloatingCartBtn.css'

const FloatingCartBtn = () => {
  const { cartItems, getTotalCartAmount, isMobileMenuOpen, food_list } = useContext(StoreContext)
  const [showCartPopup, setShowCartPopup] = useState(false)

  const getTotalCartItems = () => {
    let totalItems = 0
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        totalItems += cartItems[item]
      }
    }
    return totalItems
  }

  // Debug logs
  console.log('FloatingCartBtn Debug:', {
    cartItems,
    totalItems: getTotalCartItems(),
    isMobileMenuOpen,
    shouldShow: getTotalCartItems() > 0 && !isMobileMenuOpen,
    totalAmount: getTotalCartAmount(),
    foodListLength: food_list ? food_list.length : 0
  })

  const handleCartClick = () => {
    setShowCartPopup(true)
  }

  const closeCartPopup = () => {
    setShowCartPopup(false)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  // Chỉ hiển thị khi có items trong cart và mobile menu không mở
  if (getTotalCartItems() === 0) {
    return null
  }

  return (
    <>
      <button 
        className="floating-cart-btn"
        onClick={handleCartClick}
      >
        <div className="cart-icon">
          🛒
        </div>
        <div className="cart-info">
          <span className="cart-count">{getTotalCartItems()}</span>
          <span className="cart-total">{formatPrice(getTotalCartAmount())}</span>
        </div>
      </button>

      {/* Cart Popup */}
      {showCartPopup && (
        <CartPopup 
          onClose={closeCartPopup}
        />
      )}
    </>
  )
}

export default FloatingCartBtn
