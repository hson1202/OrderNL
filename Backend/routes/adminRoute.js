import express from "express";
import {
    getDashboardStats,
    getTimeStats,
    getRecentOrders,
    getAllUsers,
    updateUserStatus,
    updateUserRole,
    updateUser,
    deleteUser,
    getAllCategories,
    adminLogin,
    adminSignup,
    getTimeBasedStats,
    getAllOrders,
    updateOrderStatus
} from "../controllers/adminController.js";
import authMiddleware from "../middleware/auth.js";

const adminRouter = express.Router();

// Admin authentication routes
adminRouter.post("/login", adminLogin);
adminRouter.post("/signup", adminSignup);

// Dashboard routes (protected with auth)
adminRouter.get("/stats", authMiddleware, getDashboardStats);
adminRouter.get("/time-stats", authMiddleware, getTimeStats);
adminRouter.get("/recent-orders", authMiddleware, getRecentOrders);
adminRouter.get("/orders", authMiddleware, getAllOrders);
adminRouter.put("/orders/:id/status", authMiddleware, updateOrderStatus);
adminRouter.get("/time-based-stats", authMiddleware, getTimeBasedStats);

// User management routes (protected with auth)
adminRouter.get("/users", authMiddleware, getAllUsers);
adminRouter.put("/users/:id", authMiddleware, updateUser);
adminRouter.put("/users/:id/status", authMiddleware, updateUserStatus);
adminRouter.put("/users/:id/role", authMiddleware, updateUserRole);
adminRouter.delete("/users/:id", authMiddleware, deleteUser);

// Category management routes (protected with auth)
adminRouter.get("/categories", authMiddleware, getAllCategories);

export default adminRouter; 