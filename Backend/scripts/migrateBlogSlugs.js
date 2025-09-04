import mongoose from 'mongoose'
import Blog from '../models/blogModel.js'

// Function to create slug from title
function createSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD') // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[đĐ]/g, 'd') // Replace đ/Đ with d
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim('-') // Remove leading/trailing hyphens
}

// Function to clean and validate custom slug
function cleanSlug(slug) {
  return slug
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
}

async function migrateBlogSlugs() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/food-delivery', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    
    console.log('Connected to MongoDB')
    
    // Find all blogs without slug
    const blogsWithoutSlug = await Blog.find({ slug: { $exists: false } })
    console.log(`Found ${blogsWithoutSlug.length} blogs without slug`)
    
    if (blogsWithoutSlug.length === 0) {
      console.log('All blogs already have slugs')
      return
    }
    
    // Update each blog
    for (const blog of blogsWithoutSlug) {
      let baseSlug = createSlug(blog.title)
      let slug = baseSlug
      let counter = 1
      
      // Check if slug already exists and make it unique
      while (await Blog.findOne({ slug, _id: { $ne: blog._id } })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
      
      // Update blog with slug
      await Blog.findByIdAndUpdate(blog._id, { slug })
      console.log(`Updated blog "${blog.title}" with slug: ${slug}`)
    }
    
    console.log('Migration completed successfully!')
    
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run migration
migrateBlogSlugs()
