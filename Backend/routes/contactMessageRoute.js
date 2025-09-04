import express from 'express'
import authMiddleware, { verifyAdmin } from '../middleware/auth.js'
import {
  createContactMessage,
  getAllContactMessages,
  getContactMessage,
  updateContactMessageStatus,
  addAdminResponse,
  deleteContactMessage,
  getContactMessageStats
} from '../controllers/contactMessageController.js'

const router = express.Router()

// Public route - anyone can send contact messages
router.post('/', createContactMessage)

// Admin only routes
router.get('/', authMiddleware, verifyAdmin, getAllContactMessages)
router.get('/stats', authMiddleware, verifyAdmin, getContactMessageStats)
router.get('/:id', authMiddleware, verifyAdmin, getContactMessage)
router.put('/:id/status', authMiddleware, verifyAdmin, updateContactMessageStatus)
router.put('/:id/response', authMiddleware, verifyAdmin, addAdminResponse)
router.delete('/:id', authMiddleware, verifyAdmin, deleteContactMessage)

export default router
