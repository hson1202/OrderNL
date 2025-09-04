import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Route, Routes, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard/Dashboard'
import Orders from './pages/Orders/Orders'
import Category from './pages/Category/Category'
import Products from './pages/Products/Products'
import Users from './pages/Users/Users'
import Permissions from './pages/Permissions/Permissions'
import Blog from './pages/Blog/Blog'
import Reservations from './pages/Reservations/Reservations'
import Messages from './pages/Messages/Messages'
import Add from './pages/Add/Add'
import Login from './pages/Login/Login'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './i18n';
import config from './config/config';

const App = () => {
  const url = config.BACKEND_URL
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <ToastContainer/>
        <Routes>
          <Route path='/admin/login' element={<Login url={url} setIsAuthenticated={setIsAuthenticated}/>}/>
          <Route path='*' element={<Navigate to="/admin/login" replace />}/>
        </Routes>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer/>
      <Navbar setIsAuthenticated={setIsAuthenticated}/>
      <hr/>
      <div className="app-content">
        <Sidebar/>
        <Routes>
          <Route path='/admin' element={<Dashboard url={url}/>}/>
          <Route path='/admin/orders' element={<Orders url={url}/>}/>
          <Route path='/admin/category' element={<Category url={url}/>}/>
          <Route path='/admin/products' element={<Products url={url}/>}/>
          <Route path='/admin/users' element={<Users url={url}/>}/>
          <Route path='/admin/permissions' element={<Permissions url={url}/>}/>
          <Route path='/admin/blog' element={<Blog url={url}/>}/>
          <Route path='/admin/reservations' element={<Reservations url={url}/>}/>
          <Route path='/admin/messages' element={<Messages url={url}/>}/>
          <Route path='/admin/add' element={<Add url={url}/>}/>
          <Route path='/admin/login' element={<Navigate to="/admin" replace />}/>
          <Route path='*' element={<Navigate to="/admin" replace />}/>
        </Routes>
      </div>
    </div>
  )
}

export default App