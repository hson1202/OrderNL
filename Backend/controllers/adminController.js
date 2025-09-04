import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import categoryModel from "../models/categoryModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

        // Get total counts
        const totalOrders = await orderModel.countDocuments();
        const totalUsers = await userModel.countDocuments();
        const totalProducts = await foodModel.countDocuments();

        // Debug: Check actual status values in database
        const allOrders = await orderModel.find({}, 'status amount createdAt date');
        console.log('All orders statuses:', allOrders.map(o => ({ 
            status: o.status || 'Unknown', 
            amount: o.amount || 0, 
            createdAt: o.createdAt || 'No date', 
            date: o.date || 'No date' 
        })));

        // Normalize status groups (include common variants)
        const PENDING_STATUSES = ['pending', 'Pending', 'Pending', 'Order Placed', 'order placed'];
        const COMPLETED_STATUSES = ['completed', 'Completed', 'delivered', 'Delivered'];

        // Get orders by status - include common variants and cases
        const pendingOrders = await orderModel.countDocuments({ 
            status: { $in: PENDING_STATUSES } 
        });
        const completedOrders = await orderModel.countDocuments({ 
            status: { $in: COMPLETED_STATUSES } 
        });
        
        // Calculate total revenue from completed orders
        const completedOrdersData = await orderModel.find({ 
            status: { $in: COMPLETED_STATUSES } 
        });
        const totalRevenue = completedOrdersData.reduce((sum, order) => {
            const amount = typeof order.amount === 'string' ? parseFloat(order.amount) || 0 : (order.amount || 0);
            return sum + amount;
        }, 0);

        // Get current month data - use both createdAt and date fields
        const currentMonthOrders = await orderModel.countDocuments({
            $or: [
                { createdAt: { $gte: currentMonth } },
                { date: { $gte: currentMonth } }
            ]
        });
        const currentMonthCompletedOrders = await orderModel.find({
            $or: [
                { createdAt: { $gte: currentMonth } },
                { date: { $gte: currentMonth } }
            ],
            status: { $in: COMPLETED_STATUSES }
        });
        const currentMonthRevenue = currentMonthCompletedOrders.reduce((sum, order) => {
            const amount = typeof order.amount === 'string' ? parseFloat(order.amount) || 0 : (order.amount || 0);
            return sum + amount;
        }, 0);

        // Get last month data for comparison
        const lastMonthOrders = await orderModel.countDocuments({
            $or: [
                { createdAt: { $gte: lastMonth, $lt: currentMonth } },
                { date: { $gte: lastMonth, $lt: currentMonth } }
            ]
        });
        const lastMonthCompletedOrders = await orderModel.find({
            $or: [
                { createdAt: { $gte: lastMonth, $lt: currentMonth } },
                { date: { $gte: lastMonth, $lt: currentMonth } }
            ],
            status: { $in: COMPLETED_STATUSES }
        });
        const lastMonthRevenue = lastMonthCompletedOrders.reduce((sum, order) => {
            const amount = typeof order.amount === 'string' ? parseFloat(order.amount) || 0 : (order.amount || 0);
            return sum + amount;
        }, 0);

        // Get last month pending orders
        const lastMonthPendingOrders = await orderModel.countDocuments({
            $or: [
                { createdAt: { $gte: lastMonth, $lt: currentMonth } },
                { date: { $gte: lastMonth, $lt: currentMonth } }
            ],
            status: { $in: PENDING_STATUSES }
        });

        // Get last month completed orders count
        const lastMonthCompletedCount = lastMonthCompletedOrders.length;

        // Get last month users (users created before current month)
        const lastMonthUsers = await userModel.countDocuments({
            createdAt: { $lt: currentMonth }
        });

        // Get last month products (products created before current month)
        const lastMonthProducts = await foodModel.countDocuments({
            createdAt: { $lt: currentMonth }
        });

        console.log('Dashboard Stats:', {
            totalOrders,
            totalRevenue,
            pendingOrders,
            completedOrders,
            totalUsers,
            totalProducts,
            currentMonth: { orders: currentMonthOrders, revenue: currentMonthRevenue },
            lastMonth: { 
                orders: lastMonthOrders, 
                revenue: lastMonthRevenue,
                pending: lastMonthPendingOrders,
                completed: lastMonthCompletedCount,
                users: lastMonthUsers,
                products: lastMonthProducts
            }
        });

        res.json({
            totalOrders,
            totalRevenue,
            pendingOrders,
            completedOrders,
            totalUsers,
            totalProducts,
            currentMonth: {
                orders: currentMonthOrders,
                revenue: currentMonthRevenue
            },
            lastMonth: {
                orders: lastMonthOrders,
                revenue: lastMonthRevenue,
                pending: lastMonthPendingOrders,
                completed: lastMonthCompletedCount,
                users: lastMonthUsers,
                products: lastMonthProducts
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: "Error fetching stats" });
    }
};

// Get all orders for admin (no auth required)
const getAllOrders = async (req, res) => {
    try {
        console.log('📦 Getting all orders for admin...')
        
        // Get all orders with complete information
        const orders = await orderModel.find({})
            .sort({ 
                // Custom sort: Pending first, then by creation date
                createdAt: -1 
            })
            .limit(100); // Limit to 100 orders for performance
        
        console.log(`✅ Found ${orders.length} orders`)
        
        // Log first few orders for debugging
        if (orders.length > 0) {
            console.log('📋 Sample orders:', orders.slice(0, 3).map(o => ({
                id: o._id,
                status: o.status,
                userId: o.userId,
                orderType: o.orderType,
                customerName: o.customerInfo?.name,
                amount: o.amount,
                createdAt: o.createdAt,
                trackingCode: o.trackingCode
            })));
        }
        
        // Sort orders manually: Pending first, then by creation date
        const sortedOrders = orders.sort((a, b) => {
            // Pending orders first
            if (a.status === 'Pending' && b.status !== 'Pending') return -1;
            if (a.status !== 'Pending' && b.status === 'Pending') return 1;
            
            // Then by creation date (newest first)
            const dateA = new Date(a.createdAt || a.date || 0);
            const dateB = new Date(b.createdAt || b.date || 0);
            return dateB - dateA;
        });
        
        // Add additional info to each order for admin display - handle both guest and registered users safely
        const ordersWithInfo = sortedOrders.map(order => {
            try {
                // Convert to plain object safely
                const orderObj = order.toObject ? order.toObject() : order;
                
                return {
                    ...orderObj,
                    // Handle guest orders (no userId) vs registered user orders
                    isGuestOrder: !orderObj.userId || orderObj.userId === null || orderObj.userId === undefined,
                    displayOrderType: (!orderObj.userId || orderObj.userId === null || orderObj.userId === undefined) 
                        ? 'Guest Order' 
                        : 'Registered User',
                    shortOrderId: orderObj._id ? orderObj._id.toString().slice(-6) : 'N/A',
                    // Ensure customer info is always available
                    customerInfo: {
                        name: orderObj.customerInfo?.name || 'Unknown',
                        phone: orderObj.customerInfo?.phone || 'N/A',
                        email: orderObj.customerInfo?.email || 'N/A'
                    },
                    // Ensure amount is always a number
                    amount: typeof orderObj.amount === 'number' ? orderObj.amount : parseFloat(orderObj.amount) || 0,
                    // Ensure status is always a string
                    status: orderObj.status || 'Pending',
                    // Ensure orderType is always valid
                    orderType: orderObj.orderType || 'guest'
                };
            } catch (orderError) {
                console.error('❌ Error processing order:', orderError, 'Order:', order);
                // Return a safe fallback object
                return {
                    _id: order._id || 'unknown',
                    status: 'Error',
                    amount: 0,
                    customerInfo: { name: 'Error loading order', phone: 'N/A', email: 'N/A' },
                    isGuestOrder: true,
                    displayOrderType: 'Error',
                    shortOrderId: 'ERR',
                    error: 'Failed to load order details'
                };
            }
        });
        
        console.log(`✅ Successfully processed ${ordersWithInfo.length} orders`)
        res.json(ordersWithInfo);
    } catch (error) {
        console.error('❌ Error fetching all orders:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching orders",
            error: error.message 
        });
    }
};

// Get time-based statistics
const getTimeStats = async (req, res) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

        console.log('Time ranges:', { today, weekAgo, monthAgo, quarterAgo, yearAgo });

        // Get orders for different time periods - include all statuses for orders count
        const PENDING_STATUSES = ['pending', 'Pending', 'Order Placed', 'order placed'];
        const COMPLETED_STATUSES = ['completed', 'Completed', 'delivered', 'Delivered'];
        
        // Helper function to get orders for a time period
        const getOrdersForPeriod = async (startDate) => {
            return await orderModel.find({
                $or: [
                    { createdAt: { $gte: startDate } },
                    { date: { $gte: startDate } }
                ]
            });
        };

        // Helper function to get completed orders for a time period
        const getCompletedOrdersForPeriod = async (startDate) => {
            return await orderModel.find({
                $or: [
                    { createdAt: { $gte: startDate } },
                    { date: { $gte: startDate } }
                ],
                status: { $in: COMPLETED_STATUSES }
            });
        };

        const todayOrders = await getOrdersForPeriod(today);
        const weekOrders = await getOrdersForPeriod(weekAgo);
        const monthOrders = await getOrdersForPeriod(monthAgo);
        const quarterOrders = await getOrdersForPeriod(quarterAgo);
        const yearOrders = await getOrdersForPeriod(yearAgo);

        // Get completed orders for revenue calculation
        const todayCompletedOrders = await getCompletedOrdersForPeriod(today);
        const weekCompletedOrders = await getCompletedOrdersForPeriod(weekAgo);
        const monthCompletedOrders = await getCompletedOrdersForPeriod(monthAgo);
        const quarterCompletedOrders = await getCompletedOrdersForPeriod(quarterAgo);
        const yearCompletedOrders = await getCompletedOrdersForPeriod(yearAgo);

        const calculateRevenue = (orders) => {
            return orders.reduce((sum, order) => {
                const amount = typeof order.amount === 'string' ? parseFloat(order.amount) || 0 : (order.amount || 0);
                return sum + amount;
            }, 0);
        };

        const timeStats = {
            today: {
                orders: todayOrders.length,
                revenue: calculateRevenue(todayCompletedOrders)
            },
            week: {
                orders: weekOrders.length,
                revenue: calculateRevenue(weekCompletedOrders)
            },
            month: {
                orders: monthOrders.length,
                revenue: calculateRevenue(monthCompletedOrders)
            },
            quarter: {
                orders: quarterOrders.length,
                revenue: calculateRevenue(quarterCompletedOrders)
            },
            year: {
                orders: yearOrders.length,
                revenue: calculateRevenue(yearCompletedOrders)
            }
        };

        console.log('Time Stats:', timeStats);

        res.json(timeStats);
    } catch (error) {
        console.error('Error fetching time stats:', error);
        res.status(500).json({ success: false, message: "Error fetching time stats" });
    }
};

// Get recent orders
const getRecentOrders = async (req, res) => {
    try {
        const recentOrders = await orderModel.find()
            .populate('items.productId', 'name image price originalPrice productCode')
            .sort({ createdAt: -1, date: -1 })
            .limit(10);

        const ordersWithUserName = recentOrders.map(order => {
            try {
                // Convert to plain object safely
                const orderObj = order.toObject ? order.toObject() : order;
                
                // Handle both guest and registered users safely
                let userName = 'Guest User';
                let userType = 'guest';
                
                if (orderObj.customerInfo && orderObj.customerInfo.name) {
                    userName = orderObj.customerInfo.name;
                    userType = orderObj.userId ? 'registered' : 'guest';
                } else if (orderObj.userId) {
                    // If userId is populated or has name property
                    if (typeof orderObj.userId === 'object' && orderObj.userId.name) {
                        userName = orderObj.userId.name;
                        userType = 'registered';
                    } else if (typeof orderObj.userId === 'string') {
                        userName = `User ID: ${orderObj.userId}`;
                        userType = 'registered';
                    }
                }

                // Process items with product details
                const processedItems = (orderObj.items || []).map(item => {
                    // Check if item has direct product info (most likely case)
                    if (item.name || item.title) {
                        return {
                            name: item.name || item.title || 'Unknown Product',
                            image: item.image || null,
                            price: item.promotionPrice || item.price || 0,
                            originalPrice: item.originalPrice || null,
                            productCode: item.sku || item.productCode || item.code || 'N/A',
                            quantity: item.quantity || 1
                        };
                    } 
                    // Check if item has populated productId (less likely)
                    else if (item.productId && typeof item.productId === 'object') {
                        return {
                            name: item.productId.name || 'Unknown Product',
                            image: item.productId.image || null,
                            price: item.productId.promotionPrice || item.productId.price || 0,
                            originalPrice: item.productId.originalPrice || null,
                            productCode: item.productId.sku || item.productId.productCode || 'N/A',
                            quantity: item.quantity || 1
                        };
                    } 
                    // Fallback
                    else {
                        return {
                            name: 'Unknown Product',
                            image: null,
                            price: 0,
                            originalPrice: null,
                            productCode: 'N/A',
                            quantity: item.quantity || 1
                        };
                    }
                });

                return {
                    _id: orderObj._id,
                    userName: userName,
                    userType: userType,
                    items: processedItems,
                    totalAmount: typeof orderObj.amount === 'number' ? orderObj.amount : parseFloat(orderObj.amount) || 0,
                    status: orderObj.status || 'pending',
                    createdAt: orderObj.createdAt || orderObj.date || new Date(),
                    // Add additional info for admin
                    isGuestOrder: !orderObj.userId,
                    customerInfo: {
                        name: orderObj.customerInfo?.name || 'Unknown',
                        phone: orderObj.customerInfo?.phone || 'N/A',
                        email: orderObj.customerInfo?.email || 'N/A'
                    }
                };
            } catch (orderError) {
                console.error('❌ Error processing recent order:', orderError, 'Order:', order);
                // Return a safe fallback object
                return {
                    _id: order._id || 'unknown',
                    userName: 'Error loading order',
                    userType: 'error',
                    items: [],
                    totalAmount: 0,
                    status: 'Error',
                    createdAt: new Date(),
                    isGuestOrder: true,
                    customerInfo: { name: 'Error loading order', phone: 'N/A', email: 'N/A' }
                };
            }
        });

        console.log('✅ Recent Orders processed successfully:', ordersWithUserName.length);
        res.json(ordersWithUserName);
    } catch (error) {
        console.error('❌ Error fetching recent orders:', error);
        res.status(500).json({ success: false, message: "Error fetching recent orders" });
    }
};

// Get all users for admin
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find().select('-password');
        
        // Add order count for each user
        const usersWithOrderCount = await Promise.all(
            users.map(async (user) => {
                const orderCount = await orderModel.countDocuments({ userId: user._id });
                return {
                    ...user.toObject(),
                    orderCount
                };
            })
        );

        res.json(usersWithOrderCount);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: "Error fetching users" });
    }
};

// Update user status
const updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await userModel.findByIdAndUpdate(req.params.id, { status });
        res.json({ success: true, message: "User status updated" });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ success: false, message: "Error updating user status" });
    }
};

// Update user role
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        await userModel.findByIdAndUpdate(req.params.id, { role });
        res.json({ success: true, message: "User role updated" });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ success: false, message: "Error updating user role" });
    }
};

// Update user information
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, password } = req.body;

        // Validate required fields
        if (!name && !email && !phone && !address && !password) {
            return res.status(400).json({ message: 'At least one field must be provided' });
        }

        // Check if email already exists (if email is being updated)
        if (email) {
            const existingUser = await userModel.findOne({ email, _id: { $ne: id } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        // Prepare update data
        const updateData = {};
        if (name) updateData.name = name.trim();
        if (email) updateData.email = email.trim().toLowerCase();
        if (phone) updateData.phone = phone.trim();
        if (address) updateData.address = address.trim();

        // Handle password update if provided
        if (password && password.trim()) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password.trim(), saltRounds);
            updateData.password = hashedPassword;
        }

        // Update user
        const user = await userModel.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({ 
            message: 'User updated successfully', 
            user: userResponse 
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        await userModel.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "User deleted" });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: "Error deleting user" });
    }
};

// Get all categories for admin
const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find()
            .sort({ sortOrder: 1, name: 1 });
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, message: "Error fetching categories" });
    }
};

// Admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if admin credentials are provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user with admin role
        const adminUser = await userModel.findOne({ 
            email: email, 
            role: 'admin',
            status: 'active'
        });

        if (!adminUser) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, adminUser.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                email: adminUser.email, 
                role: adminUser.role,
                id: adminUser._id
            },
            process.env.JWT_SECRET || 'your-super-secret-jwt-key-2024-food-delivery-admin-panel',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                email: adminUser.email,
                role: adminUser.role,
                name: adminUser.name
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Admin signup
const adminSignup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if all required fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new admin user
        const newAdmin = new userModel({
            name,
            email,
            password: hashedPassword,
            role: role || 'admin',
            status: 'active'
        });

        await newAdmin.save();

        // Create JWT token
        const token = jwt.sign(
            { 
                email: newAdmin.email, 
                role: newAdmin.role,
                id: newAdmin._id
            },
            process.env.JWT_SECRET || 'your-super-secret-jwt-key-2024-food-delivery-admin-panel',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: "Admin account created successfully",
            token: token,
            user: {
                email: newAdmin.email,
                role: newAdmin.role,
                name: newAdmin.name
            }
        });
    } catch (error) {
        console.error('Admin signup error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get time-based statistics for charts
const getTimeBasedStats = async (req, res) => {
    try {
        const { days = 30, granularity = 'day', metric = 'revenue', orderStatus = 'all' } = req.query;
        
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999); // End of today
        const startDate = new Date(endDate.getTime() - (parseInt(days) * 24 * 60 * 60 * 1000));
        startDate.setHours(0, 0, 0, 0); // Start of start date
        
        let data = [];
        
        // Generate date range based on granularity
        const dateRange = generateDateRange(startDate, endDate, granularity);
        
        // Get data for each date in the range
        for (const dateInfo of dateRange) {
            const { start, end } = dateInfo;
            
            let value = 0;
            
            switch (metric) {
                case 'revenue':
                    const revenueQuery = {
                        createdAt: { $gte: start, $lt: end },
                        status: { $in: ['completed', 'Delivered'] }
                    };
                    const revenueOrders = await orderModel.find(revenueQuery);
                    value = revenueOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
                    break;
                    
                case 'totalOrders':
                    const totalOrdersQuery = {
                        createdAt: { $gte: start, $lt: end }
                    };
                    if (orderStatus !== 'all') {
                        totalOrdersQuery.status = orderStatus;
                    }
                    value = await orderModel.countDocuments(totalOrdersQuery);
                    break;
                    
                case 'pendingOrders':
                    const pendingQuery = {
                        createdAt: { $gte: start, $lt: end },
                        status: { $in: ['pending', 'Pending', 'Order Placed'] }
                    };
                    value = await orderModel.countDocuments(pendingQuery);
                    break;
                    
                case 'completedOrders':
                    const completedQuery = {
                        createdAt: { $gte: start, $lt: end },
                        status: { $in: ['completed', 'Delivered'] }
                    };
                    value = await orderModel.countDocuments(completedQuery);
                    break;
                    
                case 'users':
                    const usersQuery = {
                        createdAt: { $gte: start, $lt: end }
                    };
                    value = await userModel.countDocuments(usersQuery);
                    break;
                    
                case 'products':
                    const productsQuery = {
                        createdAt: { $gte: start, $lt: end }
                    };
                    value = await foodModel.countDocuments(productsQuery);
                    break;
            }
            
            data.push({
                date: start.toISOString(),
                value: value
            });
        }
        
        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Error fetching time-based stats:', error);
        res.status(500).json({ success: false, message: "Error fetching time-based stats" });
    }
};

// Helper function to generate date range
const generateDateRange = (startDate, endDate, granularity) => {
    const ranges = [];
    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
    
    while (currentDate <= endDate) {
        let rangeStart = new Date(currentDate);
        let rangeEnd = new Date(currentDate);
        
        switch (granularity) {
            case 'day':
                rangeEnd.setDate(rangeEnd.getDate() + 1);
                currentDate.setDate(currentDate.getDate() + 1);
                break;
            case 'week':
                // Start of week (Monday)
                const dayOfWeek = rangeStart.getDay();
                const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                rangeStart.setDate(rangeStart.getDate() + diff);
                rangeEnd = new Date(rangeStart);
                rangeEnd.setDate(rangeEnd.getDate() + 7);
                currentDate = new Date(rangeEnd);
                break;
            case 'month':
                rangeStart.setDate(1);
                rangeEnd = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + 1, 1);
                currentDate = new Date(rangeEnd);
                break;
            default:
                rangeEnd.setDate(rangeEnd.getDate() + 1);
                currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Make sure we don't go beyond the end date
        if (rangeEnd > endDate) {
            rangeEnd = new Date(endDate);
            rangeEnd.setHours(23, 59, 59, 999);
        }
        
        if (rangeStart <= endDate) {
            ranges.push({ start: rangeStart, end: rangeEnd });
        }
    }
    
    return ranges;
};

// Update order status for admin (no auth required)
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        console.log(`📦 Updating order ${id} status to: ${status}`);
        
        if (!status) {
            return res.status(400).json({ 
                success: false, 
                message: "Status is required" 
            });
        }
        
        // Validate status values - support both old and new status formats
        const validStatuses = ['Pending', 'Out for delivery', 'Delivered', 'pending', 'out for delivery', 'delivered'];
        const normalizedStatus = validStatuses.find(s => s.toLowerCase() === status.toLowerCase());
        
        if (!normalizedStatus) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: Pending, Out for delivery, Delivered`
            });
        }
        
        // Use the normalized status (capitalized)
        const finalStatus = normalizedStatus === 'pending' ? 'Pending' : 
                           normalizedStatus === 'out for delivery' ? 'Out for delivery' : 
                           normalizedStatus === 'delivered' ? 'Delivered' : normalizedStatus;
        
        const updatedOrder = await orderModel.findByIdAndUpdate(
            id,
            { status: finalStatus },
            { new: true, runValidators: true }
        );
        
        if (!updatedOrder) {
            return res.status(404).json({ 
                success: false, 
                message: "Order not found" 
            });
        }
        
        console.log(`✅ Order ${id} status updated to: ${finalStatus}`);
        console.log('📋 Updated order:', {
            id: updatedOrder._id,
            status: updatedOrder.status,
            customerName: updatedOrder.customerInfo?.name,
            amount: updatedOrder.amount,
            orderType: updatedOrder.orderType,
            userId: updatedOrder.userId
        });
        
        res.json({
            success: true,
            message: "Order status updated successfully",
            data: updatedOrder
        });
    } catch (error) {
        console.error('❌ Error updating order status:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error updating order status",
            error: error.message 
        });
    }
};

export {
    getDashboardStats,
    getTimeStats,
    getRecentOrders,
    getAllUsers,
    updateUserStatus,
    updateUserRole,
    updateUser,
    deleteUser,
    getAllCategories,
    adminLogin,
    adminSignup,
    getTimeBasedStats,
    getAllOrders,
    updateOrderStatus
}; 