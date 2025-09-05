import React, {useState } from 'react'
import './Add.css'
import axios from "axios"
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import config from '../../config/config'
const Add = ({url}) => {


    const [image,setImage]=useState(false);
    const [data,setData]=useState({
        name:"",
        description:"",
        price:"",
        category:"Salad",
        unit:"cái",
        unitValue:1,
        customUnit:""
    })

        const onChangeHandler=(event)=>{
            const name=event.target.name;
            const value=event.target.value;
            setData(data=>({...data,[name]:value}))

        }

        const onSubmitHandler =async(event)=>{
            event.preventDefault();
            const formData= new FormData();
            formData.append("name",data.name)
            formData.append("description",data.description)
            formData.append("price",Number(data.price))
            formData.append("category",data.category)
            formData.append("unit",data.customUnit || data.unit)
            formData.append("unitValue",Number(data.unitValue))
            formData.append("image",image)
            const response=await axios.post(`${config.BACKEND_URL}/api/food/add`,formData)
            if(response.data.success){
                setData({
                    name:"",
                    description:"",
                    price:"",
                    category:"Salad",
                    unit:"cái",
                    unitValue:1,
                    customUnit:""
                })
                setImage(false)
                toast.success(response.data.message)
            }
            else{
                toast.error(response.data.message)
            }
        }
        
 

  return (
    <div className='add'>
        <form className="flex-col" onSubmit={onSubmitHandler}>
            <div className="add-img-upload flex-col">
                <p>Upload Image</p>
                <label htmlFor="image">
                    <img src={image?URL.createObjectURL(image):assets.upload_area} alt="" />
                </label>
                <input onChange={(e)=>setImage(e.target.files[0])} type="file" id='image' hidden required />
            </div>
            <div className="add-product-name flex-col">
                <p>Product Name</p>
                <input onChange={onChangeHandler} value={data.name} type="text" name='name' placeholder='Type here' />
                </div>
                <div className='add-product-description flex-col'>
                <p>Product description</p>
                <textarea onChange={onChangeHandler} value={data.description} name="description" rows="6" placeholder="Write content here" required></textarea>
            </div>
            <div className="add-category-price">
                <div className="add-category flex-col">
                    <p>Product category</p>
                    <select onChange={onChangeHandler} name="category" >
                        <option value="Salad">Salad</option>
                        <option value="Rolls">Rolls</option>
                        <option value="Deserts">Deserts</option>
                        <option value="Sandwich">Sandwich</option>
                        <option value="Cake">Cake</option>
                        <option value="Pure Veg">Pure Veg</option>
                        <option value="Pasta">Pasta</option>
                        <option value="Noodels">Noodels</option>
                    </select>
                </div>
                <div className="add-price flex-col">
                    <p>Product Price</p>
                    <input onChange={onChangeHandler} value={data.price} type="Number" name='price' placeholder='€20'/>
                </div>
            </div>
            <div className="add-unit-section">
                <div className="add-unit flex-col">
                    <p>Đơn vị</p>
                    <select onChange={onChangeHandler} name="unit" value={data.unit}>
                        <option value="cái">Cái</option>
                        <option value="kg">Kilogram (kg)</option>
                        <option value="g">Gram (g)</option>
                        <option value="ml">Milliliter (ml)</option>
                        <option value="l">Liter (l)</option>
                        <option value="tấn">Tấn</option>
                        <option value="gói">Gói</option>
                        <option value="hộp">Hộp</option>
                        <option value="chai">Chai</option>
                        <option value="lon">Lon</option>
                        <option value="custom">Khác...</option>
                    </select>
                </div>
                <div className="add-unit-value flex-col">
                    <p>Số lượng đơn vị</p>
                    <input onChange={onChangeHandler} value={data.unitValue} type="Number" name='unitValue' placeholder='1' min="0.01" step="0.01"/>
                </div>
            </div>
            {data.unit === 'custom' && (
                <div className="add-custom-unit flex-col">
                    <p>Nhập đơn vị tùy chỉnh</p>
                    <input onChange={onChangeHandler} value={data.customUnit} type="text" name='customUnit' placeholder='Ví dụ: thùng, bịch, lọ...'/>
                </div>
            )}
                <button type='submit' className='add-btn'>Add</button>
        </form>

    </div>
  )
}

export default Add