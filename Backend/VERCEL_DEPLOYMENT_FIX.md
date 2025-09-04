# 🔧 Fix Backend Vercel Deployment

## 🚨 Vấn đề đã gặp phải

Backend không chạy trên Vercel vì:

1. **`startServer()` không được gọi**: Code chỉ gọi `startServer()` khi `NODE_ENV !== 'production'`
2. **Trên Vercel**: `NODE_ENV` mặc định là "production", nên function này không được gọi
3. **Kết quả**: DB không connect, routes không đăng ký, tất cả request trả về 500

## ✅ Cách đã fix

### 1. Sửa `server.js`

**Trước (LỖI):**
```javascript
// Chỉ start server khi chạy local, không start trên Vercel
if (process.env.NODE_ENV !== 'production') {
  startServer();
}
```

**Sau (ĐÚNG):**
```javascript
// Start server cho cả local và Vercel
startServer();
```

### 2. Cập nhật `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.js"
    },
    {
      "src": "/images/(.*)",
      "dest": "server.js"
    },
    {
      "src": "/test-(.*)",
      "dest": "server.js"
    },
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "functions": {
    "server.js": {
      "maxDuration": 30
    }
  }
}
```

## 🚀 Cách deploy

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "Fix Vercel deployment: startServer() now runs on production"
   git push
   ```

2. **Deploy lên Vercel:**
   - Vercel sẽ tự động detect changes và deploy
   - Hoặc manual deploy từ Vercel dashboard

3. **Kiểm tra logs:**
   - Vào Vercel dashboard → Functions → server.js
   - Xem logs để đảm bảo "DB Connected" và "Server running on Vercel"

## 🔍 Test sau khi deploy

1. **Test route cơ bản:**
   ```
   GET https://your-domain.vercel.app/
   Expected: "API Working"
   ```

2. **Test API routes:**
   ```
   GET https://your-domain.vercel.app/api/food
   GET https://your-domain.vercel.app/api/user
   ```

3. **Test images:**
   ```
   GET https://your-domain.vercel.app/images/filename.jpg
   ```

## 📝 Lưu ý quan trọng

- **Environment Variables**: Đảm bảo `MONGODB_URL`, `JWT_SECRET` đã được set trong Vercel
- **Database**: MongoDB Atlas phải allow connections từ Vercel IPs
- **File Uploads**: Vercel là serverless, files sẽ không persist giữa các requests

## 🎯 Kết quả mong đợi

Sau khi fix:
- ✅ Database kết nối thành công
- ✅ Tất cả API routes hoạt động
- ✅ Không còn lỗi 500
- ✅ Backend chạy ổn định trên Vercel
