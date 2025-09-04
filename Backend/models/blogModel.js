import mongoose from "mongoose"

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  titleVI: {
    type: String,
    required: false,
    trim: true
  },
  titleEN: {
    type: String,
    required: false,
    trim: true
  },
  titleSK: {
    type: String,
    required: false,
    trim: true
  },
  slug: {
    type: String,
    required: false,
    unique: true,
    sparse: true, // Allow multiple documents without slug
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 200
  },
  author: {
    type: String,
    required: true,
    default: "Admin"
  },
  category: {
    type: String,
    required: false,
    default: "General"
  },
  image: {
    type: String,
    required: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  readTime: {
    type: String,
    default: '5 min read'
  },
  publishedAt: {
    type: Date,
    default: null
  },
  language: {
    type: String,
    enum: ['en', 'sk'], // Removed 'vi' to avoid MongoDB conflicts
    default: 'en',
    required: false
  }
}, {
  timestamps: true
})

// Function to create slug from title
function createSlug(title) {
  if (!title || typeof title !== 'string') {
    return 'blog-' + Date.now()
  }
  
  return title
    .toLowerCase()
    .normalize('NFD') // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[đĐ]/g, 'd') // Replace đ/Đ with d
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Function to clean and validate custom slug
function cleanSlug(slug) {
  if (!slug || typeof slug !== 'string') {
    return 'blog-' + Date.now()
  }
  
  return slug
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Pre-save middleware to generate or validate slug - SIMPLIFIED VERSION
blogSchema.pre('save', function(next) {
  try {
    console.log('Pre-save middleware triggered')
    console.log('Title:', this.title)
    console.log('Slug before:', this.slug)
    
    // Ensure we have a title
    if (!this.title || typeof this.title !== 'string') {
      console.log('❌ No title provided, generating fallback slug')
      this.slug = 'blog-' + Date.now()
      return next()
    }
    
    // If slug is provided and modified, clean it
    if (this.isModified('slug') && this.slug && this.slug.trim()) {
      this.slug = cleanSlug(this.slug.trim())
      console.log('Custom slug cleaned:', this.slug)
    }
    
    // If no slug provided or title changed, generate from title
    if (!this.slug || !this.slug.trim() || this.isModified('title')) {
      this.slug = createSlug(this.title)
      console.log('Generated slug from title:', this.slug)
    }
    
    // Ensure slug is not empty
    if (!this.slug || !this.slug.trim()) {
      this.slug = 'blog-' + Date.now()
      console.log('Fallback slug generated:', this.slug)
    }
    
    console.log('Final slug:', this.slug)
    next()
  } catch (error) {
    console.error('Pre-save error:', error)
    // Generate a safe fallback slug
    this.slug = 'blog-' + Date.now()
    next()
  }
})

// Text index removed to avoid MongoDB language conflicts
// blogSchema.index({ title: 'text', content: 'text', tags: 'text' }, { default_language: 'english' })
// Note: slug index is automatically created by unique: true in schema

export default mongoose.model('Blog', blogSchema) 