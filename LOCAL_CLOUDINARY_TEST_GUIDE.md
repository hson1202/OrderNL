# 🧪 Test Cloudinary ở Local - Step by Step

## 📋 Bước 1: Tạo Cloudinary Account

1. **Đăng ký tại**: https://cloudinary.com/
2. **Vào Dashboard** → Copy 3 thông tin này:
   ```
   Cloud Name: your-cloud-name
   API Key: 123456789012345
   API Secret: abcdefghijklmnopqrstuvwxyz
   ```

## ⚙️ Bước 2: Setup Environment Variables

**Tạo file `Backend/.env`:**
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/food-delivery

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=4000
NODE_ENV=development

# 🌟 CLOUDINARY CONFIGURATION - THAY BẰNG CREDENTIALS CỦA BẠN
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## 🔍 Bước 3: Test Connection

**Chạy test script:**
```bash
node test-cloudinary-local.js
```

**Kết quả mong đợi:**
```
🔍 Testing Cloudinary Configuration...

📋 Environment Variables:
CLOUDINARY_CLOUD_NAME: ✅ Set
CLOUDINARY_API_KEY: ✅ Set
CLOUDINARY_API_SECRET: ✅ Set

⚙️ Cloudinary configured successfully!
🎉 Cloudinary connection test: ✅ SUCCESS
📊 Account Usage:
- Credits used: 0
- Storage used: 0 MB
- Bandwidth used: 0 MB
```

## 🚀 Bước 4: Test Upload qua Admin

1. **Start backend:**
   ```bash
   cd Backend
   npm run dev
   ```

2. **Start admin:**
   ```bash
   cd Admin
   npm run dev
   ```

3. **Test upload category:**
   - Vào Admin → Categories
   - Thêm category mới với hình
   - Check console → Thấy Cloudinary URL

## 🔍 Bước 5: Verify Upload

**Check console logs:**
```javascript
// Sẽ thấy:
=== ADD CATEGORY DEBUG ===
Request file: {
  path: 'https://res.cloudinary.com/your-cloud/image/upload/v123/food-delivery/uploads/abc.jpg'
}
Image URL: https://res.cloudinary.com/your-cloud/image/upload/v123/food-delivery/uploads/abc.jpg
```

**Check database:**
```javascript
// Category document sẽ có:
{
  name: "Test Category",
  image: "https://res.cloudinary.com/your-cloud/image/upload/v123/food-delivery/uploads/abc.jpg"
}
```

## 🎯 Bước 6: Test Hiển thị

**Frontend sẽ hiển thị hình từ Cloudinary:**
- ExploreMenu → Hình category từ Cloudinary URL
- Không cần config gì thêm ở Frontend

## 🐛 Troubleshooting

**❌ Connection failed:**
```bash
# Check credentials
node test-cloudinary-local.js

# Check .env file exists
ls -la Backend/.env
```

**❌ Upload failed:**
```javascript
// Check console trong admin
// Sẽ thấy error details
```

**❌ Hình không hiển thị:**
```javascript
// Check database
// Image field phải chứa full Cloudinary URL
```

## ✅ Success Indicators

1. **Test script** → ✅ SUCCESS
2. **Upload** → Console log Cloudinary URL  
3. **Database** → Full Cloudinary URL
4. **Frontend** → Hình hiển thị từ cloud

## 🎉 Kết luận

Sau khi setup xong:
- ✅ Upload local → Lưu lên Cloudinary
- ✅ Hình không bị mất khi restart
- ✅ CDN nhanh từ Cloudinary
- ✅ Ready for production deployment
