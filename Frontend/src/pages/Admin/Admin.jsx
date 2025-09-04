import React, { useState, useEffect } from 'react'
import './Admin.css'
import config from '../../config/config'

const Admin = () => {
  const [foods, setFoods] = useState([])
  const [editingFood, setEditingFood] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    sku: ''
  })

  useEffect(() => {
    fetchFoods()
  }, [])

  const fetchFoods = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${config.BACKEND_URL}/api/food/list`)
      const data = await response.json()
      
      if (data.success) {
        setFoods(data.data)
      } else {
        setError('Failed to fetch foods')
      }
    } catch (error) {
      setError('Error fetching foods: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (food) => {
    setEditingFood(food)
    setEditForm({
      name: food.name || '',
      price: food.price || '',
      description: food.description || '',
      category: food.category || '',
      sku: food.sku || ''
    })
  }

  const handleCancelEdit = () => {
    setEditingFood(null)
    setEditForm({
      name: '',
      price: '',
      description: '',
      category: '',
      sku: ''
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmitEdit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`${config.BACKEND_URL}/api/food/edit/${editingFood._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      })

      const data = await response.json()
      
      if (data.success) {
        // Update local state
        setFoods(prev => prev.map(food => 
          food._id === editingFood._id ? { ...food, ...editForm } : food
        ))
        setEditingFood(null)
        setEditForm({
          name: '',
          price: '',
          description: '',
          category: '',
          sku: ''
        })
        alert('Product updated successfully!')
      } else {
        alert('Failed to update product: ' + data.message)
      }
    } catch (error) {
      alert('Error updating product: ' + error.message)
    }
  }

  const handleDelete = async (foodId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`${config.BACKEND_URL}/api/food/remove`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: foodId })
        })

        const data = await response.json()
        
        if (data.success) {
          setFoods(prev => prev.filter(food => food._id !== foodId))
          alert('Product deleted successfully!')
        } else {
          alert('Failed to delete product: ' + data.message)
        }
      } catch (error) {
        alert('Error deleting product: ' + error.message)
      }
    }
  }

  if (loading) return <div className="admin-loading">Loading...</div>
  if (error) return <div className="admin-error">Error: {error}</div>

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      <h2>Manage Products</h2>
      
      <div className="foods-list">
        {foods.map(food => (
          <div key={food._id} className="food-item">
            <div className="food-info">
              <img 
                src={
                  food.image && food.image.startsWith('http') 
                    ? food.image 
                    : food.image 
                      ? `${config.BACKEND_URL}/images/${food.image}` 
                      : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn42dIE5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
                }
                alt={food.name}
                className="food-image"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5qrIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                  e.target.onerror = null;
                }}
              />
              <div className="food-details">
                <h3>{food.name}</h3>
                <p><strong>SKU:</strong> {food.sku}</p>
                <p><strong>Price:</strong> ${food.price}</p>
                <p><strong>Category:</strong> {food.category}</p>
                <p><strong>Description:</strong> {food.description}</p>
              </div>
            </div>
            
            <div className="food-actions">
              <button 
                onClick={() => handleEdit(food)}
                className="edit-btn"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(food._id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingFood && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Edit Product: {editingFood.name}</h3>
            
            <form onSubmit={handleSubmitEdit}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>SKU:</label>
                <input
                  type="text"
                  name="sku"
                  value={editForm.sku}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Price:</label>
                <input
                  type="number"
                  name="price"
                  value={editForm.price}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Category:</label>
                <input
                  type="text"
                  name="category"
                  value={editForm.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
