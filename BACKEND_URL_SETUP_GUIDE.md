# 🔗 Hướng dẫn thay đổi Backend URL

## 📍 **Khi nào cần thay đổi Backend URL?**

- Deploy backend lên domain mới
- Chuyển từ localhost sang production
- Thay đổi hosting provider
- Setup environment khác (staging, production)

## 📂 **Các file cần sửa**

### 1. **Frontend** - `Frontend/src/config/config.js`
```javascript
const config = {
  BACKEND_URL: process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_BACKEND_URL || 'https://your-new-backend-url.vercel.app'  // ← SỬA ĐÂY
    : 'http://localhost:4000',
  // ... rest of config
};
```

### 2. **Admin Panel** - `Admin/src/App.jsx`
```javascript
const App = () => {
  const url = process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_BACKEND_URL || 'https://your-new-backend-url.vercel.app'  // ← SỬA ĐÂY
    : 'http://localhost:4000'
  // ... rest of code
}
```

## 🔄 **Quy trình thay đổi**

### **Bước 1: Lấy Backend URL mới**
- Vào Vercel Dashboard → Backend project
- Copy URL deployment (ví dụ: `https://food-del-backend-xyz123.vercel.app`)

### **Bước 2: Cập nhật code**
```bash
# Mở các file và thay URL:
# 1. Frontend/src/config/config.js
# 2. Admin/src/App.jsx

# Thay thế:
'https://food-del-backend-orcin.vercel.app'
# Thành:
'https://your-new-backend-url.vercel.app'
```

### **Bước 3: Commit và push**
```bash
git add .
git commit -m "Update backend URL to new deployment"
git push origin main
```

### **Bước 4: Redeploy Frontend & Admin**
- Vercel sẽ tự động deploy sau khi push
- Hoặc manual deploy từ Vercel dashboard

## 🎯 **Template nhanh**

### **Tìm và thay thế toàn bộ project:**
```bash
# Tìm tất cả file chứa backend URL cũ
grep -r "food-del-backend-orcin.vercel.app" .

# Hoặc tìm pattern chung
grep -r "vercel.app" Frontend/ Admin/
```

### **Sử dụng VS Code Find & Replace:**
1. Ctrl+Shift+H (Find & Replace in Files)
2. Find: `https://food-del-backend-orcin.vercel.app`
3. Replace: `https://your-new-backend-url.vercel.app`
4. Replace All

## ⚙️ **Sử dụng Environment Variables (Khuyến nghị)**

### **Cách setup để không cần sửa code mỗi lần:**

1. **Tạo file `.env` trong Frontend:**
```env
REACT_APP_BACKEND_URL=https://your-backend-url.vercel.app
```

2. **Tạo file `.env` trong Admin:**
```env
REACT_APP_BACKEND_URL=https://your-backend-url.vercel.app
```

3. **Setup trên Vercel:**
- Vào Settings → Environment Variables
- Add: `REACT_APP_BACKEND_URL` = `https://your-backend-url.vercel.app`

### **Code sẽ tự động dùng env variable:**
```javascript
// Đã có sẵn trong code:
process.env.REACT_APP_BACKEND_URL || 'https://fallback-url.vercel.app'
```

## 🧪 **Cách test sau khi thay**

### **1. Test Backend trực tiếp:**
```bash
curl https://your-new-backend-url.vercel.app/health
curl https://your-new-backend-url.vercel.app/api/food/list
```

### **2. Test Frontend:**
- Mở DevTools → Network tab
- Reload trang → kiểm tra API calls có gọi đúng URL không

### **3. Test Admin:**
- Login admin panel
- Kiểm tra các chức năng CRUD

## 🚨 **Checklist hoàn thành**

- [ ] Cập nhật `Frontend/src/config/config.js`
- [ ] Cập nhật `Admin/src/App.jsx`
- [ ] Git commit và push
- [ ] Redeploy Frontend trên Vercel
- [ ] Redeploy Admin trên Vercel
- [ ] Test API calls trong DevTools
- [ ] Test các chức năng chính

## 📝 **Lưu ý quan trọng**

- **Luôn test localhost trước:** Đảm bảo backend chạy local OK
- **Kiểm tra CORS:** Backend phải allow frontend domain
- **Environment Variables:** Ưu tiên dùng env vars thay vì hardcode
- **Backup:** Lưu URL cũ để rollback nếu cần

## 🔍 **Troubleshooting**

### **Lỗi thường gặp:**

1. **CORS Error:**
```javascript
// Backend server.js - thêm specific origins
app.use(cors({
  origin: ['https://your-frontend-domain.vercel.app'],
  credentials: true
}))
```

2. **404 Not Found:**
- Kiểm tra backend URL có đúng không
- Kiểm tra API endpoints có hoạt động không

3. **Network Error:**
- Kiểm tra backend có deploy thành công không
- Kiểm tra Vercel function logs

### **Debug commands:**
```bash
# Kiểm tra build có lỗi không
npm run build

# Test API trực tiếp
curl -X GET https://your-backend-url.vercel.app/api/food/list
```

---
**💡 Tip:** Bookmark file này để lần sau thay URL nhanh hơn!
