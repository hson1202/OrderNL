import React, { useState, useRef } from 'react'
import './ExploreMenu.css'
import config from '../../config/config'

const ExploreMenu = ({category, setCategory, categories, loading, hideHeader = false}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };
  if (loading) {
    return (
      <div className='explore-menu' id='explore-menu'>
        {!hideHeader && (
          <>
            <h1>Explore our menu</h1>
            <p className='explore-menu-text'>Choose from a diverse menu featuring a delectable array of dishes. Our mission is to satisfy your cravings and elevate your dining experience, one delicious meal at a time.</p>
          </>
        )}
        <div className='explore-menu-list'>
          <div className='loading-categories'>Loading categories...</div>
        </div>
        {!hideHeader && <hr></hr>}
      </div>
    )
  }

  return (
    <div className='explore-menu' id='explore-menu'>
        {!hideHeader && (
          <>
            <h1>Explore our menu</h1>
            <p className='explore-menu-text'>Choose from a diverse menu featuring a delectable array of dishes. Our mission is to satisfy your cravings and elevate your dining experience, one delicious meal at a time.</p>
          </>
        )}
        <div 
          className='explore-menu-list'
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            {categories.length > 0 ? (
              categories.map((item, index) => {
                return (
                  <div 
                    onClick={() => setCategory(prev => prev === item.name ? "All" : item.name)} 
                    key={item._id || index} 
                    className='explore-menu-list-item'
                  >
                    {item.image ? (
                      <img 
                        className={category === item.name ? "active" : ""} 
                        src={item.image && item.image.startsWith('http') ? item.image : `${config.BACKEND_URL}${config.IMAGE_PATHS.CATEGORY}/${item.image}`}
                        alt={item.name}
                      />
                    ) : (
                      <div className={`category-placeholder ${category === item.name ? "active" : ""}`}>
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <p title={item.name}>{item.name}</p>
                  </div>
                )
              })
            ) : (
              <div className='no-categories'>No categories available</div>
            )}
        </div>
        {!hideHeader && <hr></hr>}
    </div>
  )
}

export default ExploreMenu;