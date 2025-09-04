# Email Service Configuration

## Hiện tại (Chưa cấu hình email)

Hệ thống đã được sửa để **không crash** khi chưa có cấu hình email. Thay vào đó:

- ✅ **Reservation form** vẫn hoạt động bình thường
- ✅ **Contact form** vẫn hoạt động bình thường  
- ✅ **Dữ liệu vẫn được lưu vào database**
- ⚠️ **Email confirmation sẽ không được gửi**
- 📝 **Console sẽ hiển thị thông báo**: "Email service not configured"

## Console Logs

Khi submit form, bạn sẽ thấy:
```
⚠️ Email configuration not found. Emails will not be sent.
⚠️ Email not sent: Email service not configured
```

## Để bật email service sau này

### 1. Tạo file `.env` trong thư mục Backend
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@vietbowls.com
```

### 2. Cấu hình Gmail
- Bật 2-factor authentication
- Tạo App Password (không dùng password thường)
- Sử dụng App Password trong `.env`

### 3. Restart server
```bash
npm run dev
```

## Các function email đã được bảo vệ

- `sendReservationConfirmation()` - Gửi email xác nhận đặt bàn
- `sendStatusUpdateEmail()` - Gửi email cập nhật trạng thái
- `sendContactConfirmation()` - Gửi email xác nhận liên hệ
- `sendAdminNotification()` - Gửi thông báo cho admin

## Lợi ích của cách thiết kế này

1. **Không crash** khi chưa có email
2. **Dữ liệu vẫn được lưu** bình thường
3. **Dễ dàng bật email** sau này
4. **Log rõ ràng** để debug
5. **Graceful degradation** - hệ thống vẫn hoạt động

## Test hiện tại

Bạn có thể test:
- Submit reservation form → Dữ liệu được lưu, không có email
- Submit contact form → Dữ liệu được lưu, không có email
- Không có lỗi crash nào

Khi nào cần email, chỉ cần cấu hình `.env` và restart server là xong!
