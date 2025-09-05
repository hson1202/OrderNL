import React, { useState, useEffect, useContext } from 'react'
import './Menu.css'
import { StoreContext } from '../../Context/StoreContext'
import FoodItem from '../../components/FoodItem/FoodItem'
import ProductDetail from '../../components/ProductDetail/ProductDetail'
import CartPopup from '../../components/CartPopup/CartPopup'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import config from '../../config/config'

// Load all hero images at once using Vite glob import
// You can place hero images in `src/assets/` and select by file name
const HERO_IMAGES = import.meta.glob('../../assets/*.{jpg,jpeg,png,webp}', { eager: true, as: 'url' })

const Menu = () => {
  const { food_list, cartItems, getTotalCartAmount } = useContext(StoreContext)
  const { i18n } = useTranslation()
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [isSticky, setIsSticky] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showCartPopup, setShowCartPopup] = useState(false)
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchCategories()
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${config.BACKEND_URL}/api/category`)
      setCategories(response.data.data || response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setLoading(false)
    }
  }



  const handleScroll = () => {
    const scrollTop = window.pageYOffset
    setIsSticky(scrollTop > 200)
  }

  // Function to get localized name based on current language
  const getLocalizedName = (food) => {
    const currentLang = i18n.language;
    switch (currentLang) {
      case 'vi':
        return food.nameVI || food.name;
      case 'en':
        return food.nameEN || food.name;
      case 'sk':
        return food.nameSK || food.name;
      default:
        return food.name;
    }
  };

  const filteredFoods = food_list.filter(food => {
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory
    const localizedName = getLocalizedName(food);
    const matchesSearch = localizedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         food.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         food.sku.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Calculate pagination
  const totalItems = filteredFoods.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const displayedFoods = filteredFoods.slice(0, currentPage * itemsPerPage)
  const hasMoreItems = currentPage < totalPages

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
    setHasMore(true)
  }, [selectedCategory, searchTerm])

  // Update hasMore when filteredFoods changes
  useEffect(() => {
    setHasMore(currentPage < totalPages)
  }, [currentPage, totalPages])

  const handleCategoryClick = (category) => {
    setSelectedCategory(category)
    // Smooth scroll to food section with offset for sticky category bar
    setTimeout(() => {
      const foodSection = document.getElementById('food-section')
      if (foodSection) {
        const categoryBarHeight = 80; // Height of category bar
        const yOffset = -categoryBarHeight;
        const y = foodSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100) // Small delay to ensure category state is updated
  }

  const clearSearch = () => {
    setSearchTerm('')
  }

  const handleViewDetails = (product) => {
    setSelectedProduct(product)
  }

  const closeProductDetail = () => {
    setSelectedProduct(null)
  }

  const closeCartPopup = () => {
    setShowCartPopup(false)
  }

  const handleLoadMore = () => {
    if (hasMoreItems) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const formatPrice = (price) => {
    // Kiểm tra price có hợp lệ không
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      return '€0';
    }
    
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Number(price));
    
    // Remove .00 if it's a whole number
    return formatted.replace(/\.00$/, '');
  };

  return (
    <div className="menu-page">
    {/* Hero Section */}
    <div className="menu-hero">
      {/* Background Image (behind content) */}
      <div className="hero-background">
        <img 
          src={
            HERO_IMAGES['../../assets/back10.jpg'] 
            ?? HERO_IMAGES['../../assets/header_img.png'] 
            ?? Object.values(HERO_IMAGES)[0]
          }
          alt="Menu background"
          className="hero-bg-image"
        />
        {/* overlay intentionally removed */}
      </div>
      
      <div className="hero-content">
        <div className="hero-text-section">
          <h1>Our Delicious Menu</h1>
          <p>Discover our amazing collection of dishes, carefully crafted to satisfy your cravings</p>
          
          {/* Search Bar */}
          <div className="search-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search for your favorite dishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button onClick={clearSearch} className="clear-search">
                  ✕
                </button>
              )}
              <div className="search-icon">🔍</div>
            </div>
            {searchTerm && (
              <div className="search-results-info">
                Found {filteredFoods.length} result{filteredFoods.length !== 1 ? 's' : ''} for "{searchTerm}"
                {hasMoreItems && (
                  <span className="pagination-info">
                    (Showing {displayedFoods.length} of {totalItems})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        </div>  
        </div>

      {/* Explore Menu Section - Replaces Category Bar */}
      <div className={`category-bar ${isSticky ? 'sticky' : ''}`}>
        <div className="category-container">
          <ExploreMenu 
            category={selectedCategory} 
            setCategory={setSelectedCategory} 
            categories={categories} 
            loading={loading}
            hideHeader={true}
          />
        </div>
      </div>

      {/* Food Section */}
      <div id="food-section" className="food-section">

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading delicious dishes...</p>
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h3>No dishes found</h3>
            <p>
              {searchTerm 
                ? `No dishes match "${searchTerm}". Try a different search term or category.`
                : `No dishes available in ${selectedCategory}. Try another category.`
              }
            </p>
            <button 
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('All')
              }}
              className="reset-btn"
            >
              Show All Dishes
            </button>
          </div>
        ) : (
          <>
            <div className="food-grid">
              {displayedFoods.map((food, index) => (
              <div key={food._id} className="food-item-wrapper">
                {/* Debug: Log food data */}
                {console.log('🔍 Menu - Food data:', food)}
                {console.log('🔍 Menu - Food options:', food.options)}
                <FoodItem 
                  id={food._id} 
                  name={`${food.sku} - ${food.name}`}
                  nameVI={`${food.sku} - ${food.nameVI || food.name}`}
                  nameEN={`${food.sku} - ${food.nameEN || food.name}`}
                  nameSK={`${food.sku} - ${food.nameSK || food.name}`}
                  description={food.description} 
                  price={food.price} 
                  image={food.image}
                  sku={food.sku}
                  isPromotion={food.isPromotion}
                  originalPrice={food.originalPrice}
                  promotionPrice={food.promotionPrice}
                  soldCount={food.soldCount}
                  likes={food.likes}
                  options={food.options}
                  unit={food.unit}
                  unitValue={food.unitValue}
                  onViewDetails={handleViewDetails}
                />
              </div>
            ))}
            </div>
            
            {/* Load More Button */}
            {hasMoreItems && (
              <div className="load-more-container">
                <button 
                  className="load-more-btn"
                  onClick={handleLoadMore}
                >
                  Load More ({totalItems - displayedFoods.length} more items)
                </button>
              </div>
            )}
            
            {/* Pagination Info */}
            {!hasMoreItems && totalItems > itemsPerPage && (
              <div className="pagination-info-container">
                <p>Showing all {totalItems} items</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Detail Popup */}
      {selectedProduct && (
        <ProductDetail 
          product={selectedProduct}
          onClose={closeProductDetail}
        />
      )}

      {/* Cart Popup */}
      {showCartPopup && (
        <CartPopup 
          onClose={closeCartPopup}
        />
      )}

      {/* Floating Cart Button is now handled globally in App.jsx */}
    </div>
  )
}

export default Menu 