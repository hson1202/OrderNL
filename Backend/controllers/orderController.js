import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js"

// placing user order from frontend (hỗ trợ cả đăng nhập và không đăng nhập)
const placeOrder = async (req,res) => {
    try {
        const { userId, items, amount, address, customerInfo, orderType = 'guest' } = req.body;
        
        console.log('📦 Placing order with userId:', userId, 'orderType:', orderType);
        
        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No items in order"
            });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid order amount"
            });
        }

        if (!address) {
            return res.status(400).json({
                success: false,
                message: "Delivery address is required"
            });
        }

        if (!customerInfo || !customerInfo.name || !customerInfo.phone) {
            return res.status(400).json({
                success: false,
                message: "Customer information is required"
            });
        }

        // Validate address fields
        const requiredAddressFields = ['street', 'city', 'state', 'zipcode', 'country'];
        for (const field of requiredAddressFields) {
            if (!address[field]) {
                return res.status(400).json({
                    success: false,
                    message: `Address field '${field}' is required`
                });
            }
        }
        
        // Kiểm tra userId có hợp lệ không (nếu có)
        let validUserId = null;
        if (userId) {
            try {
                const user = await userModel.findById(userId);
                if (user) {
                    validUserId = userId;
                    console.log(`✅ Valid user found: ${user.name} (${userId})`);
                } else {
                    console.log(`⚠️ Invalid userId provided: ${userId}`);
                }
            } catch (error) {
                console.log(`⚠️ Error validating userId: ${error.message}`);
            }
        }
        
        // Tạo đơn hàng mới
        const newOrder = new orderModel({
            userId: validUserId, // Sẽ có giá trị nếu user đã đăng nhập và hợp lệ
            items: items,
            amount: amount,
            address: address,
            customerInfo: customerInfo,
            orderType: validUserId ? 'registered' : 'guest', // Tự động set dựa trên userId
            payment: true, // COD - thanh toán khi nhận hàng
            status: "Pending"
        })
        
        await newOrder.save();
        
        console.log(`✅ Order created successfully with ID: ${newOrder._id}, userId: ${validUserId}`);
        
        // Nếu có userId hợp lệ (đăng nhập), xóa giỏ hàng
        if (validUserId) {
            try {
                await userModel.findByIdAndUpdate(validUserId, { cartData: {} });
                console.log(`🛒 Cart cleared for user: ${validUserId}`);
            } catch (cartError) {
                console.log('Error clearing cart:', cartError);
                // Không fail order nếu chỉ lỗi xóa cart
            }
        }

        res.json({
            success: true, 
            trackingCode: newOrder.trackingCode,
            orderId: newOrder._id,
            message: "Order placed successfully! You can track your order using the tracking code."
        })

    } catch (error) {
        console.log('Error placing order:', error);
        
        // Check for specific MongoDB errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: `Validation error: ${error.message}`
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Duplicate order detected"
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Internal server error while placing order"
        });
    }
}

const userOrders = async (req,res) => {
    try {
        const {userId} = req.body;
        
        console.log('🔍 Fetching orders for userId:', userId);
        
        if (!userId) {
            console.log('❌ No userId provided in request body');
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }
        
        const orders = await orderModel.find({userId}).sort({ createdAt: -1 });
        
        console.log(`✅ Found ${orders.length} orders for user ${userId}`);
        
        res.json({
            success: true,
            data: orders,
            count: orders.length
        });
    } catch (error) {
        console.error('❌ Error in userOrders:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching user orders",
            error: error.message
        });
    }
}

const listOrders = async (req,res) => {
    try {
        // Check if user is admin
        if (!req.body.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }
        
        const orders = await orderModel.find({}).sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: orders,
            count: orders.length
        });
    } catch (error) {
        console.error('Error in listOrders:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching orders",
            error: error.message
        });
    }
}

const updateStatus = async (req,res) => {
    try {
        // Check if user is admin
        if (!req.body.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }
        
        const {orderId,status} = req.body;
        
        const updatedOrder = await orderModel.findByIdAndUpdate(orderId, {status}, {new: true});
        
        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        
        res.json({
            success: true,
            message: "Status Updated",
            data: updatedOrder
        });
    } catch (error) {
        console.error('Error in updateStatus:', error);
        res.status(500).json({
            success: false,
            message: "Error updating order status",
            error: error.message
        });
    }
}

const trackOrder = async (req,res) => {
    try {
        const {trackingCode, phone} = req.body;
        
        if (!trackingCode || !phone) {
            return res.json({success:false,message:"Tracking code and phone number are required"})
        }
        
        // Nếu có trackingCode, tìm order cụ thể
        if (trackingCode) {
            const order = await orderModel.findOne({
                trackingCode: trackingCode,
                'customerInfo.phone': phone
            });
            
            if (order) {
                res.json({success:true,data:order})
            } else {
                res.json({success:false,message:"Order not found with this tracking code and phone number"})
            }
        } else {
            // Nếu không có trackingCode, tìm tất cả orders của phone number
            const orders = await orderModel.find({
                'customerInfo.phone': phone
            }).sort({ createdAt: -1 });
            
            if (orders.length > 0) {
                res.json({success:true,data:orders})
            } else {
                res.json({success:false,message:"No orders found with this phone number"})
            }
        }
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

const getOrderStats = async (req,res) => {
    try {
        const totalOrders = await orderModel.countDocuments();
        const pendingOrders = await orderModel.countDocuments({status: "Pending"});
        const outForDelivery = await orderModel.countDocuments({status: "Out for delivery"});
        const deliveredOrders = await orderModel.countDocuments({status: "Delivered"});
        
        res.json({
            success: true,
            stats: {
                total: totalOrders,
                pending: pendingOrders,
                outForDelivery: outForDelivery,
                delivered: deliveredOrders
            }
        })
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

export { placeOrder, userOrders, listOrders, updateStatus, trackOrder, getOrderStats }