import React, { useState, useEffect, useContext } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SuccessPopup from '../../components/SuccessPopup/SuccessPopup'
import '../../i18n'

const PlaceOrder = () => {
  const { t } = useTranslation();
  const { getTotalCartAmount, token, food_list, cartItems, url, setCartItems } = useContext(StoreContext);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
    restaurant: ""
  })
  const [orderType, setOrderType] = useState(token ? 'registered' : 'guest'); // Tự động set 'registered' nếu đã login
  const [trackingCode, setTrackingCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState({});

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }))
  }

  const placeOrder = async (event) => {
    event.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.street || !data.city || !data.state || !data.zipcode || !data.country || !data.phone || !data.restaurant) {
      alert('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    // Validate phone number - minimum 10 digits, maximum unlimited
    if (data.phone.length < 10) {
      alert('Please enter a valid phone number (minimum 10 digits)');
      setIsSubmitting(false);
      return;
    }
    
    // Remove any non-digit characters for validation
    const phoneDigits = data.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      alert('Please enter a valid phone number (minimum 10 digits)');
      setIsSubmitting(false);
      return;
    }
    
    let orderItems = [];
    food_list.map((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = item;
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo)
      }
    })

    // Check if cart is empty
    if (orderItems.length === 0) {
      alert('Your cart is empty. Please add some items first.');
      setIsSubmitting(false);
      return;
    }

    // Tạo thông tin khách hàng
    const customerInfo = {
      name: `${data.firstName} ${data.lastName}`,
      phone: data.phone,
      email: data.email || undefined
    };

    let orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + 2,
      customerInfo: customerInfo,
      orderType: orderType
    };

    // Thêm userId nếu user đã đăng nhập
    if (token) {
      orderData.userId = token;
    }

    try {
      console.log('Sending order data:', orderData);
      
      let response = await axios.post(url + "/api/order/place", orderData, {
        headers: token ? { token } : {}
      });

      console.log('Response:', response.data);

      if (response.data.success) {
        const { trackingCode, message } = response.data;
        
        // Lưu mã tracking vào localStorage để hiển thị sau khi đặt hàng
        if (trackingCode) {
          localStorage.setItem('lastTrackingCode', trackingCode);
          localStorage.setItem('lastPhone', data.phone);
        }
        
        // Tính toán số tiền trước khi xóa cart
        const finalAmount = getTotalCartAmount() + 2;
        
        // Hiển thị popup thành công
        setOrderSuccessData({
          trackingCode: trackingCode,
          phone: data.phone,
          orderAmount: finalAmount
        });
        
        console.log('Setting popup data:', {
          trackingCode: trackingCode,
          phone: data.phone,
          orderAmount: finalAmount
        });
        
        setShowSuccessPopup(true);
        console.log('Setting showSuccessPopup to true');
        
        // Không xóa cart ngay lập tức, để popup hiển thị trước
        // Cart sẽ được xóa khi user đóng popup
      } else {
        alert(`❌ Order failed: ${response.data.message || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      
      let errorMessage = 'An error occurred while placing your order.';
      
      if (error.response) {
        // Server responded with error
        console.log('Error response:', error.response.data);
        errorMessage = error.response.data.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error: Unable to connect to server. Please check your internet connection.';
      } else {
        // Other error
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const navigate = useNavigate();

  useEffect(() => {
    if (getTotalCartAmount() === 0 && !showSuccessPopup) {
      navigate('/')
    }
  }, [getTotalCartAmount, navigate, showSuccessPopup])

  // Auto-focus first input on mobile
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      const firstInput = document.querySelector('.place-order input');
      if (firstInput) {
        firstInput.focus();
      }
    }
  }, []);

  // Debug popup state changes
  useEffect(() => {
    console.log('showSuccessPopup changed to:', showSuccessPopup);
    console.log('orderSuccessData changed to:', orderSuccessData);
  }, [showSuccessPopup, orderSuccessData]);


  
  return (
    <>
      <form onSubmit={placeOrder} className="place-order">
        <div className="place-order-left">
          <p className="title">{t('placeOrder.title')}</p>
          
                    {/* Order Type Selection - Chỉ hiển thị khi chưa login */}
          {!token && (
            <div className="order-type-section">
              <h3>{t('placeOrder.orderType.title')}</h3>
              <div className="order-type-options">
                <label className="order-type-option">
                  <input
                    type="radio"
                    name="orderType"
                    value="guest"
                    checked={orderType === 'guest'}
                    onChange={(e) => setOrderType(e.target.value)}
                  />
                  <span>{t('placeOrder.orderType.guest')}</span>
                </label>
              </div>
            </div>
          )}

          <div className="multi-fields">
            <input 
              required 
              name='firstName' 
              onChange={onChangeHandler} 
              value={data.firstName} 
              type="text" 
              placeholder={t('placeOrder.form.firstName')}
              autoComplete="given-name"
            />
            <input 
              required 
              name='lastName' 
              onChange={onChangeHandler} 
              value={data.lastName} 
              type="text" 
              placeholder={t('placeOrder.form.lastName')}
              autoComplete="family-name"
            />
          </div>
          <input 
            name='email' 
            onChange={onChangeHandler} 
            value={data.email} 
            type="email" 
            placeholder={t('placeOrder.form.email')}
            autoComplete="email"
          />
          <input 
            required 
            name='street' 
            onChange={onChangeHandler} 
            value={data.street} 
            type="text" 
            placeholder={t('placeOrder.form.street')}
            autoComplete="street-address"
          />
          <div className="multi-fields">
            <input 
              required 
              name='city' 
              onChange={onChangeHandler} 
              value={data.city} 
              type="text" 
              placeholder={t('placeOrder.form.city')}
              autoComplete="address-level2"
            />
            <input 
              required 
              name='state' 
              onChange={onChangeHandler} 
              value={data.state} 
              type="text" 
              placeholder={t('placeOrder.form.state')}
              autoComplete="address-level1"
            />
          </div>
          <div className="multi-fields">
            <input 
              required 
              name='zipcode' 
              onChange={onChangeHandler} 
              value={data.zipcode} 
              type="text" 
              placeholder={t('placeOrder.form.zipcode')}
              autoComplete="postal-code"
            />
            <input 
              required 
              name='country' 
              onChange={onChangeHandler} 
              value={data.country} 
              type="text" 
              placeholder={t('placeOrder.form.country')}
              autoComplete="country-name"
            />
          </div>
          <input 
            required 
            name='phone' 
            onChange={onChangeHandler} 
            value={data.phone} 
            type="tel" 
            placeholder={t('placeOrder.form.phone')}
            pattern="[0-9]{10,20}"
            title="Please enter a valid phone number (at least 10 digits, maximum unlimited)"
            autoComplete="tel"
            maxLength="20"
          />
          <input 
            required 
            name='restaurant' 
            onChange={onChangeHandler} 
            value={data.restaurant} 
            type="text" 
            placeholder="Tên nhà hàng của bạn"
            autoComplete="organization"
          />
          
          {/* Thông báo về dò đơn hàng */}
          <div className="tracking-notice">
            <p>💡 <strong>{t('placeOrder.notice.title')}:</strong> {t('placeOrder.notice.message')}</p>
          </div>
          
          {/* Mobile-friendly submit button for form */}
          <div className="mobile-submit-section">
            <button 
              type='submit' 
              className="mobile-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? '🔄 Đang xử lý...' : '✅ Đặt hàng ngay'}
            </button>
          </div>
        </div>
        
        <div className="place-order-right">
          <div className="cart-total">
            <h2>{t('placeOrder.cart.title')}</h2>
            <div>
              <div className='cart-total-details'>
                <p>{t('placeOrder.cart.subtotal')}</p>
                <p>€{getTotalCartAmount()}</p>
              </div>
              <hr />
              <div className='cart-total-details'>
                <p>{t('placeOrder.cart.deliveryFee')}</p>
                <p>€{getTotalCartAmount() === 0 ? 0 : 2}</p>
              </div>
              <hr />
              <div className='cart-total-details'>
                <b>{t('placeOrder.cart.total')}</b>
                <b>€{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
              </div>
            </div>
            <button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Placing Order...' : t('placeOrder.cart.proceedButton')}
            </button>
          </div>
        </div>
      </form>
      
      {/* Success Popup */}
      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        trackingCode={orderSuccessData.trackingCode}
        phone={orderSuccessData.phone}
        orderAmount={orderSuccessData.orderAmount}
        setCartItems={setCartItems}
      />
    </>
  );
};

export default PlaceOrder;