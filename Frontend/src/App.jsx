import React , { useState }from 'react'
import Navbar from './pages/Navbar/Navbar';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home'
import Menu from './pages/Menu/Menu'
import AboutUs from './pages/AboutUs/AboutUs'
// import Blog from './pages/Blog/Blog'
// import BlogDetail from './pages/Blog/BlogDetail'
import ContactUs from './pages/ContactUs/ContactUs'
import Reservation from './pages/Reservation/Reservation'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import Footer from './components/Footer/Footer';
import LoginPopup from'./components/LoginPopup/LoginPopup';
import MyOrders from './pages/MyOrders/MyOrders'
import TrackOrder from './pages/TrackOrder/TrackOrder'
import Admin from './pages/Admin/Admin'
import FloatingCartBtn from './components/FloatingCartBtn/FloatingCartBtn'
import './i18n';

const App = () => {

  const [showLogin,setShowLogin]=useState(false)

  return (
    <>
    {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
    <div className='app'>
      <Navbar setShowLogin={setShowLogin}/>  
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/menu' element={<Menu/>}/>
        <Route path='/about' element={<AboutUs/>}/>
        {/* <Route path='/blog' element={<Blog/>}/> */}
        {/* <Route path='/blog/:slug' element={<BlogDetail/>}/> */}
        <Route path='/contact' element={<ContactUs/>}/>
        <Route path='/reservation' element={<Reservation/>}/>
        <Route path='/cart' element={<Cart/>}/>
        <Route path='/order' element={<PlaceOrder/>}/>
        <Route path='/myorders' element={<MyOrders />} />
        <Route path='/track-order' element={<TrackOrder />} />
        <Route path='/admin' element={<Admin />} />

      </Routes>
    </div>
    <Footer/>
    <FloatingCartBtn />
    </>
  )
}

export default App;