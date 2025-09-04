import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    description: { 
        type: String, 
        default: "" 
    },
    image: { 
        type: String, 
        default: "" 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    sortOrder: { 
        type: Number, 
        default: 0 
    },
    language: { 
        type: String, 
        enum: ['vi', 'en', 'sk'], 
        default: 'vi',
        required: true 
    }
}, {
    timestamps: true
});

const categoryModel = mongoose.models.category || mongoose.model("category", categorySchema);

export default categoryModel; 