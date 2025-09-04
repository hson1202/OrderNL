import React, { useContext, useState, useEffect } from 'react'
import './ProductDetail.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import { useTranslation } from 'react-i18next'

// ---- Pricing helpers ----
const hasOverrideOpt = (product) =>
  Array.isArray(product?.options) && product.options.some(o => o.pricingMode === 'override');

const computeVariantPrice = (product, selectedOptions = {}) => {
  const opts = Array.isArray(product?.options) ? product.options : [];
  let price = Number(product?.price) || 0;

  for (const o of opts) {
    if (o.pricingMode === 'override') {
      const code = selectedOptions[o.name] || o.defaultChoiceCode;
      const ch = (o.choices || []).find(c => c.code === code);
      if (ch) {
        price = Number(ch.price) || 0;
        break;
      }
    }
  }

  for (const o of opts) {
    if (o.pricingMode === 'add') {
      const code = selectedOptions[o.name] || o.defaultChoiceCode;
      const ch = (o.choices || []).find(c => c.code === code);
      if (ch) price += Number(ch.price) || 0;
    }
  }

  return price;
};

const variantPriceRange = (product) => {
  const opts = Array.isArray(product?.options) ? product.options : [];
  const base = Number(product?.price) || 0;

  if (opts.length === 0) return { min: base, max: base };

  const overrideOpts = opts.filter(o => o.pricingMode === 'override');
  const addOpts = opts.filter(o => o.pricingMode === 'add');

  const addMin = addOpts.reduce((s, o) => {
    const arr = (o.choices || []).map(c => Number(c.price) || 0);
    return s + (arr.length ? Math.min(...arr) : 0);
  }, 0);
  const addMax = addOpts.reduce((s, o) => {
    const arr = (o.choices || []).map(c => Number(c.price) || 0);
    return s + (arr.length ? Math.max(...arr) : 0);
  }, 0);

  if (overrideOpts.length > 0) {
    const overAll = overrideOpts.flatMap(o => (o.choices || []).map(c => Number(c.price) || 0));
    if (overAll.length === 0) return { min: addMin, max: addMax };
    const minOver = Math.min(...overAll);
    const maxOver = Math.max(...overAll);
    return { min: minOver + addMin, max: maxOver + addMax };
  }

  return { min: base + addMin, max: base + addMax };
};

const buildDefaultSelections = (product) => {
  const selected = {};
  (product?.options || []).forEach(o => {
    if (o.defaultChoiceCode) selected[o.name] = o.defaultChoiceCode;
  });
  return selected;
};

const pickImageFromSelections = (product, selectedOptions = {}) => {
  for (const o of (product?.options || [])) {
    const code = selectedOptions[o.name] || o.defaultChoiceCode;
    const ch = (o.choices || []).find(c => c.code === code);
    if (ch?.image) return ch.image;
  }
  return product?.image || '';
};

const ProductDetail = ({ product, onClose }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext)
  const { t, i18n } = useTranslation()
  
  // State for selected options
  const [selectedOptions, setSelectedOptions] = useState({})
  const [currentImage, setCurrentImage] = useState('')
  const [currentPrice, setCurrentPrice] = useState(0)

  if (!product) return null

  // Debug: Log product data
  console.log('🔍 ProductDetail - Product data:', product)
  console.log('🔍 ProductDetail - Options:', product.options)

  // Initialize options, price and image when product changes
  useEffect(() => {
    if (!product) return;

    const initialSelected = buildDefaultSelections(product);
    const price = computeVariantPrice(product, initialSelected);
    const img = pickImageFromSelections(product, initialSelected);

    setSelectedOptions(initialSelected);
    setCurrentPrice(price);
    setCurrentImage(img);
  }, [product])

  // Function to get the appropriate name based on current language
  const getLocalizedName = () => {
    const currentLang = i18n.language;
    switch (currentLang) {
      case 'vi':
        return product.nameVI || product.name;
      case 'en':
        return product.nameEN || product.name;
      case 'sk':
        return product.nameSK || product.name;
      default:
        return product.name;
    }
  };

  const formatPrice = (price) => {
    const n = Number(price);
    if (isNaN(n) || n < 0) return '€0';
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(n);
    return formatted.replace(/\.00$/, '');
  };

  const calculateDiscount = () => {
    if (!product.isPromotion || !product.originalPrice || !product.promotionPrice) return 0;
    return Math.round(((product.originalPrice - product.promotionPrice) / product.originalPrice) * 100);
  };

  const handleOptionChange = (optionName, choiceCode) => {
    const newOptions = { ...selectedOptions, [optionName]: choiceCode }
    setSelectedOptions(newOptions)

    const price = computeVariantPrice(product, newOptions)
    const img = pickImageFromSelections(product, newOptions)
    setCurrentPrice(price)
    setCurrentImage(img)
  }

  const handleAddToCart = () => {
    // Create a unique cart key that includes selected options
    const cartKey = product.options && product.options.length > 0 
      ? `${product._id}_${JSON.stringify(selectedOptions)}`
      : product._id
    
    // Add to cart with options
    addToCart(cartKey, {
      ...product,
      selectedOptions,
      currentPrice,
      currentImage
    })
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Check if product is in cart with current options
  const getCartQuantity = () => {
    const cartKey = product.options && product.options.length > 0 
      ? `${product._id}_${JSON.stringify(selectedOptions)}`
      : product._id
    
    return cartItems[cartKey] || 0
  }

  const handleRemoveFromCart = () => {
    const cartKey = product.options && product.options.length > 0 
      ? `${product._id}_${JSON.stringify(selectedOptions)}`
      : product._id
    
    removeFromCart(cartKey)
  }

  const handleIncreaseQuantity = () => {
    handleAddToCart()
  }

  return (
    <div className="product-detail-overlay" onClick={handleOverlayClick}>
      <div className="product-detail-modal">
        <button className="close-btn" onClick={onClose}>
          <img src={assets.cross_icon} alt="Close" />
        </button>

        <div className="product-detail-content">
          <div className="product-detail-image">
            <img 
              src={
                currentImage && currentImage.startsWith('http') 
                  ? currentImage 
                  : currentImage 
                    ? (url + "/images/" + currentImage) 
                    : product.image && product.image.startsWith('http') 
                      ? product.image 
                      : product.image 
                        ? (url + "/images/" + product.image) 
                        : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn42dIE5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
              }
              alt={getLocalizedName()}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5qrIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                e.target.onerror = null;
              }}
            />
            {product.isPromotion && !hasOverrideOpt(product) && (
              <div className="promotion-badge">
                -{calculateDiscount()}% {t('food.promotion')}
              </div>
            )}
          </div>

          <div className="product-detail-info">
            <div className="product-header">
              <h2>{getLocalizedName()}</h2>
              <div className="product-sku">
                SKU: <span className="sku">{product.sku || 'N/A'}</span>
              </div>
            </div>

            <div className="product-description">
              <p>{product.description || t('productDetail.noDescription')}</p>
            </div>

            {/* Product Options */}
            {product.options && product.options.length > 0 && (
              <div className="product-options">
                <h4>{t('productDetail.customizeYourOrder')}</h4>
                {product.options.map((option, index) => (
                  <div key={index} className="option-group">
                    <label className="option-label">{option.name}</label>
                    <div className="option-choices">
                      {option.choices.map((choice) => (
                        <label key={choice.code} className="option-choice">
                          <input
                            type="radio"
                            name={option.name}
                            value={choice.code}
                            checked={selectedOptions[option.name] === choice.code}
                            onChange={() => handleOptionChange(option.name, choice.code)}
                          />
                          <div className="choice-content">
                            <span className="choice-label">{choice.label}</span>
                            <span className="choice-price">{formatPrice(choice.price)}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="product-stats">
              {product.likes > 0 && (
                <div className="stat-item">
                  <span className="stat-icon">👍</span>
                  <span className="stat-text">{product.likes} {t('productDetail.likes')}</span>
                </div>
              )}
              {product.soldCount > 0 && (
                <div className="stat-item">
                  <span className="stat-icon">🛒</span>
                  <span className="stat-text">{product.soldCount}+ {t('productDetail.sold')}</span>
                </div>
              )}
            </div>

            <div className="product-pricing">
              {hasOverrideOpt(product) ? (
                <div className="regular-pricing">
                  <div className="price-row main-price">
                    <span className="label">{t('common.price')}:</span>
                    <span className="regular-price">{formatPrice(currentPrice)}</span>
                  </div>
                </div>
              ) : product.isPromotion && Number(product.promotionPrice) > 0 ? (
                <div className="promotion-pricing">
                  <div className="price-row">
                    <span className="label">{t('food.originalPrice')}:</span>
                    <span className="original-price">{formatPrice(product.price)}</span>
                  </div>
                  <div className="price-row main-price">
                    <span className="label">{t('food.promotionPrice')}:</span>
                    <span className="promotion-price">{formatPrice(product.promotionPrice)}</span>
                  </div>
                  <div className="savings">
                    {t('productDetail.youSave')}: {formatPrice((Number(product.price)||0) - (Number(product.promotionPrice)||0))}
                  </div>
                </div>
              ) : (
                <div className="regular-pricing">
                  <div className="price-row main-price">
                    <span className="label">{t('common.price')}:</span>
                    <span className="regular-price">{formatPrice(currentPrice)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="product-actions">
              <div className="quantity-control">
                {getCartQuantity() === 0 ? (
                  <button 
                    className="add-to-cart-btn"
                    onClick={handleAddToCart}
                  >
                    {t('food.addToCart')}
                  </button>
                ) : (
                  <div className="quantity-controls">
                    <button 
                      className="qty-btn decrease"
                      onClick={handleRemoveFromCart}
                    >
                      <img src={assets.remove_icon_red} alt="" />
                    </button>
                    <span className="quantity">{getCartQuantity()}</span>
                    <button 
                      className="qty-btn increase"
                      onClick={handleIncreaseQuantity}
                    >
                      <img src={assets.add_icon_green} alt="" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Additional product information */}
            <div className="product-additional-info">
              <div className="info-section">
                <h4>{t('productDetail.additionalInfo')}</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">{t('productDetail.status')}:</span>
                    <span className={`info-value status-${product.status}`}>
                      {product.status === 'active' ? t('productDetail.available') : t('productDetail.unavailable')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
