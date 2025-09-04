import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import cloudinary from "../config/cloudinary.js"

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "food-delivery/uploads",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    use_filename: true,
    unique_filename: true,
    transformation: [{ width: 1600, height: 1600, crop: "limit" }]
  })
})

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
})


