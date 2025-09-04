import React, { useState, useEffect } from 'react'
import './Category.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import '../../i18n'
import config from '../../config/config'

const Category = ({ url }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState({ name: '', description: '', image: null })
  const [editingCategory, setEditingCategory] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [imageErrors, setImageErrors] = useState(new Set())
  const [loadingImages, setLoadingImages] = useState(new Set())
  
  // Environment info for debugging
  const envInfo = {
    urlProp: url,
    configBackendUrl: config.BACKEND_URL,
    environment: process.env.NODE_ENV,
    hostname: window.location.hostname
  }

  useEffect(() => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Category component mounted:', envInfo)
    }
    fetchCategories()
  }, [])
  
  // Error boundary - MOVED AFTER ALL HOOKS
  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Something went wrong!</h2>
        <p>{error.message}</p>
        <button onClick={() => setError(null)}>Try again</button>
      </div>
    )
  }

  const fetchCategories = async (showLoadingToast = false) => {
    try {
      if (showLoadingToast) {
        toast.info('🔄 Đang tải lại categories...', { autoClose: 1000 })
      }
      
      const apiUrl = `${config.BACKEND_URL}${config.API_ENDPOINTS.CATEGORY}/admin`
      if (process.env.NODE_ENV === 'development') {
        console.log('Fetching categories from:', apiUrl)
      }
      const response = await axios.get(apiUrl)
      const categoriesData = response.data.data || response.data
      setCategories(categoriesData)
      
      if (showLoadingToast) {
        toast.success(`✅ Đã tải lại ${categoriesData.length} categories`, { autoClose: 2000 })
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError(error)
      toast.error(t('categories.fetchError', 'Failed to fetch categories'))
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategory.name.trim()) {
      toast.error(t('categories.nameRequired', 'Category name is required'))
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', newCategory.name)
      formData.append('description', newCategory.description)
      if (newCategory.image) {
        formData.append('image', newCategory.image)
      }

      const apiUrl = `${config.BACKEND_URL}${config.API_ENDPOINTS.CATEGORY}`
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Adding category to:', apiUrl, { name: newCategory.name, hasImage: !!newCategory.image })
      }
      
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 seconds timeout
      })
      toast.success(t('categories.addSuccess', 'Category added successfully'))
      setNewCategory({ name: '', description: '', image: null })
      fetchCategories()
    } catch (error) {
      console.error('Error adding category:', error)
      setError(error)
      
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout - backend không phản hồi. Vui lòng thử lại.')
      } else if (error.response?.status === 404) {
        toast.error('Backend không tìm thấy. Kiểm tra URL: ' + config.BACKEND_URL)
      } else if (error.response?.status >= 500) {
        toast.error('Lỗi server. Vui lòng thử lại sau.')
      } else {
        toast.error(error.response?.data?.message || t('categories.addError', 'Failed to add category'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e) => {
    try {
      const file = e.target.files[0]
      if (file) {
        setNewCategory({ ...newCategory, image: file })
      }
    } catch (error) {
      console.error('Error handling image change:', error)
      setError(error)
    }
  }

  const handleEditCategory = async (e) => {
    e.preventDefault()
    if (!editingCategory.name.trim()) {
      toast.error(t('categories.nameRequired', 'Category name is required'))
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', editingCategory.name)
      formData.append('description', editingCategory.description)
      if (editingCategory.newImage) {
        formData.append('image', editingCategory.newImage)
      }

      await axios.put(`${config.BACKEND_URL}${config.API_ENDPOINTS.CATEGORY}/${editingCategory._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success(t('categories.updateSuccess', 'Category updated successfully'))
      setEditingCategory(null)
      fetchCategories()
    } catch (error) {
      console.error('Error updating category:', error)
      setError(error)
      toast.error(error.response?.data?.message || t('categories.updateError', 'Failed to update category'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm(t('categories.deleteConfirm', 'Are you sure you want to delete this category?'))) {
      try {
        await axios.delete(`${config.BACKEND_URL}${config.API_ENDPOINTS.CATEGORY}/${categoryId}`)
        toast.success(t('categories.deleteSuccess', 'Category deleted successfully'))
        fetchCategories()
      } catch (error) {
        console.error('Error deleting category:', error)
        setError(error)
        toast.error(t('categories.deleteError', 'Failed to delete category'))
      }
    }
  }

  const startEditing = (category) => {
    try {
      setEditingCategory({ ...category, newImage: null })
    } catch (error) {
      console.error('Error starting edit:', error)
      setError(error)
    }
  }

  const cancelEditing = () => {
    try {
      setEditingCategory(null)
    } catch (error) {
      console.error('Error canceling edit:', error)
      setError(error)
    }
  }

  return (
    <div className='category-page'>
      <div className="category-header">
        <div className="header-content">
          <h1>{t('categories.title')}</h1>
          <p>{t('categories.subtitle', 'Manage your food categories')}</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={() => fetchCategories(true)}>
            <span>🔄</span> {t('common.refresh') || 'Refresh'}
          </button>
        </div>
      </div>

      {/* Add Category Form */}
      <div className="add-category-section" id="add-category-form">
        <h2>{t('categories.addNew')}</h2>
        <form onSubmit={handleAddCategory} className="category-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">{t('categories.name')} *</label>
              <input
                type="text"
                id="name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder={t('categories.namePlaceholder', 'Enter category name')}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">{t('categories.description')}</label>
              <textarea
                id="description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder={t('categories.descriptionPlaceholder', 'Enter category description')}
                rows="3"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="image">{t('categories.image')}</label>
            <input
              type="file"
              id="image"
              onChange={handleImageChange}
              accept="image/*"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? t('common.loading') : t('categories.addNew')}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setNewCategory({ name: '', description: '', image: null })}>
              {t('common.clear')}
            </button>
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div className="categories-section">
        <h2>{t('categories.list', 'Categories List')}</h2>
        {categories.length === 0 ? (
          <div className="empty-state">
            <h3>{t('categories.noCategoriesTitle', 'No Categories Found')}</h3>
            <p>{t('categories.noCategories', 'Start by adding your first category')}</p>
          </div>
        ) : (
                    <div className="categories-container">
            <div className="categories-grid" id="categoriesGrid">
              {categories.map((category) => (
                  <div key={category._id} className="category-card">
                {editingCategory && editingCategory._id === category._id ? (
                  <form onSubmit={handleEditCategory} className="edit-form">
                    <div className="form-group">
                      <label>{t('categories.name')}</label>
                      <input
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('categories.description')}</label>
                      <textarea
                        value={editingCategory.description}
                        onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                        rows="2"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('categories.newImage', 'New Image')}</label>
                      <input
                        type="file"
                        onChange={(e) => setEditingCategory({ ...editingCategory, newImage: e.target.files[0] })}
                        accept="image/*"
                      />
                    </div>
                    <div className="edit-actions">
                      <button type="submit" className="btn-success" disabled={isLoading}>
                        {isLoading ? t('common.loading') : t('common.save')}
                      </button>
                      <button type="button" onClick={cancelEditing} className="btn-secondary">
                        {t('common.cancel')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="category-image" style={{ position: 'relative' }}>
                      {loadingImages.has(category._id) && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(255,255,255,0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 1
                        }}>
                          <div style={{ color: '#666', textAlign: 'center' }}>
                            <div style={{ marginBottom: '5px' }}>📥</div>
                            <div style={{ fontSize: '12px' }}>Đang tải...</div>
                          </div>
                        </div>
                      )}
                      <img 
                        src={
                          category.image && category.image.startsWith('http')
                            ? category.image
                            : category.image 
                              ? `${config.BACKEND_URL}${config.IMAGE_PATHS.CATEGORY}/${category.image}`
                              : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='
                        }
                        alt={category.name || 'Category'}
                        onLoadStart={() => {
                          setLoadingImages(prev => new Set([...prev, category._id]));
                        }}
                        onLoad={() => {
                          setLoadingImages(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(category._id);
                            return newSet;
                          });
                          // Remove from error list if image loads successfully
                          setImageErrors(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(category._id);
                            return newSet;
                          });
                        }}
                        onError={(e) => {
                          const originalSrc = e.target.src;
                          console.error('Category image failed to load:', originalSrc);
                          
                          // Add to error tracking
                          setImageErrors(prev => new Set([...prev, category._id]));
                          
                          // Show toast notification
                          toast.warning(`Hình ảnh category "${category.name}" bị lỗi hoặc không tải được`, {
                            toastId: `image-error-${category._id}` // Prevent duplicate toasts
                          });
                          
                          // Set fallback image with error styling
                          e.target.src = 'data:image/svg+xml;base64,' + btoa(`
                            <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                              <rect width="300" height="200" fill="#ffebee" stroke="#ff6868" stroke-width="2" stroke-dasharray="5,5"/>
                              <text x="150" y="80" font-family="Arial" font-size="16" fill="#ff6868" text-anchor="middle" dy=".3em">⚠️ Hình ảnh lỗi</text>
                              <text x="150" y="100" font-family="Arial" font-size="12" fill="#ff6868" text-anchor="middle" dy=".3em">Không tải được</text>
                              <text x="150" y="120" font-family="Arial" font-size="10" fill="#999" text-anchor="middle" dy=".3em">Kiểm tra lại đường dẫn</text>
                            </svg>
                          `);
                          e.target.onerror = null;
                        }}
                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="category-content">
                      <div className="category-header">
                        <h3>
                          {category.name}
                          {imageErrors.has(category._id) && (
                            <span 
                              className="image-error-indicator" 
                              title="Hình ảnh bị lỗi hoặc không tải được"
                              style={{
                                marginLeft: '8px',
                                color: '#ff6868',
                                fontSize: '14px',
                                fontWeight: 'normal'
                              }}
                            >
                              ⚠️ Hình lỗi
                            </span>
                          )}
                        </h3>
                      </div>
                      <p className="category-description">{category.description || t('categories.noDescription', 'No description')}</p>
                      <div className="category-meta">
                        <span className="category-date">{new Date(category.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="category-actions">
                      <button onClick={() => startEditing(category)} className="btn-edit">
                        {t('common.edit')}
                      </button>
                      <button onClick={() => handleDeleteCategory(category._id)} className="btn-delete">
                        {t('common.delete')}
                      </button>
                    </div>
                  </>
                )}
              </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Category 