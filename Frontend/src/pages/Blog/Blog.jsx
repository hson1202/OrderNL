import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Blog.css'
import axios from 'axios'
import config from '../../config/config'

const Blog = () => {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [blogPosts, setBlogPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // API URL - thay đổi theo backend của bạn
  const API_URL = config.BACKEND_URL

  // Fetch blog posts từ API
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get(`${API_URL}/api/blog/public`, {
          params: { status: 'published' } // có thể thêm language nếu cần
        });
        
        // Backend trả về { success, data, pagination }
        const list = Array.isArray(data?.data) ? data.data : [];
        
        // Debug: log blog data để xem có slug không
        console.log('Blog data received:', list)
        
        setBlogPosts(list)
        setError(null)
      } catch (err) {
        console.error('Error fetching blog posts:', err)
        setError('Failed to load blog posts')
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  // Categories từ blog posts thật
  const categories = ['All', ...new Set(blogPosts.map(blog => blog.category).filter(Boolean))]

  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory)

  return (
    <div className="blog-page">
      {/* Hero Section */}
      <div className="blog-hero">
        <div className="hero-content">
          <h1>Viet Bowls Blog</h1>
          <p>Discover the latest news, recipes, and stories from our Vietnamese kitchen</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <div className="container">
          <div className="filter-buttons">
            {categories.map(category => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Post */}
      {selectedCategory === 'All' && blogPosts.filter(post => post.featured).length > 0 && (
        <div className="featured-section">
          <div className="container">
            <h2>Featured Article</h2>
            {blogPosts.filter(post => post.featured).slice(0, 1).map(featuredPost => (
              <div key={featuredPost._id} className="featured-post">
                <div className="featured-image">
                  {featuredPost.image ? (
                    <img 
                      src={featuredPost.image && featuredPost.image.startsWith('http') ? featuredPost.image : `${API_URL}/uploads/${featuredPost.image}`} 
                      alt={featuredPost.title}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'block'
                      }}
                    />
                  ) : null}
                  <span style={{ display: featuredPost.image ? 'none' : 'block' }}>📝</span>
                </div>
                <div className="featured-content">
                  <div className="post-meta">
                    <span className="category">{featuredPost.category || 'General'}</span>
                    <span className="date">{new Date(featuredPost.createdAt).toLocaleDateString()}</span>
                    <span className="read-time">{featuredPost.readTime || '5 min read'}</span>
                  </div>
                  <h3>{featuredPost.title}</h3>
                  <p>{featuredPost.excerpt}</p>
                  <button 
                    className="read-more-btn"
                    onClick={() => navigate(`/blog/${featuredPost.slug || featuredPost._id}`)}
                  >
                    Read Full Article
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blog Posts Grid */}
      <div className="blog-posts">
        <div className="container">
          <h2>{selectedCategory === 'All' ? 'Latest Articles' : `${selectedCategory} Articles`}</h2>
          
          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <p>Loading blog posts...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-state">
              <p>{error}</p>
            </div>
          )}

          {/* Blog Posts */}
          {!loading && !error && (
            <div className="posts-grid">
              {filteredPosts
                .filter(post => !post.featured || selectedCategory !== 'All')
                .map(post => (
                  <article key={post._id} className="blog-card">
                    <div className="card-image">
                      {post.image ? (
                        <img 
                          src={post.image && post.image.startsWith('http') ? post.image : `${API_URL}/uploads/${post.image}`} 
                          alt={post.title}
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'block'
                          }}
                        />
                      ) : null}
                      <span style={{ display: post.image ? 'none' : 'block' }}>📝</span>
                    </div>
                    <div className="card-content">
                      <div className="post-meta">
                        <span className="category">{post.category || 'General'}</span>
                        <span className="date">{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span className="read-time">{post.readTime || '5 min read'}</span>
                      </div>
                      <h3>{post.title}</h3>
                      <p>{post.excerpt}</p>
                      <button 
                        className="read-more-btn"
                        onClick={() => navigate(`/blog/${post.slug || post._id}`)}
                      >
                        Read More
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          )}

          {/* No Posts Found */}
          {!loading && !error && filteredPosts.filter(post => !post.featured || selectedCategory !== 'All').length === 0 && (
            <div className="no-posts">
              <p>No blog posts found in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Stay Updated</h2>
            <p>Subscribe to our newsletter for the latest recipes, stories, and Vietnamese food culture.</p>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="email-input"
              />
              <button className="subscribe-btn">Subscribe</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Blog 