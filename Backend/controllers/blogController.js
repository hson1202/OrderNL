import Blog from "../models/blogModel.js"
import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'



// Get all blogs
export const getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, language } = req.query
    
    let query = {}
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status
    }
    
    // Filter by language
    if (language && language !== 'all') {
      query.language = language
    }
    
    // Search functionality
    if (search) {
      query.$text = { $search: search }
    }
    
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()
    
    const count = await Blog.countDocuments(query)
    
    res.json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(count / limit),
        total: count
      }
    })
  } catch (error) {
    console.error('Error fetching blogs:', error)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Get public blogs (published only)
export const getPublicBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 12, language = 'all', status = 'published', search } = req.query;

    const filter = {};
    // chỉ trả published (hoặc all nếu bạn muốn hiển thị cả draft cho preview—mặc định published)
    filter.status = status === 'all' ? 'published' : status;

    if (language !== 'all') filter.language = language;

    if (search) {
      // optional: search cho FE
      filter.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select(
          'title titleVI titleEN titleSK slug excerpt author category tags image language readTime featured createdAt publishedAt views status'
        ),
      Blog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching public blogs:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get single blog by ID
export const getBlogById = async (req, res) => {
  try {
    console.log('Fetching blog with ID:', req.params.id)
    
    const blog = await Blog.findById(req.params.id)
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' })
    }
    
    // Increment views
    blog.views += 1
    await blog.save()
    
    res.json({ success: true, data: blog })
  } catch (error) {
    console.error('Error fetching blog:', error)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Get blog by slug
export const getBlogBySlug = async (req, res) => {
  try {
    console.log('Fetching blog with slug:', req.params.slug)
    
    // First try to find by slug
    let blog = await Blog.findOne({ slug: req.params.slug })
    
    // If not found by slug, try to find by ID (in case slug is actually an ID)
    if (!blog) {
      console.log('Blog not found by slug, trying ID fallback')
      blog = await Blog.findById(req.params.slug)
    }
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' })
    }
    
    // Increment views
    blog.views += 1
    await blog.save()
    
    res.json({ success: true, data: blog })
  } catch (error) {
    console.error('Error fetching blog:', error)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Create new blog
export const createBlog = async (req, res) => {
  try {
    console.log('=== CREATE BLOG DEBUG ===')
    console.log('Request body:', req.body)
    console.log('Request headers:', req.headers)
    console.log('Content-Type:', req.headers['content-type'])
    console.log('Request method:', req.method)
    console.log('Request URL:', req.url)
    
    // Check if body is empty
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('❌ Request body is empty')
      return res.status(400).json({ error: 'Request body is empty' })
    }
    
    const { title, titleVI, titleEN, titleSK, content, excerpt, author, category, tags, status, featured, language, readTime, slug } = req.body
    
    console.log('Extracted fields:')
    console.log('- title:', title, 'type:', typeof title)
    console.log('- content:', content, 'type:', typeof content)
    console.log('- excerpt:', excerpt, 'type:', typeof excerpt)
    console.log('- author:', author, 'type:', typeof author)
    console.log('- language:', language, 'type:', typeof language)
    
    // Validate required fields according to schema
    if (!title || !content || !excerpt) {
      console.log('❌ Validation failed:')
      console.log('- title exists:', !!title)
      console.log('- content exists:', !!content)
      console.log('- excerpt exists:', !!excerpt)
      return res.status(400).json({ error: 'Title, content, and excerpt are required' })
    }
    
    // Validate author (required in schema)
    if (!author) {
      console.log(' Author validation failed')
      return res.status(400).json({ error: 'Author is required' })
    }
    
    // Language is now optional, set default if not provided
    const finalLanguage = language && ['vi', 'en', 'sk'].includes(language) ? language : 'vi'
    
    const blogData = {
      title: title.trim(),
      titleVI: titleVI ? titleVI.trim() : undefined,
      titleEN: titleEN ? titleEN.trim() : undefined,
      titleSK: titleSK ? titleSK.trim() : undefined,
      content: content.trim(),
      excerpt: excerpt.trim(),
      author: author.trim(),
      category: category ? category.trim() : 'General',
      tags: tags && tags.trim() ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
      status: status || 'draft',
      featured: featured === 'true' || featured === true || featured === '1' || featured === 1,
      language: finalLanguage,
      readTime: readTime || '5 min read'
    }
    
    console.log('📝 Processed blog data:', blogData)
    
    // Add custom slug if provided
    if (slug && slug.trim()) {
      blogData.slug = slug.trim()
      console.log('📝 Custom slug provided:', blogData.slug)
    } else {
      console.log('📝 No custom slug, will be auto-generated')
    }
    // If no slug provided, it will be auto-generated by pre-save middleware
    
    // Set publishedAt if status is published
    if (blogData.status === 'published') {
      blogData.publishedAt = new Date()
      console.log('📅 Published date set:', blogData.publishedAt)
    } else {
      console.log('📅 Status is draft, no published date set')
    }
    
    // Handle image upload (only if file is provided)
    if (req.file) {
      blogData.image = req.file.path || req.file.filename  // Use Cloudinary URL or local filename
      console.log('✅ Image uploaded:', blogData.image)
    } else {
      console.log('ℹ️ No image uploaded')
    }
    
    console.log('Blog data to save:', blogData)
    
    // Database connection is already verified at server startup - skip this check
    console.log('✅ Database connection assumed ready (verified at startup)')
    
    const blog = new Blog(blogData)
    console.log('📝 Blog model created, attempting to save...')
    
    await blog.save()
    
    console.log('✅ Blog created successfully:', blog._id)
    
    res.status(201).json({ 
      message: 'Blog created successfully',
      data: blog 
    })
    
    console.log('🎉 Response sent successfully')
  } catch (error) {
    console.error('🚨 === ERROR CREATING BLOG ===')
    console.error('❌ Error name:', error.name)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error stack:', error.stack)
    console.error('❌ Error code:', error.code)
    console.error('❌ Full error object:', error)
    
    // Handle specific errors
    if (error.name === 'ValidationError') {
      console.log('⚠️ Validation error detected')
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({ 
        error: 'Validation error', 
        details: validationErrors
      })
    }
    
    if (error.code === 11000) {
      console.log('⚠️ Duplicate key error detected')
      return res.status(400).json({ 
        error: 'Duplicate slug or title' 
      })
    }
    
    // Log the actual error for debugging
    console.error('❌ Unhandled error type, returning 500')
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      type: error.name
    })
  }
}

// Update blog
export const updateBlog = async (req, res) => {
  try {
    const { title, content, excerpt, author, category, tags, status, featured, readTime, slug } = req.body
    
    const updateData = {}
    
    if (title) updateData.title = title
    if (content) updateData.content = content
    if (excerpt) updateData.excerpt = excerpt
    if (author) updateData.author = author
    if (category) updateData.category = category
    if (tags) updateData.tags = tags.split(',').map(tag => tag.trim())
    if (status) updateData.status = status
    if (featured !== undefined) updateData.featured = featured === 'true' || featured === true
    if (readTime) updateData.readTime = readTime
    if (slug) updateData.slug = slug
    
    // Handle status change to published
    if (status === 'published' && req.body.status !== 'published') {
      updateData.publishedAt = new Date()
    }
    
    // Handle image upload
    if (req.file) {
      updateData.image = req.file.path || req.file.filename
      
      // Delete old local image if exists and was local
      const oldBlog = await Blog.findById(req.params.id)
      if (oldBlog && oldBlog.image && !/^https?:\/\//i.test(oldBlog.image)) {
        const oldImagePath = path.join(process.cwd(), 'uploads', oldBlog.image)
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }
    }
    
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' })
    }
    
    res.json({ 
      message: 'Blog updated successfully',
      data: blog 
    })
  } catch (error) {
    console.error('Error updating blog:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' })
    }
    
    // Delete local image if exists and not a URL
    if (blog.image && !/^https?:\/\//i.test(blog.image)) {
      const imagePath = path.join(process.cwd(), 'uploads', blog.image)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }
    
    await Blog.findByIdAndDelete(req.params.id)
    
    res.json({ message: 'Blog deleted successfully' })
  } catch (error) {
    console.error('Error deleting blog:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Toggle blog status
export const toggleBlogStatus = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' })
    }
    
    const newStatus = blog.status === 'published' ? 'draft' : 'published'
    blog.status = newStatus
    
    if (newStatus === 'published' && !blog.publishedAt) {
      blog.publishedAt = new Date()
    }
    
    await blog.save()
    
    res.json({ 
      message: 'Blog status updated successfully',
      data: blog 
    })
  } catch (error) {
    console.error('Error toggling blog status:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Toggle featured status
export const toggleFeatured = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' })
    }
    
    blog.featured = !blog.featured
    await blog.save()
    
    res.json({ 
      message: 'Blog featured status updated successfully',
      data: blog 
    })
  } catch (error) {
    console.error('Error toggling featured status:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get blog statistics
export const getBlogStats = async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments()
    const publishedBlogs = await Blog.countDocuments({ status: 'published' })
    const draftBlogs = await Blog.countDocuments({ status: 'draft' })
    const featuredBlogs = await Blog.countDocuments({ featured: true })
    const totalViews = await Blog.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ])
    
    res.json({
      data: {
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        featuredBlogs,
        totalViews: totalViews[0]?.totalViews || 0
      }
    })
  } catch (error) {
    console.error('Error fetching blog stats:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
} 