import React, { useContext, useState, useEffect } from 'react'
import './CartPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

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

const CartPopup = ({ onClose }) => {
  const { cartItems, cartItemsData, food_list, addToCart, removeFromCart, getTotalCartAmount, url } = useContext(StoreContext)
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [recommendedItems, setRecommendedItems] = useState([])

  // Function to get localized name
  const getLocalizedName = (food) => {
    const currentLang = i18n.language;
    let baseName;
    switch (currentLang) {
      case 'vi':
        baseName = food.nameVI || food.name;
        break;
      case 'en':
        baseName = food.nameEN || food.name;
        break;
      case 'sk':
        baseName = food.nameSK || food.name;
        break;
      default:
        baseName = food.name;
    }
    return `${food.sku} - ${baseName}`;
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

  // Get cart items with details including options
  const getCartItems = () => {
    const items = []
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        // Try to get item from cartItemsData first (for items with options)
        let itemInfo = cartItemsData[itemId];
        
        // If not in cartItemsData, fall back to food_list
        if (!itemInfo) {
          itemInfo = food_list.find((product) => product._id === itemId)
        }
        
        if (itemInfo) {
          items.push({
            ...itemInfo,
            quantity: cartItems[itemId],
            cartItemId: itemId // Store the actual cart key
          })
        }
      }
    }
    return items
  }

  // Format selected options for display
  const formatSelectedOptions = (item) => {
    if (!item.selectedOptions || Object.keys(item.selectedOptions).length === 0) {
      return null;
    }

    const optionTexts = [];
    Object.entries(item.selectedOptions).forEach(([optionName, choiceCode]) => {
      const option = item.options?.find(opt => opt.name === optionName);
      if (option) {
        const choice = option.choices.find(c => c.code === choiceCode);
        if (choice) {
          optionTexts.push(`${optionName}: ${choice.label}`);
        }
      }
    });

    return optionTexts.join(', ');
  };

  // Smart upsale algorithm
  const generateRecommendations = () => {
    const cartItems = getCartItems()
    if (cartItems.length === 0) return []

    const cartCategories = [...new Set(cartItems.map(item => item.category))]
    const cartItemIds = cartItems.map(item => item._id)
    
    // Find complementary items
    const recommendations = food_list.filter(item => {
      // Don't recommend items already in cart
      if (cartItemIds.includes(item._id)) return false
      
      // Recommend from same categories
      if (cartCategories.includes(item.category)) return true
      
      // Smart pairing logic
      if (cartCategories.includes('Noodles') && ['Drinks', 'Appetizers'].includes(item.category)) return true
      if (cartCategories.includes('Main Course') && ['Drinks', 'Desserts'].includes(item.category)) return true
      if (cartCategories.includes('Pizza') && ['Drinks', 'Sides'].includes(item.category)) return true
      
      return false
    })
    .filter(item => item.status === 'active')
    .sort((a, b) => {
      // Prioritize promoted items and popular items
      if (a.isPromotion && !b.isPromotion) return -1
      if (!a.isPromotion && b.isPromotion) return 1
      return (b.soldCount || 0) - (a.soldCount || 0)
    })
    .slice(0, 3) // Limit to 3 recommendations

    return recommendations
  }

  useEffect(() => {
    setRecommendedItems(generateRecommendations())
  }, [cartItems, food_list])

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleCheckout = () => {
    onClose()
    navigate('/order')
  }

  const getTotalItems = () => {
    return Object.values(cartItems).reduce((total, count) => total + count, 0)
  }

  const cartItemsList = getCartItems()

  return (
    <div className="cart-popup-overlay" onClick={handleOverlayClick}>
      <div className="cart-popup-modal">
        <div className="cart-popup-header">
          <h2>
            🛒 {t('cart.title')} 
            <span className="cart-badge">{getTotalItems()}</span>
          </h2>
          <button className="close-btn" onClick={onClose}>
            <img src={assets.cross_icon} alt="Close" />
          </button>
        </div>

        <div className="cart-popup-content">
          {cartItemsList.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-icon">🛒</div>
              <h3>{t('cart.empty')}</h3>
              <p>{t('cart.continueShopping')}</p>
              <button className="continue-btn" onClick={onClose}>
                {t('menu.explore')}
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="cart-items-section">
                <h3>{t('cart.items')} ({cartItemsList.length})</h3>
                <div className="cart-items-list">
                  {cartItemsList.map((item) => (
                    <div key={item.cartItemId} className="cart-item">
                      <div className="cart-item-image">
                        {(() => {
                          const fallback = pickImageFromSelections(item, item.selectedOptions) || item.image;
                          const imgSrc = item.currentImage
                            ? (item.currentImage.startsWith('http') ? item.currentImage : `${url}/images/${item.currentImage}`)
                            : (fallback && fallback.startsWith('http') ? fallback : `${url}/images/${fallback}`);
                          return (
                            <img 
                              src={imgSrc}
                              alt={getLocalizedName(item)} 
                            />
                          );
                        })()}
                      </div>
                      <div className="cart-item-info">
                        <h4>{getLocalizedName(item)}</h4>
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="cart-item-options">
                            <span className="options-text">{formatSelectedOptions(item)}</span>
                          </div>
                        )}
                        <div className="cart-item-price">
                          {(() => {
                            const unitPrice = (item.currentPrice != null)
                              ? Number(item.currentPrice)
                              : computeVariantPrice(item, item.selectedOptions);
                            return (
                              <span className="regular-price">{formatPrice(unitPrice)}</span>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="cart-item-controls">
                        <button onClick={() => removeFromCart(item.cartItemId)}>
                          <img src={assets.remove_icon_red} alt="" />
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button onClick={() => addToCart(item.cartItemId, item)}>
                          <img src={assets.add_icon_green} alt="" />
                        </button>
                      </div>
                      <div className="cart-item-total">
                        {(() => {
                          const unitPrice = (item.currentPrice != null)
                            ? Number(item.currentPrice)
                            : computeVariantPrice(item, item.selectedOptions);
                          return formatPrice(unitPrice * item.quantity);
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Items */}
              {recommendedItems.length > 0 && (
                <div className="recommendations-section">
                  <h3>💡 {t('cartPopup.recommendedForYou')}</h3>
                  <p className="recommendations-subtitle">{t('cartPopup.perfectWith')}</p>
                  <div className="recommended-items">
                    {recommendedItems.map((item) => (
                      <div key={item._id} className="recommended-item">
                        <div className="recommended-image">
                          <img src={(item.image && item.image.startsWith('http')) ? item.image : (url + "/images/" + item.image)} alt={getLocalizedName(item)} />
                          {item.isPromotion && !hasOverrideOpt(item) && (
                            <div className="promo-badge">-{Math.round(((item.originalPrice - item.promotionPrice) / item.originalPrice) * 100)}%</div>
                          )}
                        </div>
                        <div className="recommended-info">
                          <h5>{getLocalizedName(item)}</h5>
                          <div className="recommended-price">
                            {(() => {
                              const r = variantPriceRange(item);
                              return r.min === r.max ? (
                                <span className="price">{formatPrice(r.min)}</span>
                              ) : (
                                <>
                                  <span className="price">{formatPrice(r.min)}</span>
                                  <span className="price"> – {formatPrice(r.max)}</span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        <button 
                          className="add-recommended-btn"
                          onClick={() => {
                            const selected = buildDefaultSelections(item);
                            const price = computeVariantPrice(item, selected);
                            const img = pickImageFromSelections(item, selected);
                            const cartKey = item.options?.length
                              ? `${item._id}_${JSON.stringify(selected)}`
                              : item._id;
                            addToCart(cartKey, {
                              ...item,
                              selectedOptions: selected,
                              currentPrice: price,
                              currentImage: img
                            });
                          }}
                        >
                          <img src={assets.add_icon_green} alt="" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cart Summary */}
              <div className="cart-summary">
                <div className="summary-row">
                  <span>{t('cart.subtotal')}</span>
                  <span>{formatPrice(getTotalCartAmount())}</span>
                </div>
                <div className="summary-row total">
                  <span>{t('cart.total')}</span>
                  <span>{formatPrice(getTotalCartAmount())}</span>
                </div>
                <button className="checkout-btn" onClick={handleCheckout}>
                  {t('cart.checkout')} ({getTotalItems()} {t('cart.items')})
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CartPopup
