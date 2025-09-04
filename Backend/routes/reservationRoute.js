import express from "express"
import { 
    createReservation, 
    getAllReservations, 
    getReservationById, 
    updateReservationStatus, 
    deleteReservation,
    getReservationsByDateRange,
    getAvailableTimeSlots
} from "../controllers/reservationController.js"
import authMiddleware, { verifyAdmin } from "../middleware/auth.js"

const router = express.Router()

// Public routes
router.post("/", createReservation)
router.get("/:id", getReservationById)
router.get("/time-slots/:date", getAvailableTimeSlots)

// Admin only routes
router.get("/", authMiddleware, verifyAdmin, getAllReservations)
router.get("/date-range", authMiddleware, verifyAdmin, getReservationsByDateRange)
router.put("/:id/status", authMiddleware, verifyAdmin, updateReservationStatus)
router.delete("/:id", authMiddleware, verifyAdmin, deleteReservation)

export default router
