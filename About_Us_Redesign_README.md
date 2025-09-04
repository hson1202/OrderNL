# About Us Page Redesign

## Tổng quan
Đã làm lại hoàn toàn trang About Us với thiết kế hiện đại, đẹp mắt và có nhiều chỗ để thêm hình ảnh. Trang mới có layout responsive và visual hierarchy rõ ràng.

## 🎨 **Các Section mới:**

### **1. Hero Section**
- **Layout**: 2 cột (text + image)
- **Nội dung**: Title, subtitle, và 3 stats cards
- **Hình ảnh**: Placeholder lớn (400x400px) - **Thêm hero image vào đây**

### **2. Story Section**
- **Layout**: 2 cột (text + image)
- **Nội dung**: Our Story với 3 highlight items
- **Hình ảnh**: Placeholder (350px height) - **Thêm story image vào đây**

### **3. Mission Section**
- **Layout**: 2 cột (image + text) - **reverse layout**
- **Nội dung**: Our Mission với 3 goal items
- **Hình ảnh**: Placeholder (350px height) - **Thêm mission image vào đây**

### **4. Values Section**
- **Layout**: Grid 4 cột
- **Nội dung**: 4 core values với icons
- **Hình ảnh**: Không cần thêm hình

### **5. Team Section**
- **Layout**: Grid 3 cột
- **Nội dung**: 3 team members
- **Hình ảnh**: 3 placeholders tròn (120x120px) - **Thêm team photos vào đây**

### **6. Call to Action**
- **Layout**: Full-width với gradient background
- **Nội dung**: CTA text và button
- **Hình ảnh**: Không cần thêm hình

## 📸 **Cách thêm hình ảnh:**

### **Hero Image:**
```jsx
<div className="hero-image">
  <img 
    src="/path/to/your/hero-image.jpg" 
    alt="Viet Bowls Restaurant"
    className="hero-img"
  />
</div>
```

### **Story Image:**
```jsx
<div className="section-image">
  <img 
    src="/path/to/your/story-image.jpg" 
    alt="Our Story"
    className="section-img"
  />
</div>
```

### **Mission Image:**
```jsx
<div className="section-image">
  <img 
    src="/path/to/your/mission-image.jpg" 
    alt="Our Mission"
    className="section-img"
  />
</div>
```

### **Team Member Photos:**
```jsx
<div className="member-image">
  <img 
    src="/path/to/chef-minh.jpg" 
    alt="Chef Minh"
    className="member-img"
  />
</div>
```

## 🎯 **Tính năng mới:**

### **Visual Enhancements:**
- ✅ Gradient text cho headings
- ✅ Glassmorphism effects
- ✅ Hover animations
- ✅ Smooth transitions
- ✅ Modern color scheme (#28a745, #20c997)

### **Layout Features:**
- ✅ Responsive grid system
- ✅ Flexbox layouts
- ✅ Mobile-first approach
- ✅ Proper spacing và typography
- ✅ Image placeholders với dashed borders

### **Interactive Elements:**
- ✅ Hover effects trên cards
- ✅ Transform animations
- ✅ Shadow transitions
- ✅ Button hover states

## 📱 **Responsive Breakpoints:**

- **Desktop**: 2 cột layout
- **Tablet (≤1024px)**: Stack thành 1 cột
- **Mobile (≤768px)**: Optimized spacing
- **Small Mobile (≤480px)**: Single column, centered

## 🔧 **CSS Classes chính:**

- `.about-hero` - Hero section
- `.about-section` - Các section chính
- `.section-content` - Layout 2 cột
- `.section-content.reverse` - Layout đảo ngược
- `.image-placeholder` - Placeholder cho hình ảnh
- `.value-card` - Cards cho values
- `.team-member` - Cards cho team members

## 📁 **Files đã được cập nhật:**

- `Frontend/src/pages/AboutUs/AboutUs.jsx`
- `Frontend/src/pages/AboutUs/AboutUs.css`
- `About_Us_Redesign_README.md`

## 🚀 **Cách test:**

1. **Desktop**: Kiểm tra layout 2 cột và hover effects
2. **Tablet**: Test responsive breakpoint 1024px
3. **Mobile**: Test mobile layout và spacing
4. **Images**: Thay thế placeholders bằng hình ảnh thật
5. **Hover Effects**: Test tất cả interactive elements

## 💡 **Gợi ý hình ảnh:**

- **Hero**: Restaurant exterior hoặc signature dish
- **Story**: Kitchen hoặc family cooking
- **Mission**: Team working hoặc customer service
- **Team**: Professional headshots của staff

## 🎨 **Customization:**

Bạn có thể dễ dàng:
- Thay đổi colors trong CSS variables
- Điều chỉnh spacing và typography
- Thêm/bớt sections
- Customize animations
- Thay đổi layout structure

Trang About mới sẽ trông chuyên nghiệp và hiện đại hơn nhiều! 🎉
