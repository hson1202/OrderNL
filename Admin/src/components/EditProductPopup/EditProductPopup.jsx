import React, { useState, useCallback, useMemo } from 'react';
import './EditProductPopup.css';

const EditProductPopup = ({ 
  isOpen, 
  product, 
  editForm, 
  onInputChange, 
  onSubmit, 
  onCancel, 
  categories,
  onImageChange,
  url
}) => {
  const [showOptionsForm, setShowOptionsForm] = useState(false);
  const [currentOption, setCurrentOption] = useState({
    name: '',
    type: 'select',
    defaultChoiceCode: '',
    choices: [],
    pricingMode: 'add'
  });
  const [editingOptionIndex, setEditingOptionIndex] = useState(-1);
  const [editingChoiceIndex, setEditingChoiceIndex] = useState(-1);
  const [currentChoice, setCurrentChoice] = useState({
    code: '',
    label: '',
    price: 0,
    image: null
  });

  // Memoize initial states để tránh tạo lại object không cần thiết
  const initialOption = useMemo(() => ({
    name: '',
    type: 'select',
    defaultChoiceCode: '',
    choices: [],
    pricingMode: 'add'
  }), []);

  const initialChoice = useMemo(() => ({
    code: '',
    label: '',
    price: 0,
    image: null
  }), []);

  // Validate functions
  const validateOption = useCallback((option, existingOptions, editingIndex = -1) => {
    if (!option.name.trim()) {
      return 'Option name is required';
    }
    
    if (option.choices.length === 0) {
      return 'At least one choice is required';
    }
    
    if (!option.defaultChoiceCode) {
      return 'Default choice is required';
    }
    
    // Check duplicate names
    const duplicate = existingOptions.find((opt, index) => 
      opt.name === option.name && index !== editingIndex
    );
    if (duplicate) {
      return 'Option name already exists';
    }
    
    return null;
  }, []);

  const validateChoice = useCallback((choice, existingChoices, editingIndex = -1) => {
    if (!choice.code.trim()) {
      return 'Choice code is required';
    }
    
    if (!choice.label.trim()) {
      return 'Choice label is required';
    }
    
    if (choice.price === undefined || choice.price === null || isNaN(Number(choice.price))) {
      return 'Valid choice price is required';
    }
    
    // Check duplicate codes
    const duplicate = existingChoices.find((ch, index) => 
      ch.code === choice.code && index !== editingIndex
    );
    if (duplicate) {
      return 'Choice code already exists in this option';
    }
    
    return null;
  }, []);

  // Reset functions
  const resetOptionsForm = useCallback(() => {
    setCurrentOption({ ...initialOption });
    setCurrentChoice({ ...initialChoice });
    setEditingOptionIndex(-1);
    setEditingChoiceIndex(-1);
    setShowOptionsForm(false);
  }, [initialOption, initialChoice]);

  const resetChoiceForm = useCallback(() => {
    setCurrentChoice({ ...initialChoice });
    setEditingChoiceIndex(-1);
  }, [initialChoice]);

  // Option management
  const addOption = useCallback(() => {
    const error = validateOption(currentOption, editForm.options || [], editingOptionIndex);
    if (error) {
      alert(error);
      return;
    }
    
    const updatedOptions = [...(editForm.options || [])];
    
    if (editingOptionIndex >= 0) {
      updatedOptions[editingOptionIndex] = { ...currentOption };
    } else {
      updatedOptions.push({ ...currentOption });
    }
    
    onInputChange({
      target: { name: 'options', value: updatedOptions }
    });
    
    resetOptionsForm();
    alert(`Option ${editingOptionIndex >= 0 ? 'updated' : 'added'} successfully`);
  }, [currentOption, editForm.options, editingOptionIndex, onInputChange, resetOptionsForm, validateOption]);

  const editOption = useCallback((index) => {
    const option = editForm.options[index];
    setCurrentOption({ ...option });
    setEditingOptionIndex(index);
    setShowOptionsForm(true);
  }, [editForm.options]);

  const deleteOption = useCallback((index) => {
    if (!window.confirm('Are you sure you want to delete this option?')) {
      return;
    }
    
    const updatedOptions = editForm.options.filter((_, i) => i !== index);
    onInputChange({
      target: { name: 'options', value: updatedOptions }
    });
    alert('Option deleted successfully');
  }, [editForm.options, onInputChange]);

  // Choice management
  const addChoice = useCallback(() => {
    const error = validateChoice(currentChoice, currentOption.choices, editingChoiceIndex);
    if (error) {
      alert(error);
      return;
    }
    
    const updatedChoices = [...currentOption.choices];
    
    if (editingChoiceIndex >= 0) {
      updatedChoices[editingChoiceIndex] = { ...currentChoice };
    } else {
      updatedChoices.push({ ...currentChoice });
    }
    
    setCurrentOption({ ...currentOption, choices: updatedChoices });
    resetChoiceForm();
    alert(`Choice ${editingChoiceIndex >= 0 ? 'updated' : 'added'} successfully`);
  }, [currentChoice, currentOption, editingChoiceIndex, resetChoiceForm, validateChoice]);

  const editChoice = useCallback((index) => {
    const choice = currentOption.choices[index];
    setCurrentChoice({ ...choice });
    setEditingChoiceIndex(index);
  }, [currentOption.choices]);

  const deleteChoice = useCallback((index) => {
    if (!window.confirm('Are you sure you want to delete this choice?')) {
      return;
    }
    
    const updatedChoices = currentOption.choices.filter((_, i) => i !== index);
    const deletedChoice = currentOption.choices[index];
    
    // Reset default choice if deleted choice was the default
    const newDefaultCode = currentOption.defaultChoiceCode === deletedChoice.code 
      ? '' 
      : currentOption.defaultChoiceCode;
    
    setCurrentOption({ 
      ...currentOption, 
      choices: updatedChoices,
      defaultChoiceCode: newDefaultCode
    });
    
    alert('Choice deleted successfully');
  }, [currentOption]);

  // Event handlers
  const handleOptionChange = useCallback((field, value) => {
    setCurrentOption(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleChoiceChange = useCallback((field, value) => {
    setCurrentChoice(prev => ({ 
      ...prev, 
      [field]: field === 'price' ? parseFloat(value) || 0 : value 
    }));
  }, []);

  // Memoize image source calculation
  const imageSrc = useMemo(() => {
    if (editForm.imagePreview) {
      return editForm.imagePreview;
    }
    
    if (!product?.image) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn42dIE5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    }
    
    return product.image.startsWith('http') 
      ? product.image 
      : `${url}/images/${product.image}`;
  }, [editForm.imagePreview, product?.image, url]);

  // Calculate discount
  const discountAmount = useMemo(() => {
    if (!editForm.isPromotion || !editForm.price || !editForm.promotionPrice) {
      return 0;
    }
    return parseFloat(editForm.price) - parseFloat(editForm.promotionPrice);
  }, [editForm.isPromotion, editForm.price, editForm.promotionPrice]);

  if (!isOpen || !product) return null;

  return (
    <div className="edit-product-popup-overlay" onClick={onCancel}>
      <div className="edit-product-popup" onClick={e => e.stopPropagation()}>
        <div className="edit-product-popup-header">
          <div className="header-content">
            <h2>Edit Product</h2>
            <p className="header-subtitle">Update product information</p>
          </div>
          <button 
            className="close-btn"
            onClick={onCancel}
            title="Close"
            type="button"
          >
            ×
          </button>
        </div>

        <div className="edit-product-popup-content">
          <form onSubmit={onSubmit}>
            {/* Basic Information */}
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>SKU *</label>
                  <input
                    type="text"
                    name="sku"
                    value={editForm.sku || ''}
                    onChange={onInputChange}
                    required
                    placeholder="Enter SKU"
                  />
                </div>
                
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={editForm.price || ''}
                    onChange={onInputChange}
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name || ''}
                    onChange={onInputChange}
                    required
                    placeholder="Enter product name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={editForm.category || ''}
                    onChange={onInputChange}
                    required
                  >
                    <option value="">Select category</option>
                    {categories?.map(category => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Name (Vietnamese)</label>
                  <input
                    type="text"
                    name="nameVI"
                    value={editForm.nameVI || ''}
                    onChange={onInputChange}
                    placeholder="Enter Vietnamese name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Name (English)</label>
                  <input
                    type="text"
                    name="nameEN"
                    value={editForm.nameEN || ''}
                    onChange={onInputChange}
                    placeholder="Enter English name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Name (Slovak)</label>
                  <input
                    type="text"
                    name="nameSK"
                    value={editForm.nameSK || ''}
                    onChange={onInputChange}
                    placeholder="Enter Slovak name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={editForm.quantity || ''}
                    onChange={onInputChange}
                    required
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={editForm.description || ''}
                  onChange={onInputChange}
                  rows="4"
                  placeholder="Enter product description..."
                />
              </div>
            </div>

            {/* Product Image */}
            <div className="form-section">
              <h3 className="section-title">Product Image</h3>
              
              <div className="image-upload-section">
                <div className="current-image">
                  <img 
                    src={imageSrc}
                    alt={editForm.imagePreview ? "New image preview" : "Current product image"} 
                    className="current-product-image"
                    loading="lazy"
                  />
                  <p className="image-label">
                    {editForm.imagePreview ? "New Image Preview" : "Current Image"}
                  </p>
                </div>
                
                <input
                  type="file"
                  id="edit-image-upload"
                  onChange={onImageChange}
                  accept="image/*"
                  className="image-input"
                />
                <label htmlFor="edit-image-upload" className="image-upload-label">
                  📁 Choose New Image
                </label>
                <small className="form-help">
                  Upload a new image to replace the current one (optional)
                </small>
              </div>
            </div>

            {/* Variant Options Section */}
            <div className="form-section">
              <h3 className="section-title">Product Options & Variants</h3>
              <p className="section-description">Customize options like protein type, size, spiciness, etc.</p>

              {/* Display existing options */}
              {editForm.options && editForm.options.length > 0 && (
                <div className="existing-options">
                  <h4>Current Options:</h4>
                  <div className="options-list">
                    {editForm.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="option-card">
                        <div className="option-header">
                          <div className="option-info">
                            <h5>{option.name}</h5>
                            <span className="pricing-mode">{option.pricingMode}</span>
                          </div>
                          <div className="option-actions">
                            <button 
                              type="button" 
                              onClick={() => editOption(optionIndex)}
                              className="btn btn-edit"
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              type="button" 
                              onClick={() => deleteOption(optionIndex)}
                              className="btn btn-delete"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                        
                        <div className="choices-grid">
                          {option.choices.map((choice, choiceIndex) => (
                            <div 
                              key={choiceIndex} 
                              className={`choice-card ${option.defaultChoiceCode === choice.code ? 'default' : ''}`}
                            >
                              <div className="choice-code">{choice.code}</div>
                              <div className="choice-label">{choice.label}</div>
                              <div className="choice-price">€{choice.price}</div>
                              {choice.image && <div className="choice-image">📷</div>}
                              {option.defaultChoiceCode === choice.code && (
                                <div className="default-badge">Default</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add/Edit Option Form */}
              {showOptionsForm && (
                <div className="option-form">
                  <div className="form-header">
                    <h4>{editingOptionIndex >= 0 ? 'Edit Option' : 'Add New Option'}</h4>
                    <button 
                      type="button" 
                      onClick={resetOptionsForm}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Option Name *</label>
                      <input
                        type="text"
                        value={currentOption.name}
                        onChange={(e) => handleOptionChange('name', e.target.value)}
                        placeholder="e.g., Protein, Size, Spiciness"
                      />
                    </div>
                    <div className="form-group">
                      <label>Pricing Mode *</label>
                      <select
                        value={currentOption.pricingMode}
                        onChange={(e) => handleOptionChange('pricingMode', e.target.value)}
                      >
                        <option value="add">Add to base price</option>
                        <option value="override">Override base price</option>
                      </select>
                    </div>
                  </div>

                  {/* Choices Management */}
                  <div className="choices-section">
                    <h5>Choices:</h5>
                    
                    {/* Display existing choices */}
                    {currentOption.choices.length > 0 && (
                      <div className="choices-grid">
                        {currentOption.choices.map((choice, index) => (
                          <div key={index} className="choice-card">
                            <div className="choice-code">{choice.code}</div>
                            <div className="choice-label">{choice.label}</div>
                            <div className="choice-price">€{choice.price}</div>
                            {choice.image && <div className="choice-image">📷</div>}
                            <div className="choice-actions">
                              <button 
                                type="button" 
                                onClick={() => editChoice(index)}
                                className="btn btn-edit btn-sm"
                              >
                                ✏️
                              </button>
                              <button 
                                type="button" 
                                onClick={() => deleteChoice(index)}
                                className="btn btn-delete btn-sm"
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
                            onChange={(e) => handleChoiceChange('code', e.target.value)}
                            placeholder="e.g., a, b, c"
                          />
                        </div>
                        <div className="form-group">
                          <label>Label *</label>
                          <input
                            type="text"
                            value={currentChoice.label}
                            onChange={(e) => handleChoiceChange('label', e.target.value)}
                            placeholder="e.g., Chicken, Beef, Shrimp"
                          />
                        </div>
                        <div className="form-group">
                          <label>Price *</label>
                          <input
                            type="number"
                            value={currentChoice.price}
                            onChange={(e) => handleChoiceChange('price', e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="choice-form-actions">
                        <button 
                          type="button" 
                          onClick={addChoice}
                          className="btn btn-primary"
                        >
                          {editingChoiceIndex >= 0 ? 'Update Choice' : 'Add Choice'}
                        </button>
                        {editingChoiceIndex >= 0 && (
                          <button 
                            type="button" 
                            onClick={resetChoiceForm}
                            className="btn btn-secondary"
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
                          onChange={(e) => handleOptionChange('defaultChoiceCode', e.target.value)}
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

                  <div className="option-form-actions">
                    <button 
                      type="button" 
                      onClick={addOption}
                      className="btn btn-primary"
                      disabled={!currentOption.name || currentOption.choices.length === 0 || !currentOption.defaultChoiceCode}
                    >
                      {editingOptionIndex >= 0 ? 'Update Option' : 'Add Option'}
                    </button>
                  </div>
                </div>
              )}

              {/* Add Option Button */}
              {!showOptionsForm && (
                <button 
                  type="button" 
                  onClick={() => setShowOptionsForm(true)}
                  className="btn btn-success btn-add-option"
                >
                  ➕ Add Variant Option
                </button>
              )}
            </div>

            {/* Promotion Section */}
            <div className="form-section">
              <h3 className="section-title">Promotion</h3>
              
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editForm.isPromotion || false}
                    onChange={(e) => onInputChange({
                      target: {
                        name: 'isPromotion',
                        type: 'checkbox',
                        checked: e.target.checked
                      }
                    })}
                  />
                  Enable Promotion
                </label>
              </div>
              
              {editForm.isPromotion && (
                <div className="promotion-details">
                  <div className="form-group">
                    <label>Promotion Price *</label>
                    <input
                      type="number"
                      name="promotionPrice"
                      value={editForm.promotionPrice || ''}
                      onChange={onInputChange}
                      step="0.01"
                      min="0"
                      placeholder="Enter promotion price..."
                      required
                    />
                    <small className="form-help">
                      This will be the discounted price when promotion is active
                    </small>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="discount-info">
                      <div className="discount-badge">
                        Promotion Active! Save €{discountAmount.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Form Actions */}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-save">
                <span className="btn-icon">💾</span>
                Save Changes
              </button>
              <button 
                type="button" 
                onClick={onCancel}
                className="btn btn-secondary btn-cancel"
              >
                <span className="btn-icon">❌</span>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductPopup;