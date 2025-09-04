import express from "express"
import { localUpload } from "../middleware/localUpload.js"

const router = express.Router()

// Upload image to local server storage (faster than Cloudinary)
router.post("/image", (req, res) => {
  const uploadSingle = localUpload.single("image")
  
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error("=== LOCAL UPLOAD ERROR ===", err)
      return res.status(500).json({
        success: false,
        error: "Upload failed: " + err.message,
        details: process.env.NODE_ENV === 'development' ? err : undefined
      })
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded"
      })
    }
    
    console.log("=== LOCAL UPLOAD SUCCESS ===")
    console.log("File saved:", req.file.filename)
    
    // Return local file path (not full URL)
    return res.json({
      success: true,
      url: `/images/${req.file.filename}`, // Relative path for local serving
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      message: "Upload successful (local storage)"
    })
  })
})

export default router
