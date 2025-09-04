# 🖼️ Fix Cloudinary Upload Issues

## 🚨 **Các vấn đề thường gặp với Cloudinary trên Vercel**

### **1. Environment Variables không được set**
### **2. Cloudinary credentials không đúng**  
### **3. File size limit vượt quá**
### **4. Network timeout trên Vercel**
### **5. CORS issues với Cloudinary**

## 🔍 **Debug Steps**

### **Bước 1: Kiểm tra Environment Variables**

Vào **Vercel Dashboard** → **Backend Project** → **Settings** → **Environment Variables**

Cần có đầy đủ 3 biến:
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key  
CLOUDINARY_API_SECRET=your-api-secret
```

### **Bước 2: Test Cloudinary connection**

Thêm debug endpoint để test Cloudinary:

```javascript
// Backend/server.js - thêm endpoint debug
app.get("/debug-cloudinary", async (req, res) => {
  try {
    const cloudinary = (await import("./config/cloudinary.js")).default
    
    // Test cloudinary config
    const config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET ? "***configured***" : "missing"
    }
    
    // Test API call
    const result = await cloudinary.api.ping()
    
    res.json({
      success: true,
      message: "Cloudinary connection working",
      config: config,
      ping: result
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      config: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "missing",
        api_key: process.env.CLOUDINARY_API_KEY ? "***configured***" : "missing",
        api_secret: process.env.CLOUDINARY_API_SECRET ? "***configured***" : "missing"
      }
    })
  }
})
```

### **Bước 3: Test upload endpoint**

```javascript
// Backend/server.js - thêm test upload
app.post("/test-upload", upload.single("image"), (req, res) => {
  try {
    console.log("=== UPLOAD TEST DEBUG ===")
    console.log("File received:", req.file ? "YES" : "NO")
    console.log("File details:", req.file)
    console.log("Cloudinary response:", req.file?.path)
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded"
      })
    }
    
    res.json({
      success: true,
      message: "Upload successful",
      file: {
        url: req.file.path,
        public_id: req.file.filename,
        size: req.file.size
      }
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})
```

## 🔧 **Các Fix thường dùng**

### **Fix 1: Tăng timeout cho Vercel functions**

```json
// Backend/vercel.json
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
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "functions": {
    "server.js": {
      "maxDuration": 60
    }
  }
}
```

### **Fix 2: Giảm file size limit**

```javascript
// Backend/middleware/upload.js
export const upload = multer({
  storage,
  limits: { 
    fileSize: 2 * 1024 * 1024  // Giảm từ 5MB xuống 2MB
  }
})
```

### **Fix 3: Thêm error handling tốt hơn**

```javascript
// Backend/middleware/upload.js
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    try {
      return {
        folder: "food-delivery/uploads",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        use_filename: true,
        unique_filename: true,
        transformation: [{ width: 800, height: 800, crop: "limit" }] // Giảm size
      }
    } catch (error) {
      console.error("Cloudinary storage error:", error)
      throw error
    }
  }
})
```

### **Fix 4: Fallback upload method**

```javascript
// Backend/routes/uploadRoute.js - thêm fallback
router.post("/image", (req, res) => {
  const uploadSingle = upload.single("image")
  
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err)
      return res.status(500).json({
        success: false,
        error: "Upload failed: " + err.message
      })
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded"
      })
    }
    
    return res.json({
      success: true,
      url: req.file.path,
      public_id: req.file.filename
    })
  })
})
```

## 🧪 **Testing Commands**

### **1. Test Cloudinary connection:**
```bash
curl https://food-del-backend-4jjf.onrender.com/debug-cloudinary
```

### **2. Test file upload:**
```bash
curl -X POST \
  -F "image=@test-image.jpg" \
  https://food-del-backend-4jjf.onrender.com/test-upload
```

### **3. Test via Frontend:**
```javascript
// Browser DevTools Console
const formData = new FormData()
formData.append('image', fileInput.files[0])

fetch('https://your-backend-url.vercel.app/api/upload/image', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err))
```

## 🔄 **Alternative Solutions**

### **Option 1: Direct Frontend Upload**
```javascript
// Frontend upload trực tiếp lên Cloudinary
const uploadToCloudinary = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'your-preset') // Tạo unsigned preset
  
  const response = await fetch(
    'https://api.cloudinary.com/v1_1/your-cloud-name/image/upload',
    {
      method: 'POST',
      body: formData
    }
  )
  
  return response.json()
}
```

### **Option 2: Base64 Upload**
```javascript
// Convert file to base64 và gửi qua API
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}
```

## 🚨 **Common Errors & Solutions**

### **Error: "Invalid API Key"**
- Check CLOUDINARY_API_KEY trong environment variables
- Đảm bảo không có space hoặc ký tự đặc biệt

### **Error: "Request timeout"**
- Tăng maxDuration trong vercel.json
- Giảm file size limit
- Optimize image trước khi upload

### **Error: "Unauthorized"**
- Check CLOUDINARY_API_SECRET
- Đảm bảo Cloudinary account còn active

### **Error: "File too large"**
- Giảm file size limit trong multer
- Compress image ở frontend trước khi upload

## 📋 **Checklist Debug**

- [ ] Environment variables đã set đầy đủ trên Vercel
- [ ] Test /debug-cloudinary endpoint
- [ ] Test /test-upload endpoint  
- [ ] Check Vercel function logs
- [ ] Test với file nhỏ hơn (< 1MB)
- [ ] Check Network tab trong DevTools
- [ ] Verify Cloudinary dashboard có nhận file không

---
**💡 Tip:** Luôn test với file nhỏ trước, sau đó tăng dần size để tìm limit!
