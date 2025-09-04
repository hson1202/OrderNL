import categoryModel from "../models/categoryModel.js";
import fs from 'fs';

// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find({ isActive: true })
            .sort({ sortOrder: 1, name: 1 });
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, message: "Error fetching categories" });
    }
};

// Get all categories (including inactive for admin)
const getAllCategoriesAdmin = async (req, res) => {
    try {
        const categories = await categoryModel.find()
            .sort({ sortOrder: 1, name: 1 });
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, message: "Error fetching categories" });
    }
};

// Add new category
const addCategory = async (req, res) => {
    try {
        const { name, description, sortOrder } = req.body;
        // Use Cloudinary URL or local filename
        let image_url = '';
        
        if (req.file) {
            // If using Cloudinary, req.file.path contains the full URL
            image_url = req.file.path || req.file.filename;
        }
        
        console.log('=== ADD CATEGORY DEBUG ===')
        console.log('Request body:', req.body)
        console.log('Request file:', req.file)
        console.log('Image URL:', image_url)

        const categoryData = {
            name,
            description: description || '',
            image: image_url,
            sortOrder: sortOrder || 0
        };

        const category = new categoryModel(categoryData);
        await category.save();
        
        res.json({ success: true, message: "Category added successfully" });
    } catch (error) {
        console.error('Error adding category:', error);
        if (error.code === 11000) {
            res.json({ success: false, message: "Category name already exists" });
        } else {
            res.json({ success: false, message: "Error adding category" });
        }
    }
};

// Update category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, sortOrder, isActive } = req.body;
        let image_url = '';
        
        if (req.file) {
            // If using Cloudinary, req.file.path contains the full URL
            image_url = req.file.path || req.file.filename;
        }

        const updateData = {
            name,
            description: description || '',
            sortOrder: sortOrder || 0,
            isActive: isActive !== undefined ? isActive : true
        };

        if (image_url) {
            updateData.image = image_url;
        }

        await categoryModel.findByIdAndUpdate(id, updateData);
        res.json({ success: true, message: "Category updated successfully" });
    } catch (error) {
        console.error('Error updating category:', error);
        if (error.code === 11000) {
            res.json({ success: false, message: "Category name already exists" });
        } else {
            res.json({ success: false, message: "Error updating category" });
        }
    }
};

// Delete category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryModel.findById(id);
        
        // Only delete local files (not Cloudinary URLs)
        // Cloudinary files should be managed through Cloudinary admin or auto-cleanup
        if (category && category.image && !/^https?:\/\//i.test(category.image)) {
            try {
                fs.unlink(`uploads/${category.image}`, () => { });
                console.log(`Local file deleted: ${category.image}`);
            } catch (fileError) {
                console.log(`Could not delete local file: ${category.image}`);
            }
        }

        await categoryModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.json({ success: false, message: "Error deleting category" });
    }
};

// Toggle category status
const toggleCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryModel.findById(id);
        
        if (!category) {
            return res.json({ success: false, message: "Category not found" });
        }

        category.isActive = !category.isActive;
        await category.save();
        
        res.json({ 
            success: true, 
            message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully` 
        });
    } catch (error) {
        console.error('Error toggling category status:', error);
        res.json({ success: false, message: "Error updating category status" });
    }
};

export {
    getAllCategories,
    getAllCategoriesAdmin,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus
}; 