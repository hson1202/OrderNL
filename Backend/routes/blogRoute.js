import express from "express"
import { upload } from "../middleware/upload.js"
import {
  getAllBlogs,
  getPublicBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleBlogStatus,
  toggleFeatured,
  getBlogStats
} from "../controllers/blogController.js"

const router = express.Router()

// Error handling middleware for upload
const handleMulterError = (error, req, res, next) => {
  console.log('🔍 Multer error handler called')
  console.log('Error type:', error.constructor.name)
  console.log('Error message:', error.message)
  
  if (error && error.name === 'MulterError') {
    console.log('⚠️ Multer error detected:', error.code)
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' })
    }
    return res.status(400).json({ error: 'File upload error: ' + error.message })
  } else if (error) {
    console.log('⚠️ Non-multer error:', error.message)
    return res.status(400).json({ error: error.message })
  }
  
  console.log('✅ No multer error, proceeding to next middleware')
  next()
}

// Validation middleware for blog creation
const validateBlogData = (req, res, next) => {
  try {
    console.log('🔍 === VALIDATION MIDDLEWARE ===')
    console.log('📝 Request body:', req.body)
    console.log('🔑 Body keys:', Object.keys(req.body))
    console.log('📁 Files:', req.files || req.file || 'No files')
    
    const { title, content, excerpt, author, language } = req.body
    
    if (!title || !title.trim()) {
      console.log('❌ Title validation failed')
      return res.status(400).json({ error: 'Title is required' })
    }
    
    if (!content || !content.trim()) {
      console.log('❌ Content validation failed')
      return res.status(400).json({ error: 'Content is required' })
    }
    
    if (!excerpt || !excerpt.trim()) {
      console.log('❌ Excerpt validation failed')
      return res.status(400).json({ error: 'Excerpt is required' })
    }
    
    if (!author || !author.trim()) {
      console.log('❌ Author validation failed')
      return res.status(400).json({ error: 'Author is required' })
    }
    
    // Language is now optional
    if (language && !['vi', 'en', 'sk'].includes(language)) {
      console.log('❌ Language validation failed')
      return res.status(400).json({ error: 'Language must be vi, en, or sk if provided' })
    }
    
    console.log('✅ Validation passed')
    next()
  } catch (error) {
    console.error('❌ Validation middleware error:', error)
    res.status(500).json({ error: 'Validation error' })
  }
}

// Blog routes
router.get('/list', getAllBlogs)
router.get('/public', getPublicBlogs) // Public route for frontend
router.get('/stats', getBlogStats)
router.get('/slug/:slug', getBlogBySlug) // New route for slug-based lookup
router.get('/:id', getBlogById)
router.post('/add', upload.single('image'), handleMulterError, validateBlogData, createBlog)
router.post('/add-test', upload.single('image'), handleMulterError, createBlog) // Test route without validation
router.post('/add-simple', validateBlogData, createBlog) // Route for creating blog without image
router.post('/add-no-image', validateBlogData, createBlog) // Route for creating blog without image validation
router.post('/test', (req, res) => {
    console.log("🧪 === BLOG TEST ROUTE ===")
    console.log("📋 Headers:", req.headers)
    console.log("📝 Body:", req.body)
    console.log("🔍 Body type:", typeof req.body)
    console.log("🔑 Body keys:", Object.keys(req.body))
    console.log("📁 Files:", req.files || req.file || 'No files')
    res.json({
        message: "Blog test route working",
        body: req.body,
        bodyType: typeof req.body,
        bodyKeys: Object.keys(req.body),
        files: req.files || req.file || 'No files'
    })
})

// Test database connection
router.get('/test-db', async (req, res) => {
    try {
        console.log("🔌 === TESTING DATABASE CONNECTION ===")
        const mongoose = await import('mongoose')
        const connectionState = mongoose.connection.readyState
        console.log("🔌 Database connection state:", connectionState)
        
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        }
        
        res.json({
            message: "Database connection test",
            state: connectionState,
            stateName: states[connectionState],
            connected: connectionState === 1
        })
    } catch (error) {
        console.error("❌ Database test error:", error)
        res.status(500).json({
            error: "Database test failed",
            details: error.message
        })
    }
})
router.put('/:id', upload.single('image'), handleMulterError, updateBlog)
router.delete('/:id', deleteBlog)
router.put('/:id/status', toggleBlogStatus)
router.put('/:id/featured', toggleFeatured)

export default router 