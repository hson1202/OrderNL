import mongoose from "mongoose"

const reservationSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    restaurant: { type: String, required: true },
    reservationDate: { type: Date, required: true },
    reservationTime: { type: String, required: true },
    numberOfPeople: { type: Number, required: true, min: 1 },
    note: { type: String, default: '' },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
        default: 'pending' 
    },
    adminNote: { type: String, default: '' },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    confirmedAt: { type: Date }
}, { 
    timestamps: true 
})

const reservationModel = mongoose.models.reservation || mongoose.model("reservation", reservationSchema);

export default reservationModel;
