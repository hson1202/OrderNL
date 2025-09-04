# Admin Panel - Variant Options Management

## Tổng Quan

Admin panel đã được cập nhật để hỗ trợ quản lý variant options cho từng món ăn. Admin có thể tạo, chỉnh sửa và xóa các options như loại protein, kích thước, độ cay, v.v.

## Tính Năng Mới

### 1. Thêm Món Ăn Mới với Options
- Form thêm món ăn mới có section "Variant Options"
- Có thể thêm nhiều options cho một món ăn
- Mỗi option có thể có nhiều choices (lựa chọn)

### 2. Quản Lý Options
- **Option Name**: Tên của option (VD: Protein, Size, Spiciness)
- **Pricing Mode**: 
  - `add`: Cộng thêm vào giá gốc
  - `override`: Ghi đè hoàn toàn giá gốc
- **Default Choice**: Lựa chọn mặc định khi khách hàng xem món ăn

### 3. Quản Lý Choices
- **Code**: Mã ngắn gọn (VD: a, b, c)
- **Label**: Mô tả chi tiết (VD: Chicken, Beef, Shrimp)
- **Price**: Giá của choice này
- **Image**: Hình ảnh tùy chọn cho choice

## Cách Sử Dụng

### Bước 1: Thêm Món Ăn Mới
1. Click "Add New Product" trong Admin panel
2. Điền thông tin cơ bản (SKU, tên, giá, category, v.v.)
3. Scroll xuống section "Variant Options"

### Bước 2: Tạo Option
1. Click "➕ Add Variant Option"
2. Điền tên option (VD: "Protein")
3. Chọn pricing mode:
   - **Add**: Giá cuối = Giá gốc + Giá choice
   - **Override**: Giá cuối = Giá choice (bỏ qua giá gốc)

### Bước 3: Thêm Choices
1. Trong section "Choices", điền thông tin choice:
   - **Code**: a, b, c, d
   - **Label**: "Chicken", "Beef", "Shrimp", "Tofu"
   - **Price**: 6.50, 7.00, 7.00, 6.50
   - **Image**: Upload hình ảnh (tùy chọn)
2. Click "Add Choice" để thêm choice
3. Lặp lại cho tất cả choices

### Bước 4: Chọn Default Choice
1. Sau khi có ít nhất 1 choice, chọn "Default Choice"
2. Đây là lựa chọn mặc định khi khách hàng xem món ăn

### Bước 5: Hoàn Thành Option
1. Click "Add Option" để lưu option
2. Option sẽ xuất hiện trong "Current Options"

### Bước 6: Thêm Nhiều Options (Tùy Chọn)
1. Lặp lại từ Bước 2 để thêm options khác
2. Ví dụ: thêm option "Size" với choices S, M, L

## Ví Dụ Thực Tế

### Pad Thai với Protein Options
```
Option Name: Protein
Pricing Mode: Override
Choices:
- Code: a, Label: "Chicken", Price: 6.50€
- Code: b, Label: "Beef", Price: 7.00€
- Code: c, Label: "Shrimp", Price: 7.00€
- Code: d, Label: "Tofu", Price: 6.50€
Default Choice: a (Chicken)
```

### Pho với Multiple Options
```
Option 1: Meat Type
- Pricing Mode: Override
- Choices: Tenderloin (9.00€), Brisket (8.50€), Shank (8.00€)

Option 2: Size
- Pricing Mode: Add
- Choices: S (-1.00€), M (0.00€), L (+1.50€)
```

## Chỉnh Sửa Options

### Edit Option
1. Trong "Current Options", click "✏️ Edit"
2. Thay đổi thông tin cần thiết
3. Click "Update Option"

### Edit Choice
1. Trong option form, click "✏️" bên cạnh choice
2. Thay đổi thông tin
3. Click "Update Choice"

### Delete Option/Choice
1. Click "🗑️" bên cạnh option hoặc choice
2. Xác nhận xóa

## Lưu Ý Quan Trọng

### 1. Validation
- Option name là bắt buộc
- Phải có ít nhất 1 choice
- Phải chọn default choice
- Choice code và label là bắt buộc
- Choice price phải là số hợp lệ

### 2. Pricing Logic
- **Add Mode**: Giá cuối = Giá gốc + Tổng giá các choices
- **Override Mode**: Giá cuối = Giá của choice được chọn
- Có thể kết hợp cả hai mode trong cùng một món ăn

### 3. Image Handling
- Hình ảnh choice là tùy chọn
- Nếu có hình ảnh, sẽ hiển thị icon 📷
- Hình ảnh sẽ thay đổi theo choice được chọn ở frontend

### 4. Data Structure
```json
{
  "options": [
    {
      "name": "Protein",
      "type": "select",
      "defaultChoiceCode": "a",
      "choices": [
        {
          "code": "a",
          "label": "Chicken",
          "price": 6.50,
          "image": "chicken.jpg"
        }
      ],
      "pricingMode": "override"
    }
  ]
}
```

## Backend Integration

### 1. Database Schema
- `foodModel.js` đã được cập nhật để hỗ trợ options
- Options được lưu dưới dạng array trong mỗi food document

### 2. API Endpoints
- `POST /api/food/add` - Hỗ trợ options trong request body
- `PUT /api/food/edit/:id` - Hỗ trợ cập nhật options

### 3. Data Flow
1. Admin tạo options trong form
2. Options được gửi dưới dạng JSON string
3. Backend parse JSON và lưu vào database
4. Frontend hiển thị options cho khách hàng

## Troubleshooting

### Lỗi Thường Gặp

1. **"Option name is required"**
   - Điền tên option

2. **"At least one choice is required"**
   - Thêm ít nhất 1 choice trước khi lưu option

3. **"Default choice is required"**
   - Chọn default choice từ dropdown

4. **"Choice code is required"**
   - Điền code cho choice (VD: a, b, c)

5. **"Choice label is required"**
   - Điền mô tả cho choice

### Kiểm Tra Data
- Sử dụng MongoDB Compass để xem options trong database
- Kiểm tra console log khi add/edit product
- Verify options được gửi đúng format trong request

## Kết Luận

Với hệ thống variant options mới, admin có thể:
- Tạo món ăn với nhiều lựa chọn khác nhau
- Quản lý giá cả linh hoạt (add/override)
- Cung cấp trải nghiệm mua hàng chuyên nghiệp
- Dễ dàng mở rộng menu với các biến thể

Hệ thống này tương tự như các platform thương mại điện tử lớn, giúp tăng doanh thu và cải thiện trải nghiệm khách hàng.
