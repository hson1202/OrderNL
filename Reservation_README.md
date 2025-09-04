# Chức Năng Đặt Chỗ (Table Reservation) - VIET BOWLS

## Tổng Quan

Chức năng đặt chỗ cho phép khách hàng đặt bàn trước tại nhà hàng VIET BOWLS thông qua website. Hệ thống bao gồm:

- **Frontend**: Form đặt chỗ trong trang Contact Us
- **Backend**: API xử lý đặt chỗ
- **Admin Panel**: Quản lý và theo dõi đặt chỗ
- **Database**: Lưu trữ thông tin đặt chỗ
- **Email Service**: Gửi email confirmation và status updates

## Tính Năng Chính

### 1. Khách Hàng (Frontend)
- ✅ Đặt bàn với thông tin cá nhân
- ✅ Chọn ngày và giờ theo business hours
- ✅ Chọn số lượng người
- ✅ Ghi chú đặc biệt
- ✅ Validation form real-time
- ✅ Loading states và error handling
- ✅ Success messages
- ✅ Dynamic time slots based on selected date
- ✅ Business hours display

### 2. Admin (Admin Panel)
- ✅ Xem danh sách tất cả đặt chỗ
- ✅ Cập nhật trạng thái đặt chỗ
- ✅ Thêm ghi chú admin
- ✅ Xóa đặt chỗ
- ✅ Tìm kiếm và lọc theo trạng thái
- ✅ Thống kê tổng quan
- ✅ Responsive design

### 3. Backend API
- ✅ Tạo đặt chỗ mới
- ✅ Lấy danh sách đặt chỗ
- ✅ Cập nhật trạng thái
- ✅ Xóa đặt chỗ
- ✅ Validation dữ liệu
- ✅ Error handling
- ✅ Authentication & Authorization
- ✅ Email confirmation service
- ✅ Business hours validation

## Giờ Mở Cửa

### Business Hours
- **Thứ 2 - Thứ 7**: 11:00 AM - 8:00 PM
- **Chủ nhật**: 11:00 AM - 5:00 PM

### Time Slots
- **Thứ 2 - Thứ 7**: 11:00, 11:30, 12:00, 12:30, 13:00, 13:30, 14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00, 17:30, 18:00, 18:30, 19:00, 19:30
- **Chủ nhật**: 11:00, 11:30, 12:00, 12:30, 13:00, 13:30, 14:00, 14:30, 15:00, 15:30, 16:00, 16:30

## Cấu Trúc Database

### Reservation Model
```javascript
{
  customerName: String (required),
  phone: String (required),
  email: String (required),
  reservationDate: Date (required),
  reservationTime: String (required),
  numberOfPeople: Number (required, 1-20),
  note: String (optional),
  status: String (pending/confirmed/cancelled/completed),
  adminNote: String (optional),
  confirmedBy: ObjectId (ref: user),
  confirmedAt: Date,
  timestamps: true
}
```

## API Endpoints

### Public Routes
- `POST /api/reservation/create` - Tạo đặt chỗ mới
- `GET /api/reservation/:id` - Lấy thông tin đặt chỗ theo ID
- `GET /api/reservation/time-slots/:date` - Lấy time slots khả dụng cho ngày cụ thể

### Admin Routes (Yêu cầu authentication)
- `GET /api/reservation` - Lấy tất cả đặt chỗ
- `GET /api/reservation/date-range` - Lấy đặt chỗ theo khoảng ngày
- `PUT /api/reservation/:id/status` - Cập nhật trạng thái
- `DELETE /api/reservation/:id` - Xóa đặt chỗ

## Email Service

### Tính Năng Email
- ✅ **Confirmation Email**: Gửi khi tạo đặt chỗ mới
- ✅ **Status Update Email**: Gửi khi admin cập nhật trạng thái
- ✅ **HTML & Plain Text**: Hỗ trợ cả hai format
- ✅ **Professional Design**: Template email đẹp mắt
- ✅ **Error Handling**: Không làm fail reservation nếu email lỗi

### Cấu Hình Email
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
EMAIL_APP_PASSWORD=your_gmail_app_password
```

### Gmail Setup
1. Enable 2-factor authentication
2. Generate App Password
3. Use App Password thay vì password thường

## Cách Sử Dụng

### 1. Khách Hàng Đặt Chỗ
1. Truy cập trang Contact Us
2. Chọn tab "Make a Reservation"
3. Chọn ngày (không thể chọn ngày trong quá khứ)
4. Chọn giờ theo business hours
5. Điền thông tin cá nhân
6. Chọn số lượng người
7. Thêm ghi chú (nếu cần)
8. Nhấn "Book Table"
9. Kiểm tra email confirmation

### 2. Admin Quản Lý
1. Đăng nhập Admin Panel
2. Vào mục "Reservations"
3. Xem danh sách đặt chỗ
4. Cập nhật trạng thái khi cần
5. Thêm ghi chú admin
6. Xóa đặt chỗ không hợp lệ
7. Hệ thống tự động gửi email status update

## Validation Rules

### Frontend Validation
- Tên: Tối thiểu 2 ký tự
- Email: Định dạng email hợp lệ
- Số điện thoại: Định dạng số điện thoại hợp lệ
- Ngày: Không thể chọn ngày trong quá khứ
- Giờ: Theo business hours của từng ngày
- Số người: 1-20 người

### Backend Validation
- Kiểm tra trùng lặp đặt chỗ
- Validation business hours theo ngày
- Sanitize dữ liệu đầu vào
- Kiểm tra quyền truy cập
- Validation ngày không được trong quá khứ

## Trạng Thái Đặt Chỗ

1. **Pending** - Chờ xác nhận
2. **Confirmed** - Đã xác nhận
3. **Cancelled** - Đã hủy
4. **Completed** - Hoàn thành

## Tính Năng Bổ Sung

### Đã Implement
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling
- ✅ Success messages
- ✅ Responsive design
- ✅ Search và filter
- ✅ Admin notifications
- ✅ Database constraints
- ✅ Business hours validation
- ✅ Dynamic time slots
- ✅ Email confirmation
- ✅ Status update emails
- ✅ Past date prevention

### Có Thể Bổ Sung Trong Tương Lai
- 📱 SMS notification
- 📅 Calendar view
- 🔔 Real-time updates
- 📊 Analytics dashboard
- 💳 Payment integration
- 📱 Mobile app
- 📧 Email templates customization
- 🔄 Auto-reminder emails

## Cài Đặt và Chạy

### 1. Backend
```bash
cd Backend
npm install
# Cấu hình .env file với email settings
npm run dev
```

### 2. Frontend
```bash
cd Frontend
npm install
npm run dev
```

### 3. Admin Panel
```bash
cd Admin
npm install
npm run dev
```

### 4. Database
- Đảm bảo MongoDB đang chạy
- Kiểm tra biến môi trường MONGODB_URL

### 5. Email Configuration
```bash
# Tạo file .env trong thư mục Backend
cp .env.example .env
# Chỉnh sửa .env với thông tin email của bạn
```

## Biến Môi Trường

```env
# Database
MONGODB_URL=mongodb://localhost:27017/vietbowls

# JWT
JWT_SECRET=your_jwt_secret

# Environment
NODE_ENV=development

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
EMAIL_APP_PASSWORD=your_gmail_app_password
```

## Troubleshooting

### Lỗi Thường Gặp

1. **Không thể kết nối database**
   - Kiểm tra MongoDB service
   - Kiểm tra MONGODB_URL

2. **API không hoạt động**
   - Kiểm tra server đang chạy
   - Kiểm tra CORS settings

3. **Form validation không hoạt động**
   - Kiểm tra JavaScript console
   - Kiểm tra network requests

4. **Admin không thể đăng nhập**
   - Kiểm tra JWT_SECRET
   - Kiểm tra user role trong database

5. **Email không gửi được**
   - Kiểm tra email credentials
   - Kiểm tra Gmail App Password
   - Kiểm tra 2FA đã enable

## Bảo Mật

- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Input validation
- ✅ SQL injection protection
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Email validation

## Performance

- ✅ Database indexing
- ✅ Pagination support
- ✅ Efficient queries
- ✅ Caching ready
- ✅ Optimized images
- ✅ Email queuing ready

## Testing

### Manual Testing
1. Test form validation
2. Test API endpoints
3. Test admin functions
4. Test responsive design
5. Test error scenarios
6. Test email sending
7. Test business hours validation
8. Test past date prevention

### Automated Testing (Có thể bổ sung)
- Unit tests
- Integration tests
- E2E tests
- Performance tests
- Email service tests

## Deployment

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Configure production database
- [ ] Set secure JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up monitoring
- [ ] Backup strategy
- [ ] Configure production email service
- [ ] Test email functionality

## Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs
2. Kiểm tra database connection
3. Kiểm tra network requests
4. Kiểm tra email configuration
5. Liên hệ development team

---

**Version**: 2.0.0  
**Last Updated**: December 2024  
**Maintained by**: VIET BOWLS Development Team
