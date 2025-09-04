import React, { useState, useEffect, useCallback } from 'react'
import './Dashboard.css'
import axios from 'axios'
import { useTranslation } from 'react-i18next';
import '../../i18n';
import config from '../../config/config';

// Configure axios defaults
axios.defaults.timeout = 10000;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const Dashboard = ({ url }) => {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalUsers: 0,
    totalProducts: 0
  })
  const [timeStats, setTimeStats] = useState({
    today: { orders: 0, revenue: 0 },
    week: { orders: 0, revenue: 0 },
    month: { orders: 0, revenue: 0 },
    quarter: { orders: 0, revenue: 0 },
    year: { orders: 0, revenue: 0 }
  })

  const [isLoading, setIsLoading] = useState(true)
  const [trends, setTrends] = useState({
    orders: 0,
    revenue: 0,
    users: 0,
    products: 0,
    completed: 0
  })


  useEffect(() => {
    console.log('🚀 Dashboard component mounted')
    console.log('🔗 Backend URL:', url)
    fetchDashboardData()
  }, [])

  // Calculate trends based on current vs previous period
  const calculateTrends = (currentStats, previousStats) => {
    const trends = {
      orders: 0,
      revenue: 0,
      users: 0,
      products: 0,
      completed: 0,
      pending: 0
    }

    // Calculate trends for all metrics
    // Orders trend (month over month)
    if (previousStats.lastMonth && previousStats.lastMonth.orders > 0) {
      trends.orders = Math.round(((currentStats.currentMonth.orders - previousStats.lastMonth.orders) / previousStats.lastMonth.orders) * 100)
    } else if (currentStats.currentMonth && currentStats.currentMonth.orders > 0) {
      trends.orders = 100 // New data
    }
    
    // Revenue trend (month over month)
    if (previousStats.lastMonth && previousStats.lastMonth.revenue > 0) {
      trends.revenue = Math.round(((currentStats.currentMonth.revenue - previousStats.lastMonth.revenue) / previousStats.lastMonth.revenue) * 100)
    } else if (currentStats.currentMonth && currentStats.currentMonth.revenue > 0) {
      trends.revenue = 100 // New data
    }
    
    // Users trend (compare with previous month)
    if (previousStats.lastMonth && previousStats.lastMonth.users > 0) {
      trends.users = Math.round(((currentStats.totalUsers - previousStats.lastMonth.users) / previousStats.lastMonth.users) * 100)
    } else if (currentStats.totalUsers > 0) {
      trends.users = 100 // New data
    }
    
    // Products trend (compare with previous month)
    if (previousStats.lastMonth && previousStats.lastMonth.products > 0) {
      trends.products = Math.round(((currentStats.totalProducts - previousStats.lastMonth.products) / previousStats.lastMonth.products) * 100)
    } else if (currentStats.totalProducts > 0) {
      trends.products = 100 // New data
    }
    
    // Completed orders trend (month over month)
    if (previousStats.lastMonth && previousStats.lastMonth.completed > 0) {
      trends.completed = Math.round(((currentStats.completedOrders - previousStats.lastMonth.completed) / previousStats.lastMonth.completed) * 100)
    } else if (currentStats.completedOrders > 0) {
      trends.completed = 100 // New data
    }
    
    // Pending orders trend (month over month)
    if (previousStats.lastMonth && previousStats.lastMonth.pending > 0) {
      trends.pending = Math.round(((currentStats.pendingOrders - previousStats.lastMonth.pending) / previousStats.lastMonth.pending) * 100)
    } else if (currentStats.pendingOrders > 0) {
      trends.pending = 100 // New data
    }

    return trends
  }



  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      console.log('🔍 Fetching dashboard data from:', url)
      console.log('Full URL for stats:', `${config.BACKEND_URL}/api/admin/stats`)
      
      // Test basic connectivity first
      try {
        const testResponse = await axios.get(`${url}/`)
        console.log('✅ Basic connectivity test passed:', testResponse.data)
      } catch (testError) {
        console.error('❌ Basic connectivity test failed:', testError)
        throw new Error('Cannot connect to backend server')
      }
      
      // Get admin token
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        console.error('❌ Admin not logged in. Please login again.');
        alert('Admin not logged in. Please login again.');
        setIsLoading(false);
        return;
      }
      
      // Fetch all data in parallel for better performance
      console.log('🚀 Starting API calls...')
      const [statsResponse, timeResponse] = await Promise.allSettled([
        axios.get(`${config.BACKEND_URL}/api/admin/stats`, { headers: { 'token': adminToken } }),
        axios.get(`${config.BACKEND_URL}/api/admin/time-stats`, { headers: { 'token': adminToken } })
      ])

      console.log('📊 All API calls completed with status:', {
        stats: statsResponse.status,
        time: timeResponse.status
      })

      // Handle stats response
      if (statsResponse.status === 'fulfilled' && statsResponse.value.data) {
        console.log('✅ Stats response:', statsResponse.value.data)
        const currentStats = statsResponse.value.data
        setStats(currentStats)
        
        // Calculate trends using current month vs last month data
        const calculatedTrends = calculateTrends(currentStats, currentStats)
        setTrends(calculatedTrends)
      } else {
        console.error('❌ Stats fetch failed:', statsResponse.reason)
        console.error('❌ Stats error details:', {
          status: statsResponse.status,
          reason: statsResponse.reason,
          response: statsResponse.value
        })
        // Set default stats if API fails
        setStats({
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          completedOrders: 0,
          totalUsers: 0,
          totalProducts: 0
        })
        setTrends({
          orders: 0,
          revenue: 0,
          users: 0,
          products: 0,
          completed: 0
        })
      }

      // Handle time stats response
      if (timeResponse.status === 'fulfilled' && timeResponse.value.data) {
        console.log('✅ Time stats response:', timeResponse.value.data)
        setTimeStats(timeResponse.value.data)
      } else {
        console.error('❌ Time stats fetch failed:', timeResponse.reason)
        console.error('❌ Time stats error details:', {
          status: timeResponse.status,
          reason: timeResponse.reason,
          response: timeResponse.value
        })
        // Set default time stats if API fails
        setTimeStats({
          today: { orders: 0, revenue: 0 },
          week: { orders: 0, revenue: 0 },
          month: { orders: 0, revenue: 0 },
          quarter: { orders: 0, revenue: 0 },
          year: { orders: 0, revenue: 0 }
        })
      }


    } catch (error) {
      console.error('💥 Error fetching dashboard data:', error)
      console.error('💥 Error details:', {
        message: error.message,
        response: error.response,
        request: error.request,
        config: error.config
      })
      
      if (error.response) {
        console.error('💥 Server responded with error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        })
      } else if (error.request) {
        console.error('💥 No response received:', error.request)
      } else {
        console.error('💥 Error setting up request:', error.message)
      }
      
      // Set default data for demo if API fails completely
      setStats({
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalUsers: 0,
        totalProducts: 0
      })
      setTimeStats({
        today: { orders: 0, revenue: 0 },
        week: { orders: 0, revenue: 0 },
        month: { orders: 0, revenue: 0 },
        quarter: { orders: 0, revenue: 0 },
        year: { orders: 0, revenue: 0 }
      })

      setTrends({
        orders: 0,
        revenue: 0,
        users: 0,
        products: 0,
        completed: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date) => {
    try {
      const d = new Date(date || new Date());
      const locale = i18n?.language === 'vi' ? 'vi-VN' : i18n?.language === 'sk' ? 'sk-SK' : 'en-US';
      return new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
    } catch {
      return '';
    }
  }

  const getStatusColor = (status) => {
    if (!status) return '#6B7280';
    
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'completed':
      case 'delivered':
        return '#10B981';
      case 'pending':
      case 'order placed':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      case 'out for delivery':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  if (isLoading) {
    console.log('⏳ Dashboard is loading...')
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    )
  }

  console.log('🎯 Dashboard rendered with data:', { stats, timeStats })

  return (
    <div className='dashboard'>
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1>{t('dashboard.title')} </h1>
            <p>{t('dashboard.subtitle')}</p>

          </div>
          <div className="header-actions">
            <button className="refresh-btn" onClick={() => {
              fetchDashboardData();
            }}>
              <span>🔄</span> {t('common.refresh')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card orders">
          <div className="stat-icon">
            <span>📦</span>
          </div>
          <div className="stat-content">
            <h3>{((stats.currentMonth && stats.currentMonth.orders) || stats.totalOrders || 0).toLocaleString()}</h3>
            <p>{t('dashboard.totalOrders')}</p>
            <div className="stat-details">
              <span className="detail-item">
                <strong>Today:</strong> {timeStats.today?.orders || 0}
              </span>
              <span className="detail-item">
                <strong>Week:</strong> {timeStats.week?.orders || 0}
              </span>
            </div>
            <div className={`stat-trend ${trends.orders > 0 ? 'positive' : trends.orders < 0 ? 'negative' : 'neutral'}`}>
              <span>{trends.orders > 0 ? '↗️' : trends.orders < 0 ? '↘️' : '➡️'}</span>
              {trends.orders !== 0 ? `${trends.orders > 0 ? '+' : ''}${trends.orders}%` : '0%'} {t('dashboard.trendFromLastMonth')}
            </div>
          </div>
        </div>
        
        <div className="stat-card revenue">
          <div className="stat-icon">
            <span>💰</span>
          </div>
          <div className="stat-content">
            <h3>{formatCurrency((stats.currentMonth && stats.currentMonth.revenue) || stats.totalRevenue || 0)}</h3>
            <p>{t('dashboard.totalRevenue')}</p>
            <div className="stat-details">
              <span className="detail-item">
                <strong>Today:</strong> {formatCurrency(timeStats.today?.revenue || 0)}
              </span>
              <span className="detail-item">
                <strong>Week:</strong> {formatCurrency(timeStats.week?.revenue || 0)}
              </span>
            </div>
            <div className={`stat-trend ${trends.revenue > 0 ? 'positive' : trends.revenue < 0 ? 'negative' : 'neutral'}`}>
              <span>{trends.revenue > 0 ? '↗️' : trends.revenue < 0 ? '↘️' : '➡️'}</span>
              {trends.revenue !== 0 ? `${trends.revenue > 0 ? '+' : ''}${trends.revenue}%` : '0%'} {t('dashboard.trendFromLastMonth')}
            </div>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">
            <span>⏳</span>
          </div>
          <div className="stat-content">
            <h3>{stats.pendingOrders || 0}</h3>
            <p>{t('dashboard.pendingOrders')}</p>
            <div className="stat-details">
              <span className="detail-item">
                <strong>Today:</strong> {timeStats.today?.orders || 0}
              </span>
              <span className="detail-item">
                <strong>Priority:</strong> High
              </span>
            </div>
            <div className="stat-trend urgent">
              <span>🚨</span> Requires attention
            </div>
          </div>
        </div>

        <div className="stat-card users">
          <div className="stat-icon">
            <span>👥</span>
          </div>
          <div className="stat-content">
            <h3>{(stats.totalUsers || 0).toLocaleString()}</h3>
            <p>{t('dashboard.totalUsers')}</p>
            <div className="stat-details">
              <span className="detail-item">
                <strong>Active:</strong> {Math.round((stats.totalUsers || 0) * 0.8)}
              </span>
              <span className="detail-item">
                <strong>New:</strong> {Math.round((stats.totalUsers || 0) * 0.1)}
              </span>
            </div>
            <div className={`stat-trend ${trends.users > 0 ? 'positive' : trends.users < 0 ? 'negative' : 'neutral'}`}>
              <span>{trends.users > 0 ? '↗️' : trends.users < 0 ? '↘️' : '➡️'}</span>
              {trends.users !== 0 ? `${trends.users > 0 ? '+' : ''}${trends.users}%` : '0%'} {t('dashboard.trendFromLastMonth')}
            </div>
          </div>
        </div>

        <div className="stat-card products">
          <div className="stat-icon">
            <span>🍽️</span>
          </div>
          <div className="stat-content">
            <h3>{stats.totalProducts || 0}</h3>
            <p>{t('dashboard.totalProducts')}</p>
            <div className="stat-details">
              <span className="detail-item">
                <strong>Active:</strong> {Math.round((stats.totalProducts || 0) * 0.9)}
              </span>
              <span className="detail-item">
                <strong>Categories:</strong> {Math.ceil((stats.totalProducts || 0) / 10)}
              </span>
            </div>
            <div className={`stat-trend ${trends.products > 0 ? 'positive' : trends.products < 0 ? 'negative' : 'neutral'}`}>
              <span>{trends.products > 0 ? '↗️' : trends.products < 0 ? '↘️' : '➡️'}</span>
              {trends.products !== 0 ? `${trends.products > 0 ? '+' : ''}${trends.products}%` : '0%'} {t('dashboard.trendFromLastMonth')}
            </div>
          </div>
        </div>

        <div className="stat-card completed">
          <div className="stat-icon">
            <span>✅</span>
          </div>
          <div className="stat-content">
            <h3>{(stats.completedOrders || 0).toLocaleString()}</h3>
            <p>{t('dashboard.completedOrders')}</p>
            <div className="stat-details">
              <span className="detail-item">
                <strong>Today:</strong> {timeStats.today?.orders || 0}
              </span>
              <span className="detail-item">
                <strong>Rate:</strong> {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
              </span>
            </div>
            <div className={`stat-trend ${trends.completed > 0 ? 'positive' : trends.completed < 0 ? 'negative' : 'neutral'}`}>
              <span>{trends.completed > 0 ? '↗️' : trends.completed < 0 ? '↘️' : '➡️'}</span>
              {trends.completed !== 0 ? `${trends.completed > 0 ? '+' : ''}${trends.completed}%` : '0%'} {t('dashboard.trendFromLastMonth')}
            </div>
          </div>
        </div>
      </div>

      {/* Time-based Stats */}
      <div className="time-stats-section">
        <h2>{t('dashboard.timeStats')}</h2>
        <div className="time-stats-grid">
          <div className="time-stat-card">
            <h3>{t('dashboard.today')}</h3>
            <div className="time-stat-content">
              <div className="stat-item">
                <span className="stat-label">{t('dashboard.orders')}:</span>
                <span className="stat-value">{timeStats.today?.orders || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{t('dashboard.revenue')}:</span>
                <span className="stat-value">{formatCurrency(timeStats.today?.revenue || 0)}</span>
              </div>
            </div>
          </div>

          <div className="time-stat-card">
            <h3>{t('dashboard.thisWeek')}</h3>
            <div className="time-stat-content">
              <div className="stat-item">
                <span className="stat-label">{t('dashboard.orders')}:</span>
                <span className="stat-value">{timeStats.week?.orders || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{t('dashboard.revenue')}:</span>
                <span className="stat-value">{formatCurrency(timeStats.week?.revenue || 0)}</span>
              </div>
            </div>
          </div>

          <div className="time-stat-card">
            <h3>{t('dashboard.thisMonth')}</h3>
            <div className="time-stat-content">
              <div className="stat-item">
                <span className="stat-label">{t('dashboard.orders')}:</span>
                <span className="stat-value">{timeStats.month?.orders || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{t('dashboard.revenue')}:</span>
                <span className="stat-value">{formatCurrency(timeStats.month?.revenue || 0)}</span>
              </div>
            </div>
          </div>

          <div className="time-stat-card">
            <h3>{t('dashboard.thisQuarter')}</h3>
            <div className="time-stat-content">
              <div className="stat-item">
                <span className="stat-label">{t('dashboard.orders')}:</span>
                <span className="stat-value">{timeStats.quarter?.orders || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{t('dashboard.revenue')}:</span>
                <span className="stat-value">{formatCurrency(timeStats.quarter?.revenue || 0)}</span>
              </div>
            </div>
          </div>

          <div className="time-stat-card">
            <h3>{t('dashboard.thisYear')}</h3>
            <div className="time-stat-content">
              <div className="stat-item">
                <span className="stat-label">{t('dashboard.orders')}:</span>
                <span className="stat-value">{timeStats.year?.orders || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{t('dashboard.revenue')}:</span>
                <span className="stat-value">{formatCurrency(timeStats.year?.revenue || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>🚀 Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => window.location.href = '/admin/orders'}>
            <span>📦</span>
            <div>
              <strong>View All Orders</strong>
              <small>Manage and track all customer orders</small>
            </div>
          </button>
          
          <button className="action-btn" onClick={() => window.location.href = '/admin/products'}>
            <span>🍽️</span>
            <div>
              <strong>Manage Products</strong>
              <small>Add, edit, or remove menu items</small>
            </div>
          </button>
          
          <button className="action-btn" onClick={() => window.location.href = '/admin/users'}>
            <span>👥</span>
            <div>
              <strong>User Management</strong>
              <small>View and manage customer accounts</small>
            </div>
          </button>
          
          <button className="action-btn" onClick={() => window.location.href = '/admin/categories'}>
            <span>📂</span>
            <div>
              <strong>Categories</strong>
              <small>Organize your menu structure</small>
            </div>
          </button>
          
          <button className="action-btn" onClick={() => window.location.href = '/admin/blog'}>
            <span>📝</span>
            <div>
              <strong>Blog Management</strong>
              <small>Create and manage blog posts</small>
            </div>
          </button>
          
          
        </div>
      </div>
    </div>
  )
}

export default Dashboard 
