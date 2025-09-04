import express from "express";
import {
    getAllCategories,
    getAllCategoriesAdmin,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus
} from "../controllers/categoryController.js";
import { upload } from "../middleware/upload.js";

const categoryRouter = express.Router();

// Using Cloudinary-backed multer storage from middleware

// Public routes (for frontend)
categoryRouter.get("/", getAllCategories);

// Admin routes
categoryRouter.get("/admin", getAllCategoriesAdmin);
categoryRouter.post("/", upload.single("image"), addCategory);
categoryRouter.put("/:id", upload.single("image"), updateCategory);
categoryRouter.delete("/:id", deleteCategory);
categoryRouter.put("/:id/toggle", toggleCategoryStatus);

export default categoryRouter; 