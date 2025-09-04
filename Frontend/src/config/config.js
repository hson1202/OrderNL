// Configuration file for backend URLs
const config = {
  // Backend URL - uses environment variable
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000',
  
  // API endpoints
  API_ENDPOINTS: {
    FOOD: '/api/food',
    CATEGORY: '/api/category',
    USER: '/api/user',
    CART: '/api/cart',
    ORDER: '/api/order',
    BLOG: '/api/blog',
    CONTACT: '/api/contact',
    RESERVATION: '/api/reservation',
    ADMIN: '/api/admin'
  },
  
  // Image paths
  IMAGE_PATHS: {
    FOOD: '/images',      // For food images
    BLOG: '/uploads',     // For blog images
    CATEGORY: '/images'   // For category images
  }
};

export default config;
