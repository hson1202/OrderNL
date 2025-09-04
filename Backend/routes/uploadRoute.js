import express from "express"
import { upload } from "../middleware/upload.js"

const router = express.Router()

// Upload image via server → Cloudinary
router.post("/image", (req, res) => {
  const uploadSingle = upload.single("image")
  
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error("=== UPLOAD ERROR ===", err)
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
    
    console.log("=== UPLOAD SUCCESS ===")
    console.log("File uploaded:", req.file.path)
    
    return res.json({
      success: true,
      url: req.file.path,
      public_id: req.file.filename,
      message: "Upload successful"
    })
  })
})

export default router


