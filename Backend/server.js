// server.js
import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import "dotenv/config"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import adminRouter from "./routes/adminRoute.js"
import categoryRouter from "./routes/categoryRoute.js"
import blogRouter from "./routes/blogRoute.js"
import reservationRouter from "./routes/reservationRoute.js"
import contactMessageRouter from "./routes/contactMessageRoute.js"
import uploadRouter from "./routes/uploadRoute.js"
import localUploadRouter from "./routes/localUploadRoute.js"
import cloudinarySignRouter from "./routes/cloudinarySignRoute.js"

const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))
//db connection
connectDB();
// Database connection state
let isConnected = false

const ensureDbConnection = async () => {
  if (!isConnected) {
    try {
      await connectDB()
      isConnected = true
      console.log("✅ Database connected successfully")
    } catch (error) {
      console.error("❌ Database connection failed:", error.message)
      throw error
    }
  }
}

// Database connection - initialize once at startup
ensureDbConnection().catch(error => {
  console.error("Initial database connection failed:", error.message)
})

// Optional: Database middleware for critical routes only (commented out for now)
// app.use(async (req, res, next) => {
//   try {
//     await ensureDbConnection()
//     next()
//   } catch (error) {
//     console.error("Database middleware error:", error.message)
//     return res.status(503).json({ 
//       success: false,
//       error: "Database unavailable", 
//       message: error.message 
//     })
//   }
// })

// Debug middleware to track all requests
app.use((req, res, next) => {
  console.log(`=== REQUEST DEBUG ===`)
  console.log(`${req.method} ${req.path}`)
  console.log(`Original URL: ${req.originalUrl}`)
  console.log(`Headers:`, req.headers)
  next()
})

// API Routes
app.use("/api/food", foodRouter)
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/admin", adminRouter)
app.use("/api/category", categoryRouter)
app.use("/api/blog", blogRouter)
app.use("/api/reservation", reservationRouter)
app.use("/api/contact", contactMessageRouter)
app.use("/api/upload", localUploadRouter)
app.use("/api/upload-cloud", uploadRouter)  // Keep Cloudinary as backup
app.use("/api/cloudinary", cloudinarySignRouter)

// Serve local uploads (Render has persistent filesystem, unlike Vercel)
app.use("/uploads", express.static("uploads"))
app.use("/images", express.static("uploads"))

// Health check endpoints
app.get("/", (req, res) => {
  res.json({ 
    success: true,
    message: "🚀 Food Delivery API is Working!",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development"
  })
})

app.get("/api", (req, res) => {
  res.json({ 
    success: true,
    message: "🍕 Food Delivery API v1.0",
    endpoints: [
      "/api/food",
      "/api/user", 
      "/api/cart",
      "/api/order",
      "/api/admin",
      "/api/category",
      "/api/blog",
      "/api/reservation",
      "/api/contact"
    ]
  })
})

app.get("/health", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    res.json({ 
      success: true,
      status: "healthy",
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      status: "unhealthy",
      error: error.message 
    })
  }
})

app.get("/test-food", async (req, res) => {
  try {
    const foodModel = (await import("./models/foodModel.js")).default
    const foods = await foodModel.find().limit(5)
    res.json({
      success: true,
      message: "Direct DB query test",
      count: foods.length,
      data: foods
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "DB query failed",
      message: error.message
    })
  }
})

app.get("/debug", async (req, res) => {
  try {
    // Test actual database connectivity instead of connection state
    let dbStatus = "disconnected"
    let foodCount = 0
    let testQuery = "failed"
    
    try {
      const foodModel = (await import("./models/foodModel.js")).default
      foodCount = await foodModel.countDocuments()
      testQuery = "success"
      dbStatus = "connected" // If query works, DB is connected
    } catch (dbError) {
      testQuery = dbError.message
      dbStatus = "error"
    }
    
    res.json({
      success: true,
      database: dbStatus,
      foodCount: foodCount,
      testQuery: testQuery,
      environment: process.env.NODE_ENV,
      mongoUrl: process.env.MONGODB_URL ? "configured" : "missing",
      nodeVersion: process.version,
      platform: process.platform,
      mongooseState: mongoose.connection.readyState
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    })
  }
})

app.get("/debug-cloudinary", async (req, res) => {
  try {
    const cloudinary = (await import("./config/cloudinary.js")).default
    
    // Test cloudinary config
    const config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET ? "***configured***" : "missing"
    }
    
    // Test API call
    const result = await cloudinary.api.ping()
    
    res.json({
      success: true,
      message: "Cloudinary connection working",
      config: config,
      ping: result
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      config: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "missing",
        api_key: process.env.CLOUDINARY_API_KEY ? "***configured***" : "missing",
        api_secret: process.env.CLOUDINARY_API_SECRET ? "***configured***" : "missing"
      }
    })
  }
})

app.post("/test-upload", async (req, res) => {
  try {
    const { upload } = await import("./middleware/upload.js")
    const uploadSingle = upload.single("image")
    
    uploadSingle(req, res, (err) => {
      if (err) {
        console.error("=== UPLOAD ERROR ===", err)
        return res.status(500).json({
          success: false,
          error: "Upload failed: " + err.message,
          details: err
        })
      }
      
      console.log("=== UPLOAD TEST DEBUG ===")
      console.log("File received:", req.file ? "YES" : "NO")
      console.log("File details:", req.file)
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded"
        })
      }
      
      res.json({
        success: true,
        message: "Upload successful",
        file: {
          url: req.file.path,
          public_id: req.file.filename,
          size: req.file.size,
          originalname: req.file.originalname
        }
      })
    })
  } catch (error) {
    console.error("Test upload error:", error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// 404 handler - phải để cuối cùng
app.use("*", (req, res) => {
  res.status(404).json({ 
    success: false,
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
    message: "Endpoint không tồn tại",
    availableRoutes: [
      "/api/food", 
      "/api/user", 
      "/api/cart", 
      "/api/order",
      "/api/admin",
      "/api/category"
    ]
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Global error handler:", error)
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: error.message
  })
})

// Server startup
const port = process.env.PORT || 4000

// Start server for both development and production (Render needs this)
if (process.env.VERCEL !== "1") {
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`)
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
  })
}

// Export for Vercel serverless function
export default app