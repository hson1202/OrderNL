import React, { useState, useEffect, useCallback } from 'react';
import './Orders.css'
import {toast} from "react-toastify"
import axios from "axios"
import {assets} from "../../assets/assets"
import { useTranslation } from 'react-i18next'
import '../../i18n'
import config from '../../config/config'

const Orders = ({url}) => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true); // Auto-refresh toggle
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds default
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAllOrders = async (showLoadingToast = false) => {
    try {
      if (showLoadingToast) {
        toast.info('🔄 Đang tải lại orders...', { autoClose: 1000 })
      }
      
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        toast.error('Admin token not found. Please login again.');
        return;
      }

      const response = await axios.get(`${config.BACKEND_URL}/api/admin/orders`, {
        headers: {
          'token': adminToken
        }
      });

      if (response.status === 200) {
        const newOrders = response.data;
        
        // Check if there are new orders (only for auto-refresh, not manual refresh)
        if (!showLoadingToast && orders.length > 0 && newOrders.length > orders.length) {
          const newOrderCount = newOrders.length - orders.length;
          toast.success(`🆕 ${newOrderCount} new order${newOrderCount > 1 ? 's' : ''} received!`);
        }
        
        if (showLoadingToast) {
          toast.success(`✅ Đã tải lại ${newOrders.length} orders`, { autoClose: 2000 })
        }
        
        // Sort orders: Pending first, then by creation date
        const sortedOrders = newOrders.sort((a, b) => {
          // Pending orders first
          if (a.status === 'Pending' && b.status !== 'Pending') return -1;
          if (a.status !== 'Pending' && b.status === 'Pending') return 1;
          
          // Then by creation date (newest first)
          const dateA = new Date(a.createdAt || a.date || 0);
          const dateB = new Date(b.createdAt || b.date || 0);
          return dateB - dateA;
        });
        
        setOrders(sortedOrders);
        setLoading(false);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('adminToken');
      } else {
        toast.error('Error fetching orders: ' + (error.response?.data?.message || error.message));
      }
      setLoading(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      console.log(`🔄 Updating order ${orderId} status to: ${event.target.value}`);
      
      // Get admin token from localStorage
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        toast.error('Admin not logged in. Please login again.');
        return;
      }
      
      // Use the admin endpoint with auth token
      const response = await axios.put(`${config.BACKEND_URL}/api/admin/orders/${orderId}/status`, {
        status: event.target.value
      }, {
        headers: {
          'token': adminToken
        }
      });
      
      console.log('📦 Status update response:', response.data);
      
      if (response.data.success){
        await fetchAllOrders();
        toast.success(t('orders.statusUpdateSuccess', 'Order status updated successfully'));
      } else {
        toast.error(response.data.message || t('orders.statusUpdateError', 'Failed to update order status'));
      }
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response,
        request: error.request
      });
      
      if (error.response) {
        if (error.response.status === 401) {
          toast.error('Admin session expired. Please login again.');
          localStorage.removeItem('adminToken');
        } else {
          toast.error(`Failed to update order status: ${error.response.data?.message || error.message}`);
        }
      } else if (error.request) {
        toast.error('No response received. Check if backend is running.');
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  }

  // Filter orders based on search term and status
  useEffect(() => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo?.phone?.includes(searchTerm) ||
        order.customerInfo?.restaurant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shortOrderId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, selectedStatus]);

  useEffect(()=>{
    fetchAllOrders();
  },[])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#f59e0b';
      case 'Out for delivery':
        return '#3b82f6';
      case 'Delivered':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusCount = (status) => {
    return orders.filter(order => order.status === status).length;
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
  }

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  }

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setShowDetailsModal(false);
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className='orders-page'>
      <div className="orders-header">
        <div className="header-content">
          <h1>{t('orders.title')}</h1>
          <p>{t('orders.subtitle', 'Manage and track all customer orders')}</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={() => fetchAllOrders(true)}>
            <span>🔄</span> {t('common.refresh') || 'Refresh'}
          </button>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="order-stats">
        <div className="stat-card">
          <h3>{orders.length}</h3>
          <p>{t('orders.totalOrders', 'Total Orders')}</p>
        </div>
        <div className="stat-card">
          <h3>{getStatusCount('Pending')}</h3>
          <p>{t('orders.pending', 'Pending')}</p>
        </div>
        <div className="stat-card">
          <h3>{getStatusCount('Out for delivery')}</h3>
          <p>{t('orders.outForDelivery', 'Out for Delivery')}</p>
        </div>
        <div className="stat-card">
          <h3>{getStatusCount('Delivered')}</h3>
          <p>{t('orders.delivered', 'Delivered')}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="orders-controls">
        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder={t('orders.searchPlaceholder', 'Search orders by customer name, phone, or order ID...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={clearSearch} className="clear-search">
                ✕
              </button>
            )}
          </div>
        </div>
        
        <div className="auto-refresh-section">
          <div className="refresh-controls">
            <label className="refresh-toggle">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <span className="toggle-label">🔄 Auto-refresh</span>
            </label>
            
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="refresh-interval-select"
              >
                <option value={15000}>15s</option>
                <option value={30000}>30s</option>
                <option value={60000}>1m</option>
                <option value={300000}>5m</option>
              </select>
            )}
            
            <button 
              onClick={() => {
                fetchAllOrders();
                setLastRefresh(new Date());
              }}
              className="manual-refresh-btn"
              title="Refresh now"
            >
              🔄
            </button>
          </div>
          
          <div className="last-refresh-info">
            <small>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </small>
          </div>
        </div>
        
        <div className="filter-section">
          <div className="status-tabs">
            <button 
              className={`status-tab ${selectedStatus === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('all')}
            >
              {t('orders.allStatuses', 'All Statuses')}
            </button>
            <button 
              className={`status-tab ${selectedStatus === 'Pending' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('Pending')}
            >
              {t('orders.pending', 'Pending')}
            </button>
            <button 
              className={`status-tab ${selectedStatus === 'Out for delivery' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('Out for delivery')}
            >
              {t('orders.outForDelivery', 'Out for Delivery')}
            </button>
            <button 
              className={`status-tab ${selectedStatus === 'Delivered' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('Delivered')}
            >
              {t('orders.delivered', 'Delivered')}
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <p>{t('orders.noOrders', 'No orders found')}</p>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>{t('orders.orderId')}: #{order.shortOrderId || (order._id ? order._id.slice(-6) : 'N/A')}</h3>
                    <p className="order-date">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="order-type">
                      
                      {order.orderType === 'guest' && (
                        <span className="guest-note">GUEST</span>
                      )}
                      {order.orderType === 'registered' && order.userId && (
                        <span className="user-note">
                          👤 {order.customerInfo?.name || 'Unknown User'} 
                          <small> (ID: {order.userId.slice(-8)})</small>
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="order-status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {t(`orders.orderStatus.${order.status}`, order.status)}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  <h4>{t('orders.items')}</h4>
                  {order.items && Array.isArray(order.items) ? (
                    order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-details">
                          <span className="item-name">{item.name || 'Unknown Item'}</span>
                          <span className="item-sku">SKU: {item.sku || 'N/A'}</span>
                        </div>
                        <div className="item-quantity-price">
                          <span className="item-quantity">x{item.quantity || 1}</span>
                          <span className="item-price">€{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No items found</p>
                  )}
                </div>
                
                {/* Additional order info */}
                <div className="order-additional-info">
                  <div className="info-row">
                    <span className="info-label">{t('orders.trackingCode', 'Tracking Code')}:</span>
                    <span className="info-value tracking-code">{order.trackingCode || 'N/A'}</span>
                  </div>
                  {order.notes && (
                    <div className="info-row">
                      <span className="info-label">{t('orders.notes', 'Notes')}:</span>
                      <span className="info-value notes">{order.notes}</span>
                    </div>
                  )}
                </div>

                <div className="order-summary">
                  <div className="order-total">
                    <span className="total-label">{t('orders.total', 'Total Amount')}:</span>
                    <span className="total-amount">€{order.amount || 0}</span>
                  </div>
                  <div className="order-actions">
                    <button className="view-details-btn" onClick={() => showOrderDetails(order)}>
                      {t('orders.viewDetails', 'View Details')}
                    </button>
                    <select
                      value={order.status}
                      onChange={(e) => statusHandler(e, order._id)}
                      className="status-select"
                    >
                      <option value="Pending">{t('orders.pending', 'Pending')}</option>
                      <option value="Out for delivery">{t('orders.outForDelivery', 'Out for Delivery')}</option>
                      <option value="Delivered">{t('orders.delivered', 'Delivered')}</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="modal-overlay" onClick={closeOrderDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('orders.orderDetails', 'Order Details')}</h2>
              <button className="modal-close" onClick={closeOrderDetails}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3>{t('orders.orderInfo', 'Order Information')}</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">{t('orders.orderId')}:</span>
                    <span className="detail-value">#{selectedOrder.shortOrderId || (selectedOrder._id ? selectedOrder._id.slice(-6) : 'N/A')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('orders.orderDate', 'Order Date')}:</span>
                    <span className="detail-value">
                      {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('orders.status')}:</span>
                    <span 
                      className="detail-value status-badge"
                      style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                    >
                      {t(`orders.orderStatus.${selectedOrder.status}`, selectedOrder.status)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('orders.orderType', 'Order Type')}:</span>
                    <span className="detail-value">
                      <span className={`order-type-badge ${selectedOrder.orderType === 'guest' ? 'guest' : 'registered'}`}>
                        {selectedOrder.orderType === 'guest' ? 'GUEST' : 'USER'}
                      </span>
                      {selectedOrder.orderType === 'guest' && (
                        <span className="guest-note">💡 Khách không đăng nhập</span>
                      )}
                      {selectedOrder.orderType === 'registered' && selectedOrder.userId && (
                        <span className="guest-note">
                          👤 {selectedOrder.customerInfo?.name || 'Unknown User'} 
                          <small> (ID: {selectedOrder.userId.slice(-8)})</small>
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('orders.trackingCode', 'Tracking Code')}:</span>
                    <span className="detail-value">{selectedOrder.trackingCode || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('orders.total')}:</span>
                    <span className="detail-value total-amount">€{selectedOrder.amount || 0}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>
                  {selectedOrder.orderType === 'guest' ? t('orders.guestInfo', 'Guest Information') : t('orders.userInfo', 'User Information')}
                </h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">{t('orders.customerName', 'Name')}:</span>
                    <span className="detail-value">
                      {selectedOrder.customerInfo?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('orders.phone')}:</span>
                    <span className="detail-value">{selectedOrder.customerInfo?.phone || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Nhà hàng:</span>
                    <span className="detail-value">{selectedOrder.customerInfo?.restaurant || 'N/A'}</span>
                  </div>
                  {selectedOrder.orderType === 'guest' && selectedOrder.customerInfo?.email && (
                    <div className="detail-item">
                      <span className="detail-label">{t('orders.email', 'Email')}:</span>
                      <span className="detail-value">{selectedOrder.customerInfo.email}</span>
                    </div>
                  )}
                  {selectedOrder.orderType === 'registered' && selectedOrder.userId && (
                    <div className="detail-item">
                      <span className="detail-label">{t('orders.userId', 'User')}:</span>
                      <span className="detail-value">
                        {selectedOrder.customerInfo?.name || 'Unknown User'}
                        <br />
                        <small>(ID: {selectedOrder.userId.slice(-8)})</small>
                      </span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">{t('orders.address')}:</span>
                    <span className="detail-value">
                      {selectedOrder.address?.street ? `${selectedOrder.address.street}, ${selectedOrder.address.city || ''}` : 'N/A'}
                    </span>
                  </div>
                  {selectedOrder.address?.state && (
                    <div className="detail-item">
                      <span className="detail-label">{t('orders.state', 'State')}:</span>
                      <span className="detail-value">{selectedOrder.address.state}</span>
                    </div>
                  )}
                  {selectedOrder.address?.zipcode && (
                    <div className="detail-item">
                      <span className="detail-label">{t('orders.zipcode', 'Postal Code')}:</span>
                      <span className="detail-value">{selectedOrder.address.zipcode}</span>
                    </div>
                  )}
                  {selectedOrder.address?.country && (
                    <div className="detail-item">
                      <span className="detail-label">{t('orders.country', 'Country')}:</span>
                      <span className="detail-value">{selectedOrder.address.country}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>{t('orders.items')}</h3>
                <div className="modal-items">
                  {selectedOrder.items && Array.isArray(selectedOrder.items) ? (
                    selectedOrder.items.map((item, index) => (
                      <div key={index} className="modal-item">
                        <div className="modal-item-info">
                          <span className="modal-item-name">{item.name || 'Unknown Item'}</span>
                          <span className="modal-item-sku">SKU: {item.sku || 'N/A'}</span>
                        </div>
                        <div className="modal-item-quantity-price">
                          <span className="modal-item-quantity">x{item.quantity || 1}</span>
                          <span className="modal-item-price">€{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No items found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;