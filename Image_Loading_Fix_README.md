# 🔧 Fix Image Loading Issues

## 🚨 Vấn đề đã gặp phải

1. **Route `/images/` không tồn tại**: Backend chỉ có route `/uploads/` nhưng frontend đang sử dụng cả `/images/` và `/uploads/`
2. **Hardcoded localhost URLs**: Nhiều file frontend đang hardcode `localhost:4000` thay vì sử dụng config
3. **External placeholder images**: Sử dụng `via.placeholder.com` gây lỗi network

## ✅ Cách đã fix

### 1. Thêm route `/images/` trong backend

**File: `Backend/server.js`**
```javascript
// Serve static images - always enable on local
app.use("/uploads", express.static("uploads"))

// Also serve images from uploads directory for backward compatibility
app.use("/images", express.static("uploads"))
```

**Giải thích**: 
- Route `/images/` và `/uploads/` đều trỏ đến thư mục `uploads`
- Đảm bảo backward compatibility với code cũ

### 2. Tạo file config để quản lý URL

**File: `Frontend/src/config/config.js`**
```javascript
const config = {
  BACKEND_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-domain.vercel.app'  // Replace with actual URL
    : 'http://localhost:4000',
  
  IMAGE_PATHS: {
    FOOD: '/images',      // For food images
    BLOG: '/uploads',     // For blog images
    CATEGORY: '/images'   // For category images
  }
};
```

### 3. Cập nhật StoreContext

**File: `Frontend/src/Context/StoreContext.jsx`**
```javascript
import config from "../config/config"

const url = config.BACKEND_URL  // Thay vì hardcode localhost:4000
```

### 4. Thay thế external placeholder bằng base64 SVG

**File: `Admin/src/pages/Products/Products.jsx`**
```javascript
// Thay vì:
src='https://via.placeholder.com/300x200?text=No+Image'

// Sử dụng:
src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlsaT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='
```

## 🚀 Cách deploy

### 1. Cập nhật config cho production

**File: `Frontend/src/config/config.js`**
```javascript
BACKEND_URL: process.env.NODE_ENV === 'production' 
  ? 'https://your-actual-backend.vercel.app'  // ⚠️ Thay đổi URL này
  : 'http://localhost:4000'
```

### 2. Deploy backend trước

```bash
cd Backend
git add .
git commit -m "Fix image loading: add /images route"
git push
# Vercel sẽ tự động deploy
```

### 3. Deploy frontend

```bash
cd Frontend
git add .
git commit -m "Fix image loading: use config instead of hardcoded URLs"
git push
# Vercel sẽ tự động deploy
```

## 🔍 Test sau khi fix

1. **Kiểm tra backend routes**:
   ```
   GET https://your-backend.vercel.app/images/test.jpg
   GET https://your-backend.vercel.app/uploads/test.jpg
   ```

2. **Kiểm tra frontend images**:
   - Food images: `/images/food.jpg`
   - Blog images: `/uploads/blog.jpg`
   - Category images: `/images/category.jpg`

3. **Kiểm tra console errors**:
   - Không còn lỗi `ERR_NAME_NOT_RESOLVED`
   - Không còn lỗi `via.placeholder.com`

## 📝 Files đã sửa

- ✅ `Backend/server.js` - Thêm route `/images/`
- ✅ `Frontend/src/config/config.js` - Tạo file config
- ✅ `Frontend/src/Context/StoreContext.jsx` - Sử dụng config
- ✅ `Frontend/src/pages/Blog/Blog.jsx` - Sử dụng config
- ✅ `Frontend/src/pages/Blog/BlogDetail.jsx` - Sử dụng config
- ✅ `Admin/src/pages/Products/Products.jsx` - Thay placeholder

## 🚨 Lưu ý quan trọng

1. **Thay đổi URL backend** trong `config.js` trước khi deploy
2. **Kiểm tra thư mục `uploads`** có tồn tại trong backend
3. **Test cả local và production** để đảm bảo hoạt động
4. **Clear browser cache** sau khi deploy để test

## 🔧 Troubleshooting

### Nếu vẫn lỗi hình ảnh:

1. **Kiểm tra backend logs**:
   ```bash
   # Vercel dashboard → Functions → server.js → View Function Logs
   ```

2. **Kiểm tra network tab**:
   - Xem request URL có đúng không
   - Xem response status code

3. **Kiểm tra file permissions**:
   - Đảm bảo thư mục `uploads` có quyền đọc

4. **Test với curl**:
   ```bash
   curl -I https://your-backend.vercel.app/images/test.jpg
   ```
