import express from "express"
import { v2 as cloudinary } from "cloudinary"

const router = express.Router()

// Create signature for direct uploads from frontend
router.get("/signature", (req, res) => {
  const timestamp = Math.round(Date.now() / 1000)
  const folder = "food-delivery/uploads"
  const paramsToSign = { timestamp, folder }
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  )

  return res.json({
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder
  })
})

export default router


