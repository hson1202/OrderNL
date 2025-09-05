import React, { useState, useEffect, useMemo } from 'react'
import './Products.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import i18n from '../../i18n'
import EditProductPopup from '../../components/EditProductPopup/EditProductPopup'
import InventoryStatus from '../../components/InventoryStatus/InventoryStatus'
import config from '../../config/config'


const Products = ({ url }) => {
  const { t } = useTranslation();
  const getErrMsg = (e, fallback) => (e && e.response && (e.response.data && (e.response.data.message || e.response.data.error))) || (e && e.message) || fallback;
  const [foodList, setFoodList] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'active', 'inactive'
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const INITIAL_EDIT_FORM = {
    sku: '',
    name: '',
    nameVI: '',
    nameEN: '',
    nameSK: '',
    description: '',
    price: '',
    category: '',
    quantity: 0,
    isPromotion: false,
    promotionPrice: '',
    soldCount: 0,
    image: null,
    imagePreview: null,
    options: []
  }
  const [editForm, setEditForm] = useState(INITIAL_EDIT_FORM)
  const [error, setError] = useState(null)
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    nameVI: '',
    nameEN: '',
    nameSK: '',
    slug: '',
    description: '',
    price: '',
    category: '',
    image: null,
    quantity: 0,
    isPromotion: false,
    promotionPrice: '',
    soldCount: 0,
    options: [] // Thêm options array
  })

  // State cho quản lý options - đơn giản hóa
  const [showOptionsForm, setShowOptionsForm] = useState(false)
  const [currentOption, setCurrentOption] = useState({
    name: '',
    defaultChoiceCode: '',
    choices: []
  })
  const [editingOptionIndex, setEditingOptionIndex] = useState(-1)
  const [editingChoiceIndex, setEditingChoiceIndex] = useState(-1)
  const [currentChoice, setCurrentChoice] = useState({
    code: '',
    label: '',
    price: 0,
    image: null
  })

 // useEffect
useEffect(() => {
  const controller1 = new AbortController();
  const controller2 = new AbortController();
  fetchFoodList(false, controller1.signal);
  fetchCategories(controller2.signal);
  return () => { controller1.abort(); controller2.abort(); };
}, []);

const fetchFoodList = async (showToast = false, signal) => {
  setIsLoading(true); setError(null);
  try {
    const { data } = await axios.get(`${config.BACKEND_URL}/api/food/list`, { signal });
    const items = data?.data ?? [];
    setFoodList(Array.isArray(items) ? items : []);
    if (showToast) toast.success(`✅ Tải ${items.length} sản phẩm`);
  } catch (e) {
    if (axios.isCancel(e)) return;
    setError(`Failed to fetch products: ${e.message ?? 'Unknown'}`);
    toast.error(t('products.fetchError') || 'Failed to fetch products');
  } finally { setIsLoading(false); }
};

const fetchCategories = async (signal) => {
  try {
    const { data } = await axios.get(`${config.BACKEND_URL}/api/category`, { signal });
    const items = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
    setCategories(items);
  } catch (e) {
    if (axios.isCancel(e)) return;
    setError(`Failed to fetch categories: ${e.message ?? 'Unknown'}`);
    toast.error('Failed to fetch categories');
    setCategories([]);
  }
};

  const handleDeleteProduct = async (productId) => {
    if (!productId) {
      toast.error('Missing product id')
      return
    }
    if (!window.confirm(t('products.deleteConfirm') || 'Are you sure you want to delete this product?')) return

    const baseUrl = String(config.BACKEND_URL || '').replace(/\/+$/, '')
    const base = `${baseUrl}/api/food`
    const trials = [
      async () => axios.delete(`${base}/remove/${encodeURIComponent(productId)}`),
      async () => axios.delete(`${base}/remove`, { params: { id: productId } }),
      async () => axios.post(`${base}/remove`, { id: productId }),
      async () => axios.delete(`${base}/delete/${encodeURIComponent(productId)}`)
    ]

    let lastErr = null
    for (const run of trials) {
      try {
        const res = await run()
        const ok = (res.status >= 200 && res.status < 300) && (res.data?.success !== false)
        if (ok) {
          toast.success(t('products.deleteSuccess') || 'Product deleted successfully')
          fetchFoodList()
          return
        }
        lastErr = new Error(res.data?.message || 'Delete not acknowledged')
      } catch (e) {
        if (e?.response && ![404, 405].includes(e.response.status)) {
          toast.error(`Failed to delete: ${e.response.status} ${e.response.data?.message || e.message}`)
          return
        }
        lastErr = e
      }
    }

    const msg = lastErr?.response
      ? `${lastErr.response.status} ${lastErr.response.data?.message || lastErr.message}`
      : (lastErr?.message || 'Unknown error')
    toast.error(`Failed to delete product: ${msg}`)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setEditForm({
      sku: product.sku || '',
      name: product.name || '',
      nameVI: product.nameVI || '',
      nameEN: product.nameEN || '',
      nameSK: product.nameSK || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      quantity: product.quantity || 0,
      isPromotion: product.isPromotion || false,
      promotionPrice: product.promotionPrice || '',
      soldCount: product.soldCount || 0,
      options: product.options || [] // Ensure options are included
    });
  };

  const closeEditForm = () => {
    if (editForm.imagePreview) URL.revokeObjectURL(editForm.imagePreview);
    if (editingProduct) {
      setEditingProduct(null);
      setEditForm(INITIAL_EDIT_FORM);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setEditForm(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      const numericFields = new Set(['price', 'quantity', 'promotionPrice', 'soldCount']);
      setEditForm(prev => ({
        ...prev,
        [name]: numericFields.has(name)
          ? (name === 'quantity' || name === 'soldCount' ? (parseInt(value) || 0) : (Number(value) || 0))
          : value
      }));
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file size must be less than 5MB')
        return
      }
      
      setEditForm(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!editForm.sku || !editForm.sku.trim()) {
      toast.error('SKU is required')
      return
    }
    
    if (!editForm.name || !editForm.name.trim()) {
      toast.error('Product name is required')
      return
    }
    if (!(Number(editForm.price) > 0)) {
      toast.error('Valid price is required');
      return;
    }
    
    if (!editForm.category || !editForm.category.trim()) {
      toast.error('Category is required')
      return
    }
    
    if (editForm.isPromotion && (!editForm.promotionPrice || parseFloat(editForm.promotionPrice) <= 0)) {
      toast.error('Promotion price is required when promotion is enabled')
      return
    }
    
    if (editForm.isPromotion && parseFloat(editForm.promotionPrice) >= parseFloat(editForm.price)) {
      toast.error('Promotion price must be less than regular price')
      return
    }
    
    if (editForm.quantity === undefined || editForm.quantity === null || isNaN(Number(editForm.quantity)) || Number(editForm.quantity) < 0) {
      toast.error('Valid quantity is required (must be >= 0)')
      return
    }

    // Validate options if they exist
    if (editForm.options && editForm.options.length > 0) {
      for (let i = 0; i < editForm.options.length; i++) {
        const option = editForm.options[i]
        if (!option.name || !option.choices || option.choices.length === 0 || !option.defaultChoiceCode) {
          toast.error(`Option ${i + 1} is incomplete. Please check all fields.`)
          return
        }
        
        // Check if default choice exists
        const defaultChoiceExists = option.choices.find(choice => choice.code === option.defaultChoiceCode)
        if (!defaultChoiceExists) {
          toast.error(`Default choice for option "${option.name}" not found`)
          return
        }
      }
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Append all form fields
      Object.keys(editForm).forEach(key => {
        if (key === 'image' && editForm[key] instanceof File) {
          formData.append('image', editForm[key]);
        } else if (key === 'options') {
          // Handle options separately
          if (editForm[key] && editForm[key].length > 0) {
            try {
              const safeOptions = (editForm[key] || []).map(o => ({
                ...o,
                choices: (o.choices || []).map(c => {
                  const { image, ...rest } = c;
                  return { ...rest, price: Number(rest.price) || 0 };
                })
              }));
              formData.append('options', JSON.stringify(safeOptions))
            } catch (error) {
              console.error('Error stringifying options:', error)
              toast.error('Error processing options data')
              return
            }
          }
        } else if (key !== 'image') {
          formData.append(key, editForm[key]);
        }
      });
      formData.set('price', String(Number(editForm.price)));          // đảm bảo là số
formData.set('quantity', String(Number(editForm.quantity) || 0));
formData.set('promotionPrice', String(Number(editForm.promotionPrice) || 0));
formData.set('isPromotion', String(!!editForm.isPromotion));    // boolean -> "true"/"false"
      
      const response = await axios.put(`${config.BACKEND_URL}/api/food/edit/${editingProduct._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response data:', response.data);
      
      if (response.data.success) {
        toast.success('Product updated successfully!');
        
        // Clean up preview URL if exists
        if (editForm.imagePreview) {
          URL.revokeObjectURL(editForm.imagePreview);
        }
        
        setEditingProduct(null);
        setEditForm({
          sku: '',
          name: '',
          nameVI: '',
          nameEN: '',
          nameSK: '',
          description: '',
          price: '',
          category: '',
          quantity: 0,
          isPromotion: false,
          promotionPrice: '',
          soldCount: 0,
          image: null,
          imagePreview: null,
          options: [] // Reset options
        });
        fetchFoodList(); // Refresh list
      } else {
        toast.error('Failed to update product: ' + response.data.message);
      }
    } catch (error) {
      console.error('❌ Edit error:', error);
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', error.response.data);
        toast.error(`Error ${error.response.status}: ${error.response.data?.message || error.response.data?.error || 'Unknown error'}`);
      } else {
        toast.error('Error updating product: ' + error.message);
      }
    }
  };

  const handleStatusToggle = async (productId, currentStatus) => {
    try {
              const response = await axios.put(`${config.BACKEND_URL}/api/food/status`, {
          id: productId,
          status: currentStatus === 'active' ? 'inactive' : 'active'
        })
      if (response.data) {
        toast.success(t('products.statusUpdateSuccess') || 'Product status updated successfully')
        fetchFoodList()
      }
    } catch (error) {
      console.error('Error updating product status:', error)
      toast.error(`Failed to update status: ${getErrMsg(error, 'Unknown error')}`)
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!newProduct.sku || !newProduct.sku.trim()) {
      toast.error('SKU is required')
      return
    }
    
    if (!newProduct.name || !newProduct.name.trim()) {
      toast.error('Product name is required')
      return
    }
    
    if (!(Number(newProduct.price) > 0)) {
      toast.error('Valid price is required');
      return;
    }
    
    
    if (!newProduct.category || !newProduct.category.trim()) {
      toast.error('Category is required')
      return
    }
    
    if (newProduct.isPromotion && (!newProduct.promotionPrice || parseFloat(newProduct.promotionPrice) <= 0)) {
      toast.error('Promotion price is required when promotion is enabled')
      return
    }
    
    if (newProduct.isPromotion && parseFloat(newProduct.promotionPrice) >= parseFloat(newProduct.price)) {
      toast.error('Promotion price must be less than regular price')
      return
    }
    
    if (newProduct.quantity === undefined || newProduct.quantity === null || isNaN(Number(newProduct.quantity)) || Number(newProduct.quantity) < 0) {
      toast.error('Valid quantity is required (must be >= 0)')
      return
    }

    // Validate options if they exist
    if (newProduct.options && newProduct.options.length > 0) {
      for (let i = 0; i < newProduct.options.length; i++) {
        const option = newProduct.options[i]
        if (!option.name || !option.choices || option.choices.length === 0 || !option.defaultChoiceCode) {
          toast.error(`Option ${i + 1} is incomplete. Please check all fields.`)
          return
        }
        
        // Check if default choice exists
        const defaultChoiceExists = option.choices.find(choice => choice.code === option.defaultChoiceCode)
        if (!defaultChoiceExists) {
          toast.error(`Default choice for option "${option.name}" not found`)
          return
        }
      }
    }

    const formData = new FormData()
          formData.append('sku', newProduct.sku)
      formData.append('name', newProduct.name)
      formData.append('nameVI', newProduct.nameVI)
      formData.append('nameEN', newProduct.nameEN)
      formData.append('nameSK', newProduct.nameSK)
      formData.append('slug', newProduct.slug)
      formData.append('description', newProduct.description)
            formData.append('category', newProduct.category)
            formData.append('price', String(Number(newProduct.price)));
            formData.append('quantity', String(Number(newProduct.quantity) || 0));
            formData.append('isPromotion', String(!!newProduct.isPromotion));
            if (newProduct.isPromotion) {
              formData.append('promotionPrice', String(Number(newProduct.promotionPrice) || 0));
            }
    
    if (newProduct.image) {
      formData.append('image', newProduct.image)
    }

    // Add options data
    if (newProduct.options && newProduct.options.length > 0) {
      try {
        const safeOptions = (newProduct.options || []).map(o => ({
          ...o,
          choices: (o.choices || []).map(c => {
            const { image, ...rest } = c;
            return { ...rest, price: Number(rest.price) || 0 };
          })
        }));
        console.log('🔍 Admin - Adding options to formData:', safeOptions)
        formData.append('options', JSON.stringify(safeOptions))
      } catch (error) {
        console.error('Error stringifying options:', error)
        toast.error('Error processing options data')
        return
      }
    } else {
      console.log('🔍 Admin - No options to add')
    }

    setIsLoading(true)
    try {
      const response = await axios.post(`${config.BACKEND_URL}/api/food/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data) {
        toast.success('Product added successfully')
        setNewProduct({
          sku: '',
          name: '',
          nameVI: '',
          nameEN: '',
          nameSK: '',
          slug: '',
          description: '',
          price: '',
          category: '',
          image: null,
          quantity: 0,
          isPromotion: false,
          promotionPrice: '',
          soldCount: 0,
          options: [] // Reset options
        })
        setShowAddForm(false)
        fetchFoodList()
      }
    } catch (error) {
      console.error('Error adding product:', error)
      toast.error(`Failed to add product: ${getErrMsg(error, 'Unknown error')})`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file size must be less than 5MB')
        return
      }
      
      setNewProduct({ ...newProduct, image: file })
    }
  }

  // Auto-generate slug from name if empty
  useEffect(() => {
    if (!newProduct.slug && newProduct.name) {
      const slug = newProduct.name
        .toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
      setNewProduct(p => ({ ...p, slug }))
    }
  }, [newProduct.name])

  // Functions để quản lý Options - đơn giản hóa
  const addOption = () => {
    if (!currentOption.name.trim()) {
      toast.error('Option name is required')
      return
    }
    
    if (currentOption.choices.length === 0) {
      toast.error('At least one choice is required')
      return
    }
    
    if (!currentOption.defaultChoiceCode) {
      toast.error('Default choice is required')
      return
    }
    
    // Check if option name already exists
    const existingOption = newProduct.options.find(option => option.name === currentOption.name)
    if (existingOption && editingOptionIndex === -1) {
      toast.error('Option name already exists')
      return
    }
    
    if (editingOptionIndex >= 0) {
      // Edit existing option
      const updatedOptions = [...newProduct.options]
      updatedOptions[editingOptionIndex] = { ...currentOption }
      setNewProduct({ ...newProduct, options: updatedOptions })
      setEditingOptionIndex(-1)
    } else {
      // Add new option
      setNewProduct({ 
        ...newProduct, 
        options: [...newProduct.options, { ...currentOption }] 
      })
    }
    
    // Reset form
    setCurrentOption({
      name: '',
      defaultChoiceCode: '',
      choices: []
    })
    setShowOptionsForm(false)
    toast.success('Option added successfully')
  }

  const editOption = (index) => {
    const option = newProduct.options[index]
    setCurrentOption({ ...option })
    setEditingOptionIndex(index)
    setShowOptionsForm(true)
  }

  const deleteOption = (index) => {
    if (window.confirm('Are you sure you want to delete this option?')) {
      const updatedOptions = newProduct.options.filter((_, i) => i !== index)
      setNewProduct({ ...newProduct, options: updatedOptions })
      toast.success('Option deleted successfully')
    }
  }

  const addChoice = () => {
    if (!currentChoice.code.trim()) {
      toast.error('Choice code is required')
      return
    }
    
    if (!currentChoice.label.trim()) {
      toast.error('Choice label is required')
      return
    }
    
    if (currentChoice.price === undefined || currentChoice.price === null || isNaN(Number(currentChoice.price))) {
      toast.error('Valid choice price is required')
      return
    }
    
    // Check if choice code already exists in current option
    const existingChoice = currentOption.choices.find(choice => choice.code === currentChoice.code)
    if (existingChoice && editingChoiceIndex === -1) {
      toast.error('Choice code already exists in this option')
      return
    }
    
    if (editingChoiceIndex >= 0) {
      // Edit existing choice
      const updatedChoices = [...currentOption.choices]
      updatedChoices[editingChoiceIndex] = { ...currentChoice }
      setCurrentOption({ ...currentOption, choices: updatedChoices })
      setEditingChoiceIndex(-1)
    } else {
      // Add new choice
      setCurrentOption({ 
        ...currentOption, 
        choices: [...currentOption.choices, { ...currentChoice }] 
      })
    }
    
    // Reset choice form
    setCurrentChoice({
      code: '',
      label: '',
      price: 0,
      image: null
    })
    
    toast.success('Choice added successfully')
  }

  const editChoice = (index) => {
    const choice = currentOption.choices[index]
    setCurrentChoice({ ...choice })
    setEditingChoiceIndex(index)
  }

  const deleteChoice = (index) => {
    if (window.confirm('Are you sure you want to delete this choice?')) {
      const updatedChoices = currentOption.choices.filter((_, i) => i !== index)
      setCurrentOption({ ...currentOption, choices: updatedChoices })
      
      // Reset default choice if deleted choice was the default
      if (currentOption.defaultChoiceCode === currentOption.choices[index].code) {
        setCurrentOption({ ...currentOption, defaultChoiceCode: '' })
      }
      
      toast.success('Choice deleted successfully')
    }
  }

  const handleChoiceImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file size must be less than 5MB')
        return
      }
      
      setCurrentChoice({ ...currentChoice, image: file })
    }
  }

  const resetOptionsForm = () => {
    setCurrentOption({
      name: '',
      defaultChoiceCode: '',
      choices: []
    })
    setCurrentChoice({
      code: '',
      label: '',
      price: 0,
      image: null
    })
    setEditingOptionIndex(-1)
    setEditingChoiceIndex(-1)
    setShowOptionsForm(false)
  }

  const handlePromotionToggle = () => {
    setNewProduct({
      ...newProduct,
      isPromotion: !newProduct.isPromotion,
      promotionPrice: newProduct.isPromotion ? '' : ''
    })
  }

  const calculateDiscount = (originalPrice, promotionPrice) => {
    if (!originalPrice || !promotionPrice) return 0
    return Math.round(((originalPrice - promotionPrice) / originalPrice) * 100)
  }

  // Helper function to get category name from ID
  const getCategoryName = (categoryId) => {
    if (!categoryId) return null
    const category = categories.find(cat => cat._id === categoryId)
    return category ? category.name : categoryId
  }

  const filteredProducts = useMemo(() => foodList
  .filter(p => {
    const term = searchTerm.trim().toLowerCase();
    const name = (p.name || '').toLowerCase();
    const nameVI = (p.nameVI || '').toLowerCase();
    const nameEN = (p.nameEN || '').toLowerCase();
    const nameSK = (p.nameSK || '').toLowerCase();
    const cat = (p.category || p.categoryId || '').toString().toLowerCase();

    const matchesSearch = !term || name.includes(term) || nameVI.includes(term) ||
                          nameEN.includes(term) || nameSK.includes(term) || cat.includes(term);

    const matchesCategory = filterCategory === 'all'
      ? true
      : (p.category === filterCategory || p.categoryId === filterCategory);

    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const st = (p.status || '').toString().toLowerCase().trim();
      matchesStatus = statusFilter === 'active' ? (st === 'active' || st === '')
                                                : (st === 'inactive');
    }
    return matchesSearch && matchesCategory && matchesStatus;
  })
  .sort((a, b) => {
    const qa = Number(a.quantity) || 0;
    const qb = Number(b.quantity) || 0;
    // ưu tiên: 0 trước, rồi <=5, rồi >5; sau đó theo tên
    if (qa === 0 && qb !== 0) return -1;
    if (qb === 0 && qa !== 0) return 1;
    if (qa <= 5 && qb > 5) return -1;
    if (qb <= 5 && qa > 5) return 1;
    return (a.name || '').localeCompare(b.name || '');
  }), [foodList, searchTerm, filterCategory, statusFilter]);

  // Pagination logic
  const totalItems = filteredProducts.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const displayedProducts = filteredProducts.slice(0, currentPage * itemsPerPage)
  const hasMoreItems = currentPage < totalPages

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterCategory, statusFilter])

  const handleLoadMore = () => {
    if (hasMoreItems) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const getStatusBadge = (status) => {
    if (!status) {
      return (
        <span className="status-badge undefined">
          <span className="status-icon">❓</span>
          Undefined
        </span>
      )
    }
    
    // Normalize status
    const normalizedStatus = status.toString().toLowerCase().trim()
    
    const statusConfig = {
      active: {
        icon: '✅',
        label: 'Active',
        className: 'active'
      },
      inactive: {
        icon: '⏸️',
        label: 'Inactive',
        className: 'inactive'
      },
      draft: {
        icon: '📝',
        label: 'Draft',
        className: 'draft'
      },
      archived: {
        icon: '📦',
        label: 'Archived',
        className: 'archived'
      }
    }
    
    const config = statusConfig[normalizedStatus] || {
      icon: '❓',
      label: status.toString().charAt(0).toUpperCase() + status.toString().slice(1),
      className: 'unknown'
    }
    
    return (
      <span className={`status-badge ${config.className}`}>
        <span className="status-icon">{config.icon}</span>
        {config.label}
      </span>
    )
  }

  return (
    <div className='products-page'>
      <div className="products-header">
        <div className="header-content">
          <h1>{t('products.title', { defaultValue: 'Products Management' })}</h1>
          <p>{t('products.subtitle', { defaultValue: 'Manage your food products' })}</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={() => fetchFoodList(true)}>
            <span>🔄</span> {t('common.refresh', { defaultValue: 'Refresh' })}
          </button>
          <button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="btn-add-product"
          >
            {showAddForm ? t('common.cancel', { defaultValue: 'Cancel' }) : t('products.addNew', { defaultValue: 'Add New Product' })}
          </button>
        </div>
      </div>

    

      {/* Error State */}
      {error && (
        <div style={{ padding: '20px', textAlign: 'center', color: 'red', background: '#ffe6e6', margin: '10px 0', borderRadius: '5px' }}>
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => { setError(null); fetchFoodList(); fetchCategories(); }} style={{ padding: '10px 20px', margin: '10px' }}>
            Retry
          </button>
        </div>
      )}

      {/* No Products State */}
      {!isLoading && !error && foodList.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          <h3>No products found</h3>
          <p>Try refreshing the page or check if the backend is running.</p>
          <button onClick={fetchFoodList} style={{ padding: '10px 20px', margin: '10px' }}>
            Retry
          </button>
        </div>
      )}

      {/* Add Product Form */}
      {showAddForm && (
        <div className="add-product-section">
          <h2>{t('products.addNew', { defaultValue: 'Add New Product' })}</h2>
          <form onSubmit={handleAddProduct} className="product-form">
                                <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="sku">{t('products.sku', { defaultValue: 'SKU' })} *</label>
                        <input
                          type="text"
                          id="sku"
                          value={newProduct.sku}
                          onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                          placeholder={t('products.skuPlaceholder')}
                          required
                        />
                      </div>
                      <div className="form-group">
                            <label>{t('products.name', { defaultValue: 'Name' })}</label>
                            <input
                                type="text"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('products.nameVI', { defaultValue: 'Name (Vietnamese)' })}</label>
                            <input
                                type="text"
                                value={newProduct.nameVI}
                                onChange={(e) => setNewProduct({...newProduct, nameVI: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('products.nameEN', { defaultValue: 'Name (English)' })}</label>
                            <input
                                type="text"
                                value={newProduct.nameEN}
                                onChange={(e) => setNewProduct({...newProduct, nameEN: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('products.nameSK', { defaultValue: 'Name (Slovak)' })}</label>
                            <input
                                type="text"
                                value={newProduct.nameSK}
                                onChange={(e) => setNewProduct({...newProduct, nameSK: e.target.value})}
                            />
                        </div>

                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="description">{t('products.description', { defaultValue: 'Description' })}</label>
                        <textarea
                          id="description"
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          placeholder={t('products.descriptionPlaceholder', 'Enter product description')}
                          rows="3"
                        />
                      </div>
                    </div>
            


            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">{t('products.category', { defaultValue: 'Category' })} *</label>
                <select
                  id="category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  required
                >
                                  <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="price">{t('products.price', { defaultValue: 'Price' })} *</label>
                <input
                  type="number"
                  id="price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) || 0 })}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  required
                />
                                      </div>
                        <div className="form-group">
                            <label>{t('products.slug', { defaultValue: 'Slug' })}</label>
                            <input
                                type="text"
                                value={newProduct.slug}
                                onChange={(e) => setNewProduct({...newProduct, slug: e.target.value})}
                                placeholder="Auto-generated from name"
                            />
                        </div>
                    </div>

                    <div className="form-row">
              <div className="form-group">
                <label htmlFor="quantity">{t('products.quantity', { defaultValue: 'Quantity' })} *</label>
                <input
                  type="number"
                  id="quantity"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })}
                  placeholder="Enter quantity"
                  min="0"
                  step="1"
                  required
                />
              </div>
            </div>



            <div className="form-row">
              <div className="form-group">
                <label htmlFor="image">{t('products.image', { defaultValue: 'Image' })}</label>
                <input
                  type="file"
                  id="image"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>
              
            </div>

            <div className="promotion-section">
              <div className="promotion-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={newProduct.isPromotion}
                    onChange={handlePromotionToggle}
                  />
                  {t('products.promotion', { defaultValue: 'Promotion' })}
                </label>
              </div>

              {newProduct.isPromotion && (
                <div className="promotion-fields">
                  <div className="form-row">

                    <div className="form-group">
                      <label htmlFor="promotionPrice">{t('products.promotionPrice', { defaultValue: 'Promotion Price' })} *</label>
                      <input
                        type="number"
                        id="promotionPrice"
                        value={newProduct.promotionPrice}
                        onChange={(e) => setNewProduct({ ...newProduct, promotionPrice: e.target.value })}
                        placeholder="Promotion price"
                        min="0"
                        step="0.01"
                        required={newProduct.isPromotion}
                      />
                    </div>
                  </div>
                  {newProduct.promotionPrice && (
                    <div className="discount-info">
                      <span className="discount-badge">
                        Promotion Active! Save €{(parseFloat(newProduct.price) - parseFloat(newProduct.promotionPrice)).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Variant Options Section - Redesigned like Shopify */}
            <div className="options-section">
              <div className="section-header">
                <h3>🔄 Product Options & Variants</h3>
                <p>Add customizable options like protein type, size, spiciness, etc. (Similar to Shopify)</p>
              </div>

              {/* Display existing options */}
              {newProduct.options.length > 0 && (
                <div className="existing-options">
                  <h4>Current Options:</h4>
                  {newProduct.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="option-item">
                      <div className="option-header">
                        <h5>{option.name}</h5>
                        <div className="option-actions">
                          <button 
                            type="button" 
                            onClick={() => editOption(optionIndex)}
                            className="btn-edit"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            type="button" 
                            onClick={() => deleteOption(optionIndex)}
                            className="btn-delete"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                      <div className="choices-list">
                        {option.choices.map((choice, choiceIndex) => (
                          <div key={choiceIndex} className="choice-item">
                            <span className="choice-code">{choice.code}</span>
                            <span className="choice-label">{choice.label}</span>
                            <span className="choice-price">€{Number(choice.price).toFixed(2)}</span>
                            {choice.image && (
                              <div className="choice-image">
                                <img 
                                  src={
                                    choice.image.startsWith('http')
                                      ? choice.image
                                      : `${config.BACKEND_URL}/images/${choice.image}`
                                  }
                                  alt={`${choice.label} choice`}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJJbWFnZSBFcnJvcjwvdGV4dD48L3N2Zz4=';
                                  }}
                                  style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '3px' }}
                                />
                              </div>
                            )}
                            {option.defaultChoiceCode === choice.code && (
                              <span className="default-badge">Default</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Simple Add Option Form - Like Shopify */}
              {!showOptionsForm && (
                <div className="simple-option-form">
                                      <div className="form-row">
                      <div className="form-group">
                        <label>Option Name</label>
                        <input
                          type="text"
                          value={currentOption.name}
                          onChange={(e) => setCurrentOption({...currentOption, name: e.target.value})}
                          placeholder="e.g., Protein, Size, Spiciness"
                        />
                      </div>
                    </div>

                  {/* Quick Add Choices - Like Shopify */}
                  <div className="quick-choices-section">
                    <h5>Choices (Quick Add):</h5>
                    <div className="quick-choice-inputs">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Choice 1</label>
                          <input
                            type="text"
                            placeholder="e.g., Chicken"
                            onChange={(e) => {
                              const choices = [...currentOption.choices]
                              if (choices[0]) {
                                choices[0].label = e.target.value
                                choices[0].code = 'a'
                              } else {
                                choices.push({ code: 'a', label: e.target.value, price: 0, image: null })
                              }
                              setCurrentOption({...currentOption, choices, defaultChoiceCode: 'a'})
                            }}
                          />
                          <input
                            type="number"
                            placeholder="Price"
                            step="0.01"
                            onChange={(e) => {
                              const choices = [...currentOption.choices]
                              if (choices[0]) {
                                choices[0].price = parseFloat(e.target.value) || 0
                              }
                              setCurrentOption({...currentOption, choices})
                            }}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const choices = [...currentOption.choices]
                                if (choices[0]) {
                                  choices[0].image = file
                                }
                                setCurrentOption({...currentOption, choices})
                              }
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>Choice 2</label>
                          <input
                            type="text"
                            placeholder="e.g., Beef"
                            onChange={(e) => {
                              const choices = [...currentOption.choices]
                              if (choices[1]) {
                                choices[1].label = e.target.value
                                choices[1].code = 'b'
                              } else if (choices.length > 0) {
                                choices.push({ code: 'b', label: e.target.value, price: 0, image: null })
                              }
                              setCurrentOption({...currentOption, choices})
                            }}
                          />
                          <input
                            type="number"
                            placeholder="Price"
                            step="0.01"
                            onChange={(e) => {
                              const choices = [...currentOption.choices]
                              if (choices[1]) {
                                choices[1].price = parseFloat(e.target.value) || 0
                              }
                              setCurrentOption({...currentOption, choices})
                            }}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const choices = [...currentOption.choices]
                                if (choices[1]) {
                                  choices[1].image = file
                                }
                                setCurrentOption({...currentOption, choices})
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Choice 3</label>
                          <input
                            type="text"
                            placeholder="e.g., Shrimp"
                            onChange={(e) => {
                              const choices = [...currentOption.choices]
                              if (choices[2]) {
                                choices[2].label = e.target.value
                                choices[2].code = 'c'
                              } else if (choices.length > 1) {
                                choices.push({ code: 'c', label: e.target.value, price: 0, image: null })
                              }
                              setCurrentOption({...currentOption, choices})
                            }}
                          />
                          <input
                            type="number"
                            placeholder="Price"
                            step="0.01"
                            onChange={(e) => {
                              const choices = [...currentOption.choices]
                              if (choices[2]) {
                                choices[2].price = parseFloat(e.target.value) || 0
                              }
                              setCurrentOption({...currentOption, choices})
                            }}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const choices = [...currentOption.choices]
                                if (choices[2]) {
                                  choices[2].image = file
                                }
                                setCurrentOption({...currentOption, choices})
                              }
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>Choice 4</label>
                          <input
                            type="text"
                            placeholder="e.g., Tofu"
                            onChange={(e) => {
                              const choices = [...currentOption.choices]
                              if (choices[3]) {
                                choices[3].label = e.target.value
                                choices[3].code = 'd'
                              } else if (choices.length > 2) {
                                choices.push({ code: 'd', label: e.target.value, price: 0, image: null })
                              }
                              setCurrentOption({...currentOption, choices})
                            }}
                          />
                          <input
                            type="number"
                            placeholder="Price"
                            step="0.01"
                            onChange={(e) => {
                              const choices = [...currentOption.choices]
                              if (choices[3]) {
                                choices[3].price = parseFloat(e.target.value) || 0
                              }
                              setCurrentOption({...currentOption, choices})
                            }}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const choices = [...currentOption.choices]
                                if (choices[3]) {
                                  choices[3].image = file
                                }
                                setCurrentOption({...currentOption, choices})
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Default Choice Selection */}
                    {currentOption.choices.length > 0 && (
                      <div className="default-choice-section">
                        <label>Default Choice:</label>
                        <select
                          value={currentOption.defaultChoiceCode}
                          onChange={(e) => setCurrentOption({...currentOption, defaultChoiceCode: e.target.value})}
                        >
                          <option value="">Select default choice</option>
                          {currentOption.choices.map((choice) => (
                            <option key={choice.code} value={choice.code}>
                              {choice.code} - {choice.label} (€{choice.price})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Add Option Button */}
                    <div className="option-actions">
                      <button 
                        type="button" 
                        onClick={addOption}
                        className="btn-primary"
                        disabled={!currentOption.name || currentOption.choices.length === 0 || !currentOption.defaultChoiceCode}
                      >
                        ➕ Add Option
                      </button>
                      <button 
                        type="button" 
                        onClick={resetOptionsForm}
                        className="btn-secondary"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Options Form (Hidden by default) */}
              {showOptionsForm && (
                <div className="advanced-option-form">
                  <h4>Advanced Options Editor</h4>
                  <p>Use this for complex options with images and custom codes</p>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Option Name *</label>
                      <input
                        type="text"
                        value={currentOption.name}
                        onChange={(e) => setCurrentOption({...currentOption, name: e.target.value})}
                        placeholder="e.g., Protein, Size, Spiciness"
                      />
                    </div>
                    <div className="form-group">
                      <label>Pricing Mode *</label>
                      <select
                        value={currentOption.pricingMode}
                        onChange={(e) => setCurrentOption({...currentOption, pricingMode: e.target.value})}
                      >
                        <option value="add">Add to base price</option>
                        <option value="override">Override base price</option>
                      </select>
                    </div>
                  </div>

                  {/* Advanced Choices Management */}
                  <div className="choices-section">
                    <h5>Advanced Choices:</h5>
                    
                    {/* Display existing choices */}
                    {currentOption.choices.length > 0 && (
                      <div className="choices-list">
                        {currentOption.choices.map((choice, index) => (
                          <div key={index} className="choice-item">
                                                    <span className="choice-code">{choice.code}</span>
                        <span className="choice-label">{choice.label}</span>
                        <span className="choice-price">€{Number(choice.price).toFixed(2)}</span>
                        {choice.image && (
                          <div className="choice-image">
                            <img 
                              src={
                                choice.image.startsWith('http')
                                  ? choice.image
                                  : `${config.BACKEND_URL}/images/${choice.image}`
                              }
                              alt={`${choice.label} choice`}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJJbWFnZSBFcnJvcjwvdGV4dD48L3N2Zz4=';
                              }}
                              style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '3px' }}
                            />
                          </div>
                        )}
                            <div className="choice-actions">
                              <button 
                                type="button" 
                                onClick={() => editChoice(index)}
                                className="btn-edit-small"
                              >
                                ✏️
                              </button>
                              <button 
                                type="button" 
                                onClick={() => deleteChoice(index)}
                                className="btn-delete-small"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add/Edit Choice Form */}
                    <div className="choice-form">
                      <h6>{editingChoiceIndex >= 0 ? 'Edit Choice' : 'Add New Choice'}</h6>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>Code *</label>
                          <input
                            type="text"
                            value={currentChoice.code}
                            onChange={(e) => setCurrentChoice({...currentChoice, code: e.target.value})}
                            placeholder="e.g., a, b, c"
                          />
                        </div>
                        <div className="form-group">
                          <label>Label *</label>
                          <input
                            type="text"
                            value={currentChoice.label}
                            onChange={(e) => setCurrentChoice({...currentChoice, label: e.target.value})}
                            placeholder="e.g., Chicken, Beef, Shrimp"
                          />
                        </div>
                        <div className="form-group">
                          <label>Price *</label>
                          <input
                            type="number"
                            value={currentChoice.price}
                            onChange={(e) => setCurrentChoice({...currentChoice, price: parseFloat(e.target.value) || 0})}
                            placeholder="0.00"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Image (Optional)</label>
                          <input
                            type="file"
                            onChange={handleChoiceImageChange}
                            accept="image/*"
                          />
                        </div>
                      </div>

                      <div className="choice-actions">
                        <button 
                          type="button" 
                          onClick={addChoice}
                          className="btn-primary"
                        >
                          {editingChoiceIndex >= 0 ? 'Update Choice' : 'Add Choice'}
                        </button>
                        {editingChoiceIndex >= 0 && (
                          <button 
                            type="button" 
                            onClick={() => setEditingChoiceIndex(-1)}
                            className="btn-secondary"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Default Choice Selection */}
                    {currentOption.choices.length > 0 && (
                      <div className="default-choice-section">
                        <label>Default Choice:</label>
                        <select
                          value={currentOption.defaultChoiceCode}
                          onChange={(e) => setCurrentOption({...currentOption, defaultChoiceCode: e.target.value})}
                        >
                          <option value="">Select default choice</option>
                          {currentOption.choices.map((choice) => (
                            <option key={choice.code} value={choice.code}>
                              {choice.code} - {choice.label} (€{choice.price})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="option-actions">
                    <button 
                      type="button" 
                      onClick={addOption}
                      className="btn-primary"
                      disabled={!currentOption.name || currentOption.choices.length === 0 || !currentOption.defaultChoiceCode}
                    >
                      {editingOptionIndex >= 0 ? 'Update Option' : 'Add Option'}
                    </button>
                    <button 
                      type="button" 
                      onClick={resetOptionsForm}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Toggle between Simple and Advanced */}
              <div className="options-toggle">
                <button 
                  type="button" 
                  onClick={() => setShowOptionsForm(!showOptionsForm)}
                  className="btn-toggle"
                >
                  {showOptionsForm ? '🔽 Use Simple Mode' : '🔼 Use Advanced Mode'}
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? t('common.loading', { defaultValue: 'Loading' }) : t('products.addNew', { defaultValue: 'Add New Product' })}
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)} 
                className="btn-secondary"
              >
                {t('common.cancel', { defaultValue: 'Cancel' })}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="status-filter-tabs">
        <button
          className={`status-tab ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          <span className="tab-icon">📦</span>
          All Products
          <span className="tab-count">({foodList.length})</span>
        </button>
        <button
          className={`status-tab ${statusFilter === 'active' ? 'active' : ''}`}
          onClick={() => setStatusFilter('active')}
        >
          <span className="tab-icon">✅</span>
          Active
          <span className="tab-count">({foodList.filter(p => {
            const status = p.status ? p.status.toString().toLowerCase().trim() : ''
            return status === 'active' || status === ''
          }).length})</span>
        </button>
        <button
          className={`status-tab ${statusFilter === 'inactive' ? 'active' : ''}`}
          onClick={() => setStatusFilter('inactive')}
        >
          <span className="tab-icon">⏸️</span>
          Inactive
          <span className="tab-count">({foodList.filter(p => {
            const status = p.status ? p.status.toString().toLowerCase().trim() : ''
            return status === 'inactive'
          }).length})</span>
        </button>
      </div>
      


      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
                            <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-section">
        {isLoading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <div className="products-grid">
            {displayedProducts.map((product) => {
              // Debug log for test product
              if (product.name === 'test') {
                console.log(`DEBUG - Rendering test product: ${product.name}, status: "${product.status}", filter: ${statusFilter}`)
              }
              return (
                <div key={product._id} className="product-card">
                <div className="product-image">
                
                  <img 
                    src={
                      product.image && product.image.startsWith('http')
                        ? product.image
                        : product.image 
                          ? `${config.BACKEND_URL}/images/${product.image}`
                          : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='
                    }
                    alt={product.name || 'Product'} 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBFcnJvcjwvdGV4dD48L3N2Zz4='; }}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                  <div className="product-overlay">
                  <button onClick={() => handleStatusToggle(product._id, product.status)} className="status-toggle">
  {getStatusBadge(product.status)}
  <span className="sr-only">{t('products.toggleStatus')}</span>
</button>
                    {(product.quantity || 0) === 0 && (
                      <div className="out-of-stock-badge">
                        <span className="out-of-stock-icon">🚫</span>
                        Out of Stock
                      </div>
                    )}
                  </div>
                </div>
                <div className="product-content">
                  <div className="product-header">
                    <h3>{product.name || product.nameVI || product.nameEN || product.nameSK || 'Unnamed Product'}</h3>
                    <span className="product-sku">SKU: {product.sku || 'N/A'}</span>
                  </div>
                  <div className="product-info">
                    {product.nameVI && <p className="product-name-vi">🇻🇳 {product.nameVI}</p>}
                    {product.nameEN && <p className="product-name-en">🇬🇧 {product.nameEN}</p>}
                    {product.nameSK && <p className="product-name-sk">🇸🇰 {product.nameSK}</p>}
                    <p className="product-category">📁 {getCategoryName(product.category) || 'No Category'}</p>
                    <p className="product-description">📝 {product.description || 'No description'}</p>
                    <div className="product-inventory">
                      <InventoryStatus quantity={product.quantity || 0} />
                    </div>
                  </div>
                  <div className="product-pricing">
                    {product.isPromotion && product.promotionPrice ? (
                      <div className="promotion-pricing">
                        <div className="original-price">€{Number(product.price).toFixed(2)}</div>
                        <div className="promotion-price">€{Number(product.promotionPrice).toFixed(2)}</div>
                        <div className="discount-badge">
                          Save €{(parseFloat(product.price) - parseFloat(product.promotionPrice)).toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <div className="regular-price">€{(Number(product.price) || 0).toFixed(2)}</div>
                    )}
                    
                    {/* Display variant options if available */}
                    {product.options && product.options.length > 0 && (
                      <div className="variant-options">
                        <div className="variant-label">Variants:</div>
                        {product.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="variant-option">
                            <span className="variant-name">{option.name}:</span>
                            <div className="variant-choices">
                              {option.choices.map((choice, choiceIndex) => (
                                <div key={choiceIndex} className="variant-choice">
                                  <div className="choice-info">
                                    <span className="choice-label">{choice.label}</span>
                                    <span className="choice-price">€{Number(choice.price).toFixed(2)}</span>
                                  </div>
                                  {choice.image && (
                                    <div className="choice-image">
                                      <img 
                                        src={
                                          choice.image.startsWith('http')
                                            ? choice.image
                                            : `${config.BACKEND_URL}/images/${choice.image}`
                                        }
                                        alt={`${choice.label} variant`}
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5WYXJpYW50IEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                                        }}
                                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="product-actions">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="btn-edit"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="btn-delete"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          </div>
        )}
        
        {/* Load More Button */}
        {!isLoading && hasMoreItems && (
          <div className="load-more-container">
            <button 
              className="load-more-btn"
              onClick={handleLoadMore}
            >
              Load More ({totalItems - displayedProducts.length} more products)
            </button>
          </div>
        )}
        
        {/* Pagination Info */}
        {!isLoading && !hasMoreItems && totalItems > itemsPerPage && (
          <div className="pagination-info-container">
            <p>Showing all {totalItems} products</p>
          </div>
        )}
        
        {/* Pagination Stats */}
        {!isLoading && (
          <div className="pagination-stats">
            <p>Showing {displayedProducts.length} of {totalItems} products</p>
          </div>
        )}
      </div>

      {/* Edit Product Popup */}
      <EditProductPopup
        isOpen={!!editingProduct}
        product={editingProduct}
        editForm={editForm}
        onInputChange={handleInputChange}
        onSubmit={handleSubmitEdit}
        onCancel={closeEditForm}
        categories={categories}
        onImageChange={handleEditImageChange}
        url={url}
      />

      {/* Summary Stats */}
      <div className="products-summary">
        <div className="summary-card">
          <h3>{t('dashboard.totalProducts', { defaultValue: 'Total Products' })}</h3>
          <p>{foodList.length}</p>
        </div>
        <div className="summary-card">
          <h3>{t('dashboard.activeProducts', { defaultValue: 'Active Products' })}</h3>
          <p>{foodList.filter(p => {
            const st = (p.status || '').toString().toLowerCase().trim();
            return st === 'active' || st === '';
          }).length}</p>
        </div>
        <div className="summary-card">
          <h3>{t('dashboard.categories', { defaultValue: 'Categories' })}</h3>
          <p>{categories.length}</p>
        </div>
        <div className="summary-card">
          <h3>{t('dashboard.totalStock', { defaultValue: 'Total Stock' })}</h3>
          <p>{foodList.reduce((sum, product) => sum + (Number(product.quantity) || 0), 0)}</p>
        </div>
        <div className="summary-card">
          <h3>{t('dashboard.lowStockItems', { defaultValue: 'Low Stock Items' })}</h3>
          <p>{foodList.filter(product => (product.quantity || 0) <= 5 && (product.quantity || 0) > 0).length}</p>
        </div>
        <div className="summary-card">
          <h3>{t('dashboard.outOfStock', { defaultValue: 'Out of Stock' })}</h3>
          <p>{foodList.filter(product => (product.quantity || 0) === 0).length}</p>
        </div>
                <div className="summary-card">
          <h3>{t('dashboard.averagePrice', { defaultValue: 'Average Price' })}</h3>
          <p>
€{
  foodList.length
    ? (
        foodList.reduce((s, p) => {
          // Calculate average considering variants
          let totalPrice = Number(p.price) || 0;
          if (p.options && p.options.length > 0) {
            // Add variant prices to calculation
            p.options.forEach(option => {
              if (option.choices && option.choices.length > 0) {
                const avgVariantPrice = option.choices.reduce((sum, choice) => sum + (Number(choice.price) || 0), 0) / option.choices.length;
                totalPrice += avgVariantPrice;
              }
            });
          }
          return s + totalPrice;
        }, 0) / foodList.length
      ).toFixed(2)
    : '0.00'
}
</p>
        </div>
      </div>


    </div>
  )
}

export default Products 