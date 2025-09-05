import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import userModel from '../models/userModel.js';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUrl = process.env.MONGODB_URL || "mongodb+srv://vietbowlssala:Vietbowls777@vietbow.twz9q4t.mongodb.net/?retryWrites=true&w=majority&appName=VietBow";
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await userModel.findOne({ email: 'admin@fastshiphu.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@fastshiphu.com');
      console.log('Password: admin123456');
      process.exit(0);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123456', saltRounds);

    // Create admin user
    const adminUser = new userModel({
      name: 'Admin FastShip',
      email: 'admin@fastshiphu.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active'
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@fastshiphu.com');
    console.log('Password: admin123456');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdmin();
