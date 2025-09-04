# 🌐 Hướng dẫn Setup Domain cho Vercel

## 🎯 **Tổng quan**

Vercel cho phép bạn sử dụng domain tùy chỉnh thay vì domain mặc định `*.vercel.app`. Có 2 cách:
1. **Mua domain từ Vercel** (dễ nhất)
2. **Sử dụng domain có sẵn** (từ GoDaddy, Namecheap, etc.)

## 🛒 **Cách 1: Mua domain trực tiếp từ Vercel**

### **Bước 1: Vào Vercel Dashboard**
1. Login vào [vercel.com](https://vercel.com)
2. Chọn project cần setup domain
3. Vào tab **"Domains"**

### **Bước 2: Mua domain**
1. Click **"Add Domain"**
2. Nhập tên domain muốn mua (ví dụ: `vietbowls.com`)
3. Chọn **"Buy"** nếu domain available
4. Thanh toán (khoảng $15-20/năm)

### **Bước 3: Auto setup**
- Vercel sẽ tự động config DNS
- Domain sẽ active trong vài phút
- ✅ **Xong!** Không cần làm gì thêm

## 🔗 **Cách 2: Sử dụng domain có sẵn**

### **Bước 1: Thêm domain vào Vercel**
1. Vào Vercel Dashboard → Project → **Domains**
2. Click **"Add Domain"**
3. Nhập domain của bạn (ví dụ: `yourdomain.com`)
4. Click **"Add"**

### **Bước 2: Cấu hình DNS**

Vercel sẽ hiển thị thông tin DNS cần setup:

#### **Cho Root Domain (yourdomain.com):**
```
Type: A
Name: @
Value: 76.76.19.61
```

#### **Cho Subdomain (www.yourdomain.com):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### **Bước 3: Setup DNS tại nhà cung cấp domain**

#### **GoDaddy:**
1. Login GoDaddy → My Products → DNS
2. Thêm/sửa records:
   - **A Record**: `@` → `76.76.19.61`
   - **CNAME**: `www` → `cname.vercel-dns.com`

#### **Namecheap:**
1. Domain List → Manage → Advanced DNS
2. Thêm records:
   - **A Record**: `@` → `76.76.19.61`
   - **CNAME Record**: `www` → `cname.vercel-dns.com`

#### **Cloudflare:**
1. DNS → Records
2. Add records:
   - **A**: `yourdomain.com` → `76.76.19.61`
   - **CNAME**: `www` → `cname.vercel-dns.com`

### **Bước 4: Verify domain**
1. Quay lại Vercel Dashboard
2. Click **"Verify"** 
3. Đợi 24-48h để DNS propagate

## 🏗️ **Setup cho dự án Food Delivery**

### **Gợi ý tên domain:**
- `vietbowls.com` (tên brand)
- `fooddelivery-vn.com`
- `orderfood-online.com`
- `vietnamesefood-delivery.com`

### **Cấu trúc subdomain khuyến nghị:**

```
Main Website (Frontend): https://vietbowls.com
Admin Panel: https://admin.vietbowls.com
API Backend: https://api.vietbowls.com
```

### **Setup từng phần:**

#### **1. Frontend (Main Website):**
```bash
# Vercel Dashboard → Frontend Project → Domains
# Add: vietbowls.com
# Add: www.vietbowls.com
```

#### **2. Admin Panel:**
```bash
# Vercel Dashboard → Admin Project → Domains  
# Add: admin.vietbowls.com
```

#### **3. Backend API:**
```bash
# Vercel Dashboard → Backend Project → Domains
# Add: api.vietbowls.com
```

## 🔧 **Cập nhật code sau khi có domain**

### **Frontend config:**
```javascript
// Frontend/src/config/config.js
const config = {
  BACKEND_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.vietbowls.com'  // ← Domain mới
    : 'http://localhost:4000',
};
```

### **Admin config:**
```javascript
// Admin/src/App.jsx
const url = process.env.NODE_ENV === 'production' 
  ? 'https://api.vietbowls.com'  // ← Domain mới
  : 'http://localhost:4000'
```

### **Backend CORS config:**
```javascript
// Backend/server.js
app.use(cors({
  origin: [
    'https://vietbowls.com',
    'https://www.vietbowls.com', 
    'https://admin.vietbowls.com',
    'http://localhost:3000'  // cho development
  ],
  credentials: true
}))
```

## 📧 **Setup Email với domain**

### **1. Email forwarding (miễn phí):**
- Vercel Pro plan: email forwarding tự động
- Hoặc dùng Cloudflare Email Routing (free)

### **2. Professional email:**
```
Google Workspace: $6/user/month
Microsoft 365: $5/user/month
Zoho Mail: $1/user/month
```

### **3. Email addresses gợi ý:**
```
admin@vietbowls.com
support@vietbowls.com  
orders@vietbowls.com
info@vietbowls.com
```

## 🛡️ **SSL Certificate**

### **Tự động với Vercel:**
- Vercel tự động cấp SSL certificate (Let's Encrypt)
- Tự động renew
- HTTPS được force redirect

### **Custom SSL (nếu cần):**
- Upload certificate trong Vercel Dashboard
- Chỉ cần thiết cho enterprise

## 🧪 **Testing sau khi setup**

### **1. DNS Propagation check:**
```bash
# Check A record
nslookup vietbowls.com

# Check CNAME
nslookup www.vietbowls.com

# Online tools:
# https://www.whatsmydns.net/
# https://dnschecker.org/
```

### **2. Website accessibility:**
```bash
curl -I https://vietbowls.com
curl -I https://www.vietbowls.com
curl -I https://admin.vietbowls.com
curl -I https://api.vietbowls.com
```

### **3. SSL check:**
```bash
# Check SSL certificate
openssl s_client -connect vietbowls.com:443

# Online tool:
# https://www.ssllabs.com/ssltest/
```

## 💰 **Chi phí ước tính**

### **Domain costs:**
```
.com: $10-15/năm
.net: $12-18/năm
.org: $12-18/năm
.vn: $15-25/năm
```

### **Vercel hosting:**
```
Hobby (Free): 
- 100GB bandwidth/month
- Serverless functions
- Custom domains

Pro ($20/month):
- 1TB bandwidth
- Advanced analytics
- Team collaboration
```

## 🔄 **Migration checklist**

- [ ] Mua/setup domain
- [ ] Cấu hình DNS records
- [ ] Verify domain trong Vercel
- [ ] Cập nhật backend URL trong code
- [ ] Setup CORS cho domain mới
- [ ] Test tất cả endpoints
- [ ] Setup email forwarding
- [ ] Cập nhật Google Analytics/Search Console
- [ ] Thông báo domain mới cho users

## 🚨 **Troubleshooting**

### **Domain không resolve:**
- Đợi DNS propagate (24-48h)
- Check DNS records đúng chưa
- Clear browser cache

### **SSL errors:**
- Đợi Vercel generate certificate
- Check mixed content (HTTP resources on HTTPS)

### **CORS errors:**
- Cập nhật CORS config trong backend
- Redeploy backend sau khi sửa

---
**💡 Pro tip:** Dùng subdomain cho từng service giúp dễ quản lý và scale sau này!
