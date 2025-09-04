# Google Maps Integration - VIET BOWLS

## Overview
Google Maps đã được tích hợp thành công vào trang ContactUs của website VIET BOWLS. Bản đồ hiển thị vị trí chính xác của nhà hàng tại Slovakia.

## Features
- ✅ Bản đồ Google Maps tương tác
- ✅ Vị trí chính xác của VIET BOWLS
- ✅ Responsive design cho mobile và desktop
- ✅ Tích hợp đa ngôn ngữ (Việt, Anh, Slovakia)
- ✅ Tối ưu hóa hiệu suất với lazy loading

## Implementation Details

### 1. Component Update
File: `Frontend/src/pages/ContactUs/ContactUs.jsx`
- Thay thế map placeholder bằng Google Maps iframe
- Sử dụng Google Maps Embed API
- Tích hợp với hệ thống đa ngôn ngữ

### 2. CSS Styling
File: `Frontend/src/pages/ContactUs/ContactUs.css`
- Responsive design cho bản đồ
- Border radius và shadow effects
- Mobile optimization (height: 300px trên tablet, 250px trên mobile)

### 3. Google Maps URL
```
https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7259.207931926322!2d17.8716162!3d48.1491049!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476b6d006b93bc13%3A0x625b631240812045!2sVIET%20BOWLS!5e1!3m2!1svi!2s!4v1754748088309!5m2!1svi!2s
```

### 4. Location Details
- **Tên nhà hàng**: VIET BOWLS
- **Tọa độ**: 48.1491049°N, 17.8716162°E
- **Địa chỉ**: Slovakia
- **Ngôn ngữ**: Tiếng Việt (vi)

## Usage
1. Truy cập trang ContactUs: `/contact`
2. Cuộn xuống phần "Tìm chúng tôi" / "Find Us"
3. Bản đồ Google Maps sẽ hiển thị vị trí nhà hàng
4. Người dùng có thể:
   - Xem vị trí chính xác
   - Phóng to/thu nhỏ bản đồ
   - Xem đường đi
   - Tìm kiếm địa điểm xung quanh

## Responsive Design
- **Desktop**: 450px height
- **Tablet (≤768px)**: 300px height  
- **Mobile (≤480px)**: 250px height

## Internationalization
Bản đồ hỗ trợ đa ngôn ngữ:
- **Tiếng Việt**: "Tìm chúng tôi"
- **English**: "Find Us"  
- **Slovak**: "Nájdite nás"

## Technical Notes
- Sử dụng Google Maps Embed API (không cần API key)
- Lazy loading để tối ưu hiệu suất
- Cross-origin iframe với proper security attributes
- Responsive iframe với width: 100%

## Future Enhancements
- [ ] Thêm custom markers cho nhà hàng
- [ ] Tích hợp với Google Places API
- [ ] Thêm tính năng chỉ đường
- [ ] Custom styling cho bản đồ
- [ ] Thêm thông tin chi tiết về địa điểm

## Dependencies
- React 18.2.0
- CSS3 với media queries
- Google Maps Embed API (external)

## Browser Support
- ✅ Chrome (latest)
- ✅ Firefox (latest)  
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## Performance
- Lazy loading cho bản đồ
- Responsive images
- Optimized CSS với media queries
- Minimal JavaScript footprint

---
*Tích hợp hoàn thành vào: [Ngày hiện tại]*
*Phiên bản: 1.0.0*

