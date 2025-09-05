// clearFoods.js
import mongoose from "mongoose";
import foodModel from "./models/foodModel.js"; // chỉnh lại path cho đúng project của bạn

async function clearFoods() {
  try {
    // Kết nối MongoDB (sửa URI cho đúng database của bạn)
    await mongoose.connect("mongodb+srv://ordnl:6S1WLLjf3mbFxmI5@ordnl.ud1jso8.mongodb.net/?retryWrites=true&w=majority&appName=ordnl", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Xoá toàn bộ document trong collection food
    const result = await foodModel.deleteMany({});
    console.log(`✅ Đã xoá ${result.deletedCount} sản phẩm`);

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Lỗi khi xoá:", err);
    process.exit(1);
  }
}

clearFoods();
