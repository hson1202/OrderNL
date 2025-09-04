# Blog Management System

## Tổng quan
Hệ thống quản lý blog đã được thêm vào admin panel với đầy đủ chức năng CRUD (Create, Read, Update, Delete).

## Tính năng chính

### 1. Quản lý Blog Posts
- **Thêm blog mới**: Tạo bài viết với title, content, excerpt, author, tags
- **Chỉnh sửa blog**: Cập nhật thông tin bài viết
- **Xóa blog**: Xóa bài viết khỏi hệ thống
- **Upload hình ảnh**: Hỗ trợ upload hình ảnh cho blog

### 2. Trạng thái Blog
- **Draft**: Bài viết nháp, chưa xuất bản
- **Published**: Bài viết đã xuất bản, có thể xem công khai
- **Featured**: Đánh dấu bài viết nổi bật

### 3. Tìm kiếm và Lọc
- Tìm kiếm theo title, content, tags
- Lọc theo trạng thái (All, Published, Draft)
- Hiển thị thống kê tổng quan

### 4. Thống kê
- Tổng số blog
- Số blog đã xuất bản
- Số blog nháp
- Số blog nổi bật
- Tổng lượt xem

## Cấu trúc Database

### Blog Model
```javascript
{
  title: String (required),
  content: String (required),
  excerpt: String (required, max 200 chars),
  author: String (default: "Admin"),
  image: String (optional),
  tags: [String],
  status: String (enum: ['draft', 'published']),
  featured: Boolean (default: false),
  views: Number (default: 0),
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Blog Routes
- `GET /api/blog/list` - Lấy danh sách blog
- `GET /api/blog/stats` - Lấy thống kê blog
- `GET /api/blog/:id` - Lấy chi tiết blog
- `POST /api/blog/add` - Thêm blog mới
- `PUT /api/blog/:id` - Cập nhật blog
- `DELETE /api/blog/:id` - Xóa blog
- `PUT /api/blog/:id/status` - Toggle trạng thái
- `PUT /api/blog/:id/featured` - Toggle featured

## Cách sử dụng

### 1. Truy cập Blog Management
- Đăng nhập vào Admin Panel
- Click vào menu "Blog" trong sidebar

### 2. Thêm Blog Mới
- Click nút "+ Add New Blog"
- Điền thông tin:
  - **Title**: Tiêu đề bài viết (bắt buộc)
  - **Content**: Nội dung bài viết (bắt buộc)
  - **Excerpt**: Tóm tắt ngắn (bắt buộc, tối đa 200 ký tự)
  - **Author**: Tác giả (mặc định: Admin)
  - **Tags**: Thẻ phân loại (phân cách bằng dấu phẩy)
  - **Status**: Trạng thái (Draft/Published)
  - **Image**: Hình ảnh bài viết (tùy chọn)
  - **Featured**: Đánh dấu nổi bật
- Click "Add Blog" để lưu

### 3. Quản lý Blog
- **Edit**: Chỉnh sửa thông tin blog
- **Delete**: Xóa blog
- **Status Toggle**: Chuyển đổi trạng thái Draft/Published
- **Featured Toggle**: Đánh dấu/bỏ đánh dấu nổi bật

### 4. Tìm kiếm và Lọc
- Sử dụng ô tìm kiếm để tìm blog theo title, content, tags
- Sử dụng dropdown để lọc theo trạng thái

## Lưu ý kỹ thuật

### Backend
- Sử dụng Multer để xử lý upload file
- Hỗ trợ các định dạng hình ảnh: jpg, jpeg, png, gif
- Giới hạn kích thước file: 5MB
- Tự động xóa hình ảnh cũ khi cập nhật

### Frontend
- Responsive design cho mobile và desktop
- Real-time character count cho excerpt
- Loading states và error handling
- Toast notifications cho user feedback

### Security
- Validation input data
- File type validation
- File size limits
- XSS protection

## Troubleshooting

### Lỗi thường gặp
1. **Upload image failed**: Kiểm tra định dạng file và kích thước
2. **Validation error**: Đảm bảo điền đầy đủ các trường bắt buộc
3. **Network error**: Kiểm tra kết nối backend

### Debug
- Kiểm tra console browser cho lỗi frontend
- Kiểm tra server logs cho lỗi backend
- Verify database connection

## Tương lai
- Rich text editor cho content
- SEO optimization
- Blog categories
- Comment system
- Social media sharing
- Analytics dashboard 