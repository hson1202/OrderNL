import React, { useContext, useEffect, useState } from 'react'
import { StoreContext } from '../../Context/StoreContext.jsx';
import axios from 'axios';
import { assets } from '../../assets/assets';
import './MyOrders.css'

const MyOrders = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showGuestForm, setShowGuestForm] = useState(false);
    const [guestForm, setGuestForm] = useState({
        trackingCode: '',
        phone: ''
    });
    const { url, token, setToken, debugToken } = useContext(StoreContext);
    
    // Refresh token from localStorage if context token is empty
    const refreshToken = () => {
        const localToken = localStorage.getItem("token");
        if (localToken && !token) {
            console.log('🔄 Refreshing token from localStorage:', localToken);
            setToken(localToken);
            return localToken;
        }
        return token;
    }

    // Force refresh token from localStorage
    const forceRefreshToken = () => {
        const localToken = localStorage.getItem("token");
        console.log('🔄 Force refreshing token from localStorage:', localToken);
        if (localToken) {
            setToken(localToken);
            return localToken;
        }
        return null;
    }

    // Check if user is logged in
    const isUserLoggedIn = () => {
        const localToken = localStorage.getItem("token");
        const contextToken = token;
        console.log('🔍 Checking user login status:');
        console.log('🔍 - Token in localStorage:', !!localToken);
        console.log('🔍 - Token in context:', !!contextToken);
        console.log('🔍 - Tokens match:', localToken === contextToken);
        return !!(localToken || contextToken);
    }

    // Check token validity by making a test request
    const checkTokenValidity = async () => {
        const currentToken = token || localStorage.getItem("token");
        if (!currentToken) {
            console.log('❌ No token available to check');
            return false;
        }

        try {
            console.log('🔍 Checking token validity...');
            const response = await axios.post(url + "/api/order/userorders", {}, { 
                headers: { token: currentToken } 
            });
            
            if (response.data.success) {
                console.log('✅ Token is valid');
                return true;
            } else {
                console.log('❌ Token is invalid:', response.data.message);
                return false;
            }
        } catch (error) {
            console.log('❌ Error checking token validity:', error.response?.data);
            return false;
        }
    }

    // Check if there are any orders in the system
    const checkSystemOrders = async () => {
        try {
            console.log('🔍 Checking system orders...');
            // This would require an admin endpoint, but for now let's just log
            console.log('🔍 Note: This would require admin access to check all orders');
            console.log('🔍 Current user orders:', data);
            console.log('🔍 Data length:', data.length);
        } catch (error) {
            console.log('❌ Error checking system orders:', error);
        }
    }

    // Fetch orders for registered users
    const fetchUserOrders = async () => {
        try {
            setLoading(true);
            const currentToken = refreshToken();
            console.log('🔍 Fetching user orders with token:', currentToken);
            console.log('🔍 Request URL:', url + "/api/order/userorders");
            
            const response = await axios.post(url + "/api/order/userorders", {}, { 
                headers: { token: currentToken } 
            });
            
            console.log('✅ User orders response:', response.data);
            
            if (response.data.success) {
                setData(response.data.data);
                console.log('✅ User orders data set:', response.data.data);
            } else {
                console.log('❌ User orders failed:', response.data.message);
                setData([]);
            }
        } catch (error) {
            console.error('❌ Error fetching user orders:', error);
            console.error('❌ Error response:', error.response?.data);
            setData([]);
        } finally {
            setLoading(false);
        }
    }

    // Fetch orders for guest users
    const fetchGuestOrders = async () => {
        try {
            setLoading(true);
            
            // Nếu có tracking code, tìm order cụ thể
            if (guestForm.trackingCode) {
                const response = await axios.post(url + "/api/order/track", {
                    trackingCode: guestForm.trackingCode,
                    phone: guestForm.phone
                });
                
                if (response.data.success && response.data.data) {
                    // Convert single order to array format
                    setData([response.data.data]);
                    console.log('Guest order by tracking code:', response.data.data);
                } else {
                    setData([]);
                    alert('Không tìm thấy đơn hàng với mã tracking và số điện thoại này');
                }
            } else {
                // Nếu không có tracking code, tìm tất cả orders của phone number
                const response = await axios.post(url + "/api/order/track", {
                    phone: guestForm.phone
                });
                
                if (response.data.success && response.data.data) {
                    setData(response.data.data);
                    console.log('Guest orders by phone:', response.data.data);
                } else {
                    setData([]);
                    alert('Không tìm thấy đơn hàng nào với số điện thoại này');
                }
            }
        } catch (error) {
            console.error('Error fetching guest order:', error);
            setData([]);
            alert('Có lỗi xảy ra khi tìm kiếm đơn hàng');
        } finally {
            setLoading(false);
        }
    }

    // Handle guest form submission
    const handleGuestSubmit = (e) => {
        e.preventDefault();
        if (!guestForm.phone) {
            alert('Vui lòng nhập số điện thoại để tìm kiếm đơn hàng');
            return;
        }
        fetchGuestOrders();
    }

    // Handle guest form input changes
    const handleGuestFormChange = (e) => {
        setGuestForm({
            ...guestForm,
            [e.target.name]: e.target.value
        });
    }

    useEffect(() => {
        console.log('🔄 MyOrders useEffect triggered');
        console.log('🔄 Token exists:', !!token);
        console.log('🔄 Token value:', token);
        
        // Try to refresh token if context token is empty
        const currentToken = refreshToken();
        console.log('🔄 Current token after refresh:', currentToken);
        
        if (currentToken) {
            // Registered user - fetch their orders
            console.log('👤 Registered user detected, fetching orders...');
            fetchUserOrders();
        } else {
            // Guest user - show form to search orders
            console.log('👥 Guest user detected, showing search form...');
            setShowGuestForm(true);
        }
    }, [token])

    // Additional useEffect to monitor localStorage changes
    useEffect(() => {
        const handleStorageChange = () => {
            const localToken = localStorage.getItem("token");
            console.log('🔄 localStorage changed, new token:', localToken);
            if (localToken && localToken !== token) {
                console.log('🔄 Updating token from localStorage change');
                setToken(localToken);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        // Also check periodically for token changes
        const interval = setInterval(() => {
            const localToken = localStorage.getItem("token");
            if (localToken && localToken !== token) {
                console.log('🔄 Token updated from localStorage check');
                setToken(localToken);
            }
        }, 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [token, setToken]);

    return (
        <div className='my-orders'>
            <h2>My Orders</h2>
            
            {/* Debug Button */}
           
            
            {/* Guest User Form */}
            {!token && showGuestForm && (
                <div className="guest-order-form">
                    <h3>Tra cứu đơn hàng của bạn</h3>
                    <p>Nhập số điện thoại để xem tất cả đơn hàng, hoặc thêm mã tracking để tìm đơn hàng cụ thể</p>
                    <form onSubmit={handleGuestSubmit}>
                        <div className="form-group">
                            <input
                                type="text"
                                name="trackingCode"
                                placeholder="Mã tracking (VD: AB123456) - Không bắt buộc"
                                value={guestForm.trackingCode}
                                onChange={handleGuestFormChange}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Số điện thoại"
                                value={guestForm.phone}
                                onChange={handleGuestFormChange}
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Đang tìm...' : 'Tìm đơn hàng'}
                        </button>
                    </form>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Đang tải đơn hàng...</p>
                </div>
            )}

            {/* Orders Display */}
            <div className="container">
                {data.length > 0 ? (
                    data.map((order, index) => (
                        <div key={index} className='my-orders-order'>
                            <img src={assets.parcel_icon} alt="" />
                            <div className="order-info">
                                <p className="order-items">
                                    {order.items.map((item, idx) => (
                                        <span key={idx}>
                                            {item.name} x {item.quantity}
                                            {idx < order.items.length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                </p>
                                <p className="order-amount">€{order.amount}.00</p>
                                <p className="order-items-count">Items: {order.items.length}</p>
                                <p className="order-status">
                                    <span>&#x25cf;</span> <b>{order.status}</b>
                                </p>
                                <p className="order-date">
                                    Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                </p>
                                {order.trackingCode && (
                                    <p className="tracking-code">
                                        Mã tracking: <strong>{order.trackingCode}</strong>
                                    </p>
                                )}
                            </div>
                            <div className="order-actions">
                                <button onClick={() => window.location.href = '/track-order'}>
                                    Track Order
                                </button>
                                {!token && (
                                    <button onClick={() => setShowGuestForm(true)}>
                                        Tìm đơn hàng khác
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    !loading && (
                        <div className="no-orders">
                            <p>Không có đơn hàng nào</p>
                            {!token && (
                                <button onClick={() => setShowGuestForm(true)}>
                                    Tìm đơn hàng khác
                                </button>
                            )}
                        </div>
                    )
                )}
            </div>
        </div>
    )
}

export default MyOrders