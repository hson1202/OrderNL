import express from "express"
import authMiddleware from "../middleware/auth.js"
import { placeOrder, userOrders, trackOrder, listOrders, updateStatus, getOrderStats } from "../controllers/orderController.js"

const orderRouter = express.Router();

// Đặt hàng - xử lý cả guest và authenticated users
orderRouter.post("/place", (req, res, next) => {
  // Nếu có token trong header, sử dụng auth middleware
  if (req.headers.token) {
    return authMiddleware(req, res, next);
  }
  // Nếu không có token, tiếp tục như guest user
  next();
}, placeOrder);

// Lấy đơn hàng của user (cần auth)
orderRouter.post("/userorders", authMiddleware, userOrders);

// Dò đơn hàng (không cần auth)
orderRouter.post("/track", trackOrder);

// Admin routes (cần auth)
orderRouter.get("/list", authMiddleware, listOrders);
orderRouter.post("/status", authMiddleware, updateStatus);
orderRouter.get("/stats", authMiddleware, getOrderStats);

export default orderRouter;