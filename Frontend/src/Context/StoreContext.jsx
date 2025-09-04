import { createContext,useEffect,useState } from "react";
import axios from "axios"
import config from "../config/config"


export const StoreContext= createContext(null)

const StoreContextProvider =(props)=>{

    
    const [cartItems,setCartItems] = useState({});  
    const [cartItemsData, setCartItemsData] = useState({}); // Store full item data including options
    const url = config.BACKEND_URL
    const [token,setToken]=useState("")
    const [food_list,setFoodList]=useState([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const addToCart =async (itemId, itemData = null) =>{  
        if (!cartItems[itemId]) {  
            setCartItems((prev)=>({...prev,[itemId]:1}))  
        }  
        else {  
            setCartItems((prev)=>({...prev,[itemId]:prev[itemId]+1}))  
        } 
        
        // Store full item data if provided
        if (itemData) {
            setCartItemsData((prev) => ({
                ...prev,
                [itemId]: itemData
            }))
        }
        
        if (token){
            // For now, just send itemId. In the future, you might want to send options data
            await axios.post(url+"/api/cart/add",{itemId},{headers:{token}})
        }
    }  
  
    const removeFromCart = async(itemId) => {
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1}))  
        
        // Remove item data if quantity becomes 0
        if (cartItems[itemId] <= 1) {
            setCartItemsData((prev) => {
                const newData = { ...prev }
                delete newData[itemId]
                return newData
            })
        }
        
        if (token) {
            await axios.post(url+"/api/cart/remove",{itemId},{headers:{token}})
        }
    }  

    const getTotalCartAmount=()=>{
        let totalAmount =0;
        for(const itemId in cartItems)
            {
                if(cartItems[itemId]>0){
                // Try to get item info from cartItemsData first (for items with options)
                let itemInfo = cartItemsData[itemId];
                
                // If not in cartItemsData, fall back to food_list
                if (!itemInfo) {
                    itemInfo = food_list.find((product)=>product._id===itemId)
                }
                
                if (itemInfo) {
                    // Use currentPrice if available (from options), otherwise use promotion or regular price
                    let itemPrice = itemInfo.currentPrice;
                    
                    if (!itemPrice) {
                        // Calculate price from options if available
                        if (itemInfo.options && itemInfo.options.length > 0 && itemInfo.selectedOptions) {
                            itemPrice = itemInfo.price || 0;
                            
                            Object.entries(itemInfo.selectedOptions).forEach(([optionName, choiceCode]) => {
                                const option = itemInfo.options.find(opt => opt.name === optionName);
                                if (option) {
                                    const choice = option.choices.find(c => c.code === choiceCode);
                                    if (choice) {
                                        if (option.pricingMode === 'override') {
                                            itemPrice = choice.price;
                                        } else if (option.pricingMode === 'add') {
                                            itemPrice += choice.price;
                                        }
                                    }
                                }
                            });
                        } else {
                            itemPrice = itemInfo.isPromotion && itemInfo.promotionPrice ? itemInfo.promotionPrice : itemInfo.price;
                        }
                    }
                    
                    // Kiểm tra giá có hợp lệ không
                    if (!itemPrice || isNaN(Number(itemPrice)) || Number(itemPrice) <= 0) {
                        itemPrice = 0;
                    }
                    
                    totalAmount += Number(itemPrice) * cartItems[itemId];
                }
                }
            }
            return totalAmount;
    }

    const fetchFoodList=async ()=>{
        const response= await axios.get(url+"/api/food/list?forUser=true")
        setFoodList(response.data.data)
    }
    const loadCartData = async (token) => {
        const response = await axios.post(url+"/api/cart/get",{},{headers:{token}});
        setCartItems(response.data.cartData);
    }

    // Debug function to check token status
    const debugToken = () => {
        console.log('🔍 Current token in context:', token);
        console.log('🔍 Token in localStorage:', localStorage.getItem("token"));
        console.log('🔍 Token exists in context:', !!token);
        console.log('🔍 Token exists in localStorage:', !!localStorage.getItem("token"));
    }

    useEffect(()=>{
        async function loadData(){
            await fetchFoodList();
        if (localStorage.getItem("token")) {
            const localToken = localStorage.getItem("token");
            console.log('🔄 Loading token from localStorage:', localToken);
            setToken(localToken);
            await loadCartData(localToken);
        }
    }
    loadData();
    },[])

    const contextValue = {  
        food_list,  
        cartItems,  
        cartItemsData,
        setCartItems,  
        addToCart,  
        removeFromCart  ,
        getTotalCartAmount,
        url,
        token,
        setToken,
        isMobileMenuOpen,
        setIsMobileMenuOpen
    }

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider