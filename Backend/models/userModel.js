import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    cartData: { type: Object, default: {} },
    role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { 
    minimize: false,
    timestamps: true 
})//if not false it will not createe crat data with default value

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;