import { v2 as cloudinary } from "cloudinary"

// Cloudinary configuration using environment variables
if (process.env.CLOUDINARY_URL) {
  // Use CLOUDINARY_URL if available (simpler setup)
  cloudinary.config(process.env.CLOUDINARY_URL)
} else {
  // Fallback to individual environment variables
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })
}

export default cloudinary


