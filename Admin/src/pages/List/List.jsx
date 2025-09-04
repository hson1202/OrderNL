import React, { useEffect, useState } from 'react'
import './List.css'
import axios from "axios"
import {toast} from "react-toastify"
import config from '../../config/config'

const List = ({url}) => {
  const [list,setList]=useState([]);
  const [editingFood, setEditingFood] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    sku: ''
  });

  const fetchList=async ()=>{
    const response=await axios.get(`${config.BACKEND_URL}/api/food/list`);

    if(response.data.success){
      setList(response.data.data)
    }
    else{
      toast.error("Error")
    }
  }
  const removeFood= async (foodId)=>{
    const response = await axios.post(`${config.BACKEND_URL}/api/food/remove`,{id:foodId});
    await fetchList();
    if(response.data.success){
      toast.success(response.data.message);
    }
    else{
      toast.error("Error");
    }
  }

  const handleEdit = (food) => {
    setEditingFood(food);
    setEditForm({
      name: food.name || '',
      price: food.price || '',
      description: food.description || '',
      category: food.category || '',
      sku: food.sku || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingFood(null);
    setEditForm({
      name: '',
      price: '',
      description: '',
      category: '',
      sku: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.put(`${config.BACKEND_URL}/api/food/edit/${editingFood._id}`, editForm);
      
      if (response.data.success) {
        toast.success('Product updated successfully!');
        setEditingFood(null);
        setEditForm({
          name: '',
          price: '',
          description: '',
          category: '',
          sku: ''
        });
        fetchList(); // Refresh list
      } else {
        toast.error('Failed to update product: ' + response.data.message);
      }
    } catch (error) {
      toast.error('Error updating product: ' + error.message);
    }
  };

  useEffect(()=>{
    fetchList();
  },[])


  return (


    <div className='list add flex-col'>
      <p>All Foods List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {list.map((item,index)=>{
          return(
            <div key={index} className="list-table-format">
              <img src={
                item.image && item.image.startsWith('http')
                  ? item.image
                  : item.image 
                    ? `${url}/images/${item.image}`
                    : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn42dIE5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
              } 
              alt={item.name || 'Product'}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5qrIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                e.target.onerror = null;
              }}
              />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>€{item.price}</p>
              <div className="action-buttons">
                <button onClick={() => handleEdit(item)} className="edit-btn">Edit</button>
                <button onClick={()=>removeFood(item._id)} className='delete-btn'>X</button>
              </div>
              </div>
          )
        })}
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

export default List