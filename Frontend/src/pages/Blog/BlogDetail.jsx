import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './BlogDetail.css'
import config from '../../config/config'

const BlogDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [blogPost, setBlogPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_URL = config.BACKEND_URL

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true)
        
        // Debug: log slug parameter
        console.log('Slug parameter:', slug)
        
        let response
        if (slug && slug !== 'undefined' && slug !== 'null') {
          // Try to fetch by slug first
          try {
            response = await axios.get(`${API_URL}/api/blog/slug/${slug}`)
          } catch (slugError) {
            console.log('Slug fetch failed, trying ID fallback')
            // If slug fetch fails, try to fetch by ID (assuming slug might be an ID)
            response = await axios.get(`${API_URL}/api/blog/${slug}`)
          }
        } else {
          setError('Invalid blog URL')
          setLoading(false)
          return
        }
        
        setBlogPost(response.data.data)
        setError(null)
      } catch (err) {
        console.error('Error fetching blog post:', err)
        setError('Failed to load blog post')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchBlogPost()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="blog-detail-page">
        <div className="container">
          <div className="loading-state">
            <p>Loading blog post...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !blogPost) {
    return (
      <div className="blog-detail-page">
        <div className="container">
          <div className="error-state">
            <p>{error || 'Blog post not found'}</p>
            <button onClick={() => navigate('/blog')} className="back-btn">
              Back to Blog
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-detail-page">
      {/* Back Button */}
      <div className="back-section">
        <div className="container">
          <button onClick={() => navigate('/blog')} className="back-btn">
            ← Back to Blog
          </button>
        </div>
      </div>

      {/* Blog Content */}
      <div className="blog-content">
        <div className="container">
          {/* Header */}
          <div className="blog-header">
            <div className="post-meta">
              <span className="category">{blogPost.category || 'General'}</span>
              <span className="date">{new Date(blogPost.createdAt).toLocaleDateString()}</span>
              <span className="read-time">{blogPost.readTime || '5 min read'}</span>
            </div>
            <h1 className="blog-title">{blogPost.title}</h1>
            {blogPost.excerpt && (
              <p className="blog-excerpt">{blogPost.excerpt}</p>
            )}
          </div>

          {/* Featured Image */}
          {blogPost.image && (
            <div className="blog-image">
              <img 
                src={blogPost.image && blogPost.image.startsWith('http') ? blogPost.image : `${API_URL}/uploads/${blogPost.image}`} 
                alt={blogPost.title}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Blog Content */}
          <div className="blog-body">
            <div 
              className="content-html"
              dangerouslySetInnerHTML={{ __html: blogPost.content }}
            />
          </div>

          {/* Footer */}
          <div className="blog-footer">
            <div className="tags">
              {blogPost.tags && blogPost.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
            <button onClick={() => navigate('/blog')} className="back-to-blog-btn">
              Back to All Posts
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogDetail
