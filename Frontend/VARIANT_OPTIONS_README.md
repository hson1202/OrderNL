# Variant Options System - Hệ Thống Tùy Chọn Sản Phẩm

## Tổng Quan

Hệ thống variant options cho phép mỗi món ăn có nhiều lựa chọn khác nhau (như loại protein, kích thước, độ cay, v.v.) với giá khác nhau và hình ảnh khác nhau cho từng option. Khi khách chọn option nào thì sẽ hiển thị hình ảnh tương ứng.

## Cấu Trúc Dữ Liệu

### Schema cho Product với Options

```json
{
  "_id": "product_id",
  "name": "Tên sản phẩm",
  "price": 0, // Giá gốc (có thể null nếu dùng override)
  "image": "hinh_anh_goc.jpg",
  "options": [
    {
      "name": "Tên option (VD: Protein, Kích thước)",
      "type": "select", // Loại option
      "defaultChoiceCode": "a", // Mã lựa chọn mặc định
      "choices": [
        {
          "code": "a",
          "label": "Mô tả lựa chọn",
          "price": 6.50,
          "image": "hinh_anh_option.jpg" // Hình ảnh cho option này
        }
      ],
      "pricingMode": "override" // hoặc "add"
    }
  ]
}
```

### Pricing Modes

#### 1. `override` - Ghi đè giá
- Sử dụng giá của option được chọn
- Bỏ qua giá gốc của sản phẩm
- Ví dụ: Pad Thai với gà (6.50€), với bò (7.00€)

#### 2. `add` - Cộng thêm vào giá gốc
- Giá cuối = Giá gốc + Giá option
- Ví dụ: Pho cơ bản (8.50€) + Size L (+1.50€) = 10.00€

## Tính Năng

### 1. Hiển Thị Trên Menu
- Sản phẩm có options sẽ hiển thị badge "Tùy chỉnh"
- Giá hiển thị dạng range (VD: €6.50 - €7.00)
- Hỗ trợ đa ngôn ngữ (VI, EN, SK)

### 2. Product Detail Popup
- Hiển thị tất cả options với radio buttons
- Mỗi choice hiển thị label và giá
- Hình ảnh thay đổi theo lựa chọn
- Giá cập nhật real-time khi chọn option

### 3. Cart Management
- Mỗi combination options tạo ra cart item riêng biệt
- Hiển thị options đã chọn trong cart
- Tính tổng tiền chính xác theo options

### 4. Responsive Design
- Giao diện tối ưu cho mobile và desktop
- Options hiển thị rõ ràng, dễ chọn

## Cách Sử Dụng

### 1. Tạo Sản Phẩm với Options

```javascript
// Ví dụ: Pad Thai với nhiều loại protein
const padThaiProduct = {
  name: "PAD THAI (480 g)",
  price: null, // Không dùng giá gốc
  options: [
    {
      name: "Protein",
      type: "select",
      defaultChoiceCode: "a",
      choices: [
        { 
          code: "a", 
          label: "a. s kuracím mäsom",   
          price: 6.50,
          image: "pad_thai_chicken.jpg"
        },
        { 
          code: "b", 
          label: "b. s hovädzím mäsom",  
          price: 7.00,
          image: "pad_thai_beef.jpg"
        }
      ],
      pricingMode: "override"
    }
  ]
}
```

### 2. Sản Phẩm với Multiple Options

```javascript
// Ví dụ: Pho với cả loại thịt và kích thước
const phoProduct = {
  name: "PHO BO (500 g)",
  price: 8.50, // Giá cơ bản
  options: [
    {
      name: "Maso",
      type: "select",
      defaultChoiceCode: "a",
      choices: [
        { code: "a", label: "Hovězí svíčková", price: 9.00, image: "pho_tenderloin.jpg" },
        { code: "b", label: "Hovězí bůček", price: 8.50, image: "pho_brisket.jpg" }
      ],
      pricingMode: "override"
    },
    {
      name: "Velikost",
      type: "select",
      defaultChoiceCode: "m",
      choices: [
        { code: "s", label: "S - Malá (400 g)", price: -1.00 },
        { code: "m", label: "M - Střední (500 g)", price: 0.00 },
        { code: "l", label: "L - Velká (600 g)", price: 1.50 }
      ],
      pricingMode: "add"
    }
  ]
}
```

## Backend Integration

### 1. API Endpoints
- `GET /api/food/list` - Trả về danh sách sản phẩm với options
- `POST /api/cart/add` - Thêm vào cart (cần cập nhật để hỗ trợ options)
- `POST /api/cart/remove` - Xóa khỏi cart

### 2. Database Schema
Cần cập nhật `foodModel.js` để hỗ trợ options:

```javascript
const foodSchema = new mongoose.Schema({
  // ... existing fields
  options: [{
    name: { type: String, required: true },
    type: { type: String, default: 'select' },
    defaultChoiceCode: String,
    choices: [{
      code: { type: String, required: true },
      label: { type: String, required: true },
      price: { type: Number, required: true },
      image: String
    }],
    pricingMode: { type: String, enum: ['override', 'add'], default: 'add' }
  }]
});
```

## Frontend Components

### 1. FoodItem
- Hiển thị badge "Tùy chỉnh" cho sản phẩm có options
- Hiển thị giá range
- Truyền options vào ProductDetail

### 2. ProductDetail
- Hiển thị options với radio buttons
- Cập nhật hình ảnh và giá theo lựa chọn
- Xử lý add to cart với options

### 3. CartPopup
- Hiển thị options đã chọn
- Tính tổng tiền chính xác
- Hỗ trợ quantity controls

### 4. StoreContext
- Quản lý cart items với options
- Tính tổng tiền theo options
- Lưu trữ thông tin đầy đủ của cart items

## Lưu Ý Kỹ Thuật

### 1. Cart Key Generation
```javascript
// Tạo unique key cho cart item với options
const cartKey = product.options && product.options.length > 0 
  ? `${product._id}_${JSON.stringify(selectedOptions)}`
  : product._id
```

### 2. Price Calculation
```javascript
// Tính giá theo pricingMode
if (option.pricingMode === 'override') {
  price = choice.price;
} else if (option.pricingMode === 'add') {
  price += choice.price;
}
```

### 3. Image Handling
```javascript
// Ưu tiên hình ảnh của option được chọn
const displayImage = currentImage || product.image;
```

## Testing

File `test-variant-data.json` chứa dữ liệu mẫu để test:
- Pad Thai với 4 loại protein
- Pho với loại thịt và kích thước
- Bun Cha với độ cay

## Tương Lai

### 1. Tính Năng Có Thể Thêm
- Multiple select options (chọn nhiều)
- Conditional options (option phụ thuộc vào option khác)
- Stock management cho từng variant
- Bulk import/export options

### 2. Performance Optimization
- Lazy loading cho hình ảnh options
- Caching cho price calculations
- Optimized cart operations

## Kết Luận

Hệ thống variant options này cung cấp trải nghiệm mua hàng linh hoạt và chuyên nghiệp, tương tự như các platform thương mại điện tử lớn. Khách hàng có thể dễ dàng tùy chỉnh món ăn theo sở thích và ngân sách của mình.
