import mongoose from "mongoose";
import categoryModel from "../models/categoryModel.js";
import "dotenv/config.js";

const defaultCategories = [
    {
        name: "Salad",
        description: "Fresh and healthy salads with various ingredients",
        sortOrder: 1
    },
    {
        name: "Rolls",
        description: "Delicious wraps and rolls with different fillings",
        sortOrder: 2
    },
    {
        name: "Desserts",
        description: "Sweet treats and desserts",
        sortOrder: 3
    },
    {
        name: "Sandwich",
        description: "Fresh sandwiches and paninis",
        sortOrder: 4
    },
    {
        name: "Cake",
        description: "Beautiful cakes and pastries",
        sortOrder: 5
    },
    {
        name: "Pure Veg",
        description: "Vegetarian dishes and meals",
        sortOrder: 6
    },
    {
        name: "Pasta",
        description: "Italian pasta dishes with various sauces",
        sortOrder: 7
    },
    {
        name: "Noodles",
        description: "Asian noodle dishes and stir-fries",
        sortOrder: 8
    }
];

const seedCategories = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Clear existing categories
        await categoryModel.deleteMany({});
        console.log("Cleared existing categories");

        // Insert default categories
        const categories = await categoryModel.insertMany(defaultCategories);
        console.log(`Inserted ${categories.length} categories`);

        console.log("Categories seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding categories:", error);
        process.exit(1);
    }
};

seedCategories(); 