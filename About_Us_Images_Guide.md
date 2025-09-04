# 🖼️ About Us Images Guide - Hướng dẫn sử dụng hình ảnh

## ✅ **Đã hoàn thành! Không cần import từng hình nữa**

Bây giờ bạn có thể sử dụng tất cả hình ảnh một cách dễ dàng thông qua `assets.js`!

## 🚀 **Cách sử dụng:**

### **1. Import một lần duy nhất:**
```jsx
import { aboutImages, teamImages } from '../../assets/assets'
```

### **2. Sử dụng hình ảnh:**
```jsx
const IMAGES = {
  hero: aboutImages.back1,           // Hero image
  story: aboutImages.back4,          // Story image  
  mission: aboutImages.back6,        // Mission image
  team: {
    chef: teamImages.chef,           // Chef Minh
    manager: teamImages.manager,     // Ms. Linh
    operations: teamImages.operations // Mr. An
  }
}
```

## 🎯 **Hình ảnh có sẵn:**

### **Background Images (16 hình):**
- `aboutImages.back1` → `aboutImages.back16`
- Tất cả đều là file `.jpg` chất lượng cao

### **Team Member Images (32 hình):**
- `teamImages.chef` = `food_1.png`
- `teamImages.manager` = `food_2.png`  
- `teamImages.operations` = `food_3.png`
- Hoặc dùng trực tiếp: `food_1`, `food_2`, `food_3`, ..., `food_32`

## 🔄 **Thay đổi hình ảnh dễ dàng:**

### **Thay đổi Hero Image:**
```jsx
// Thay vì:
hero: aboutImages.back1

// Đổi thành:
hero: aboutImages.back8
// hoặc
hero: aboutImages.back12
```

### **Thay đổi Story Image:**
```jsx
// Thay vì:
story: aboutImages.back4

// Đổi thành:
story: aboutImages.back7
// hoặc
story: aboutImages.back15
```

### **Thay đổi Team Member:**
```jsx
// Thay vì:
chef: teamImages.chef

// Đổi thành:
chef: food_4
// hoặc
chef: food_10
```

## 💡 **Ví dụ thay đổi nhanh:**

```jsx
const IMAGES = {
  hero: aboutImages.back3,           // Đổi hero thành back3
  story: aboutImages.back9,          // Đổi story thành back9
  mission: aboutImages.back14,       // Đổi mission thành back14
  team: {
    chef: food_5,                    // Đổi chef thành food_5
    manager: food_8,                 // Đổi manager thành food_8
    operations: food_12              // Đổi operations thành food_12
  }
}
```

## 🎨 **Lợi ích:**

✅ **Không cần import từng hình một**
✅ **Thay đổi hình ảnh nhanh chóng**
✅ **Code sạch sẽ và dễ maintain**
✅ **Tự động TypeScript support**
✅ **Vite build optimization**

## 🚫 **Không còn cần:**

```jsx
// ❌ Cách cũ - phải import từng hình
import back1 from './back1.jpg'
import back2 from './back2.jpg'
import back3 from './back3.jpg'
// ... và nhiều nữa

// ✅ Cách mới - import một lần
import { aboutImages, teamImages } from '../../assets/assets'
```

## 🔧 **Nếu muốn thêm hình mới:**

1. **Thêm vào `assets.js`:**
```jsx
import newImage from './new-image.jpg'
export const aboutImages = {
  // ... existing images
  newImage
}
```

2. **Sử dụng trong About Us:**
```jsx
hero: aboutImages.newImage
```

Bây giờ bạn có thể thay đổi hình ảnh một cách dễ dàng mà không cần import từng cái một! 🎉
