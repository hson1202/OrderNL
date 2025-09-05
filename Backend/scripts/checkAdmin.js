import mongoose from 'mongoose';
import userModel from '../models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

const checkAdmin = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URI || 'mongodb+srv://vietbowlssala:Vietbowls777@vietbow.twz9q4t.mongodb.net/?retryWrites=true&w=majority&appName=VietBow';
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');
    
    const admin = await userModel.findOne({ email: 'admin@fastshiphu.com' });
    if (admin) {
      console.log('Admin user found:');
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Status:', admin.status);
      console.log('Name:', admin.name);
      
      // Update role to admin if not already
      if (admin.role !== 'admin') {
        console.log('Updating role to admin...');
        await userModel.findByIdAndUpdate(admin._id, { role: 'admin' });
        console.log('Role updated to admin!');
      }
    } else {
      console.log('Admin user not found!');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkAdmin();

