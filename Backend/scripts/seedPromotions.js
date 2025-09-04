import mongoose from 'mongoose';
import foodModel from '../models/foodModel.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedPromotions = async () => {
  try {
    await connectDB();

    // Lấy tất cả sản phẩm hiện có
    const foods = await foodModel.find({});
    
    // Cập nhật một số sản phẩm với khuyến mãi
    const promotionUpdates = [
      {
        name: 'Bún mắm',
        isPromotion: true,
        originalPrice: 75000,
        promotionPrice: 60000
      },
      {
        name: 'Bún thịt nướng',
        isPromotion: true,
        originalPrice: 65000,
        promotionPrice: 55000
      },
      {
        name: 'Bánh canh cua',
        isPromotion: true,
        originalPrice: 80000,
        promotionPrice: 65000
      },
      {
        name: 'Cơm chiên hải sản',
        isPromotion: true,
        originalPrice: 70000,
        promotionPrice: 58000
      },
      {
        name: 'Bánh canh giò heo',
        isPromotion: true,
        originalPrice: 60000,
        promotionPrice: 48000
      }
    ];

    for (const update of promotionUpdates) {
      const food = foods.find(f => f.name === update.name);
      if (food) {
        await foodModel.findByIdAndUpdate(food._id, {
          isPromotion: update.isPromotion,
          originalPrice: update.originalPrice,
          promotionPrice: update.promotionPrice
        });
        console.log(`Updated promotion for: ${update.name}`);
      }
    }

    // Thêm dữ liệu soldCount và likes cho tất cả sản phẩm
    for (const food of foods) {
      const soldCount = Math.floor(Math.random() * 200) + 1;
      const likes = Math.floor(Math.random() * 20) + 1;
      
      await foodModel.findByIdAndUpdate(food._id, {
        soldCount,
        likes
      });
      console.log(`Updated stats for: ${food.name} - Sold: ${soldCount}, Likes: ${likes}`);
    }

    console.log('Promotion seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding promotions:', error);
    process.exit(1);
  }
};

seedPromotions();
