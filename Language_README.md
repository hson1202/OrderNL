# Hướng dẫn sử dụng tính năng Đa ngôn ngữ (Multi-language)

## Tổng quan

Hệ thống đã được tích hợp tính năng đa ngôn ngữ hoàn chỉnh với 3 ngôn ngữ chính:
- **Tiếng Việt (vi)**: Ngôn ngữ mặc định
- **Tiếng Anh (en)**: Ngôn ngữ thứ hai
- **Tiếng Slovakia (sk)**: Ngôn ngữ thứ ba

## Các tính năng đã implement

### 1. Static Content (Nội dung cố định)
- **i18n Integration**: Sử dụng thư viện `react-i18next` cho cả Admin Panel và Frontend
- **Language Switcher**: Component chuyển đổi ngôn ngữ với giao diện đẹp
- **Auto Detection**: Tự động phát hiện ngôn ngữ từ browser và localStorage
- **Persistent**: Lưu trữ lựa chọn ngôn ngữ trong localStorage

### 2. Dynamic Content (Nội dung động)
- **Products**: Mỗi sản phẩm có field `language` riêng
- **Categories**: Mỗi danh mục có field `language` riêng  
- **Blog Posts**: Mỗi bài viết có field `language` riêng
- **Filter by Language**: Lọc nội dung theo ngôn ngữ trong Admin Panel

## Cách sử dụng

### 1. Chuyển đổi ngôn ngữ giao diện

#### Admin Panel:
- Click vào icon flag (🇻🇳/🇺🇸/🇸🇰) ở góc trên bên phải navbar
- Chọn "Tiếng Việt", "English", hoặc "Slovak"
- Giao diện sẽ thay đổi ngay lập tức

#### Frontend:
- Click vào icon flag (🇻🇳/🇺🇸/🇸🇰) ở navbar
- Chọn "Tiếng Việt", "English", hoặc "Slovak"
- Toàn bộ text cố định sẽ được dịch

### 2. Quản lý nội dung đa ngôn ngữ

#### Thêm sản phẩm với ngôn ngữ:
1. Vào Admin Panel → Products
2. Click "Thêm sản phẩm mới"
3. Điền thông tin sản phẩm
4. **Chọn ngôn ngữ** trong dropdown "Ngôn ngữ"
5. Click "Thêm sản phẩm"

#### Lọc sản phẩm theo ngôn ngữ:
1. Trong trang Products
2. Sử dụng dropdown "All Languages" 
3. Chọn "Tiếng Việt", "English", hoặc "Slovak"
4. Danh sách sẽ chỉ hiển thị sản phẩm của ngôn ngữ đó

#### Lọc bài viết theo ngôn ngữ:
1. Trong trang Blog
2. Sử dụng dropdown "All Languages"
3. Chọn "Tiếng Việt", "English", hoặc "Slovak"
4. Danh sách sẽ chỉ hiển thị bài viết của ngôn ngữ đó

### 3. Cấu trúc Database

#### Food Model:
```javascript
{
  // ... other fields
  language: { 
    type: String, 
    enum: ['vi', 'en', 'sk'], 
    default: 'vi',
    required: true 
  }
}
```

#### Category Model:
```javascript
{
  // ... other fields
  language: { 
    type: String, 
    enum: ['vi', 'en', 'sk'], 
    default: 'vi',
    required: true 
  }
}
```

#### Blog Model:
```javascript
{
  // ... other fields
  language: {
    type: String,
    enum: ['vi', 'en', 'sk'],
    default: 'vi',
    required: true
  }
}
```

## API Endpoints

### Products API:
- `GET /api/food/list?language=vi` - Lấy sản phẩm theo ngôn ngữ
- `POST /api/food/add` - Thêm sản phẩm với field `language`

### Categories API:
- `GET /api/category?language=vi` - Lấy danh mục theo ngôn ngữ
- `POST /api/category/add` - Thêm danh mục với field `language`

### Blog API:
- `GET /api/blog/list?language=vi` - Lấy bài viết theo ngôn ngữ
- `POST /api/blog/add` - Thêm bài viết với field `language`

## Cấu hình i18n

### File cấu hình:
- **Admin**: `Admin/src/i18n.js`
- **Frontend**: `Frontend/src/i18n.js`

### Thêm translation mới:
```javascript
// Trong file i18n.js
const resources = {
  vi: {
    translation: {
      'new.key': 'Giá trị tiếng Việt'
    }
  },
  en: {
    translation: {
      'new.key': 'English value'
    }
  }
}
```

### Sử dụng trong component:
```javascript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return <div>{t('new.key')}</div>;
};
```

## Best Practices

### 1. Naming Convention
- Sử dụng dot notation: `section.subsection.key`
- Ví dụ: `products.title`, `nav.home`, `common.save`

### 2. Organization
- Nhóm translation theo chức năng
- Sử dụng comment để phân chia rõ ràng

### 3. Dynamic Content
- Mỗi item (product, category, blog) nên có field `language`
- Luôn filter theo ngôn ngữ khi query database
- Hiển thị language badge trong admin panel

### 4. User Experience
- Language switcher dễ tìm và sử dụng
- Lưu trữ lựa chọn ngôn ngữ
- Tự động phát hiện ngôn ngữ browser

## Troubleshooting

### 1. Translation không hiển thị
- Kiểm tra key có đúng không
- Kiểm tra file i18n.js có import đúng không
- Kiểm tra component có sử dụng `useTranslation` không

### 2. Language không lưu
- Kiểm tra localStorage có hoạt động không
- Kiểm tra cấu hình detection trong i18n

### 3. Filter không hoạt động
- Kiểm tra API endpoint có hỗ trợ parameter `language` không
- Kiểm tra frontend có gửi đúng parameter không

## Future Enhancements

### 1. Thêm ngôn ngữ mới
- Thêm ngôn ngữ vào enum trong models
- Thêm translation resources
- Cập nhật language switcher

### 2. SEO Optimization
- URL với ngôn ngữ: `/vi/products`, `/en/products`
- Meta tags đa ngôn ngữ
- Sitemap đa ngôn ngữ

### 3. Content Management
- Editor đa ngôn ngữ
- Auto-translation với Google Translate API
- Translation memory

### 4. Analytics
- Track ngôn ngữ được sử dụng
- A/B testing cho different languages
- User behavior analysis per language

## Kết luận

Tính năng đa ngôn ngữ đã được implement hoàn chỉnh với:
- ✅ Static content translation
- ✅ Dynamic content per language
- ✅ Language switching UI
- ✅ Database support
- ✅ API filtering
- ✅ Persistent language preference

Hệ thống sẵn sàng để mở rộng và maintain cho nhiều ngôn ngữ khác trong tương lai. 