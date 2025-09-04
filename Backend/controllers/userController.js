import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"
import { response } from "express";


//login user
const loginUser = async (req,res)=>{
    const {email,password}=req.body;
    try {
        console.log("Email received:", email)
        const user =await userModel.findOne({email});
        console.log("User found:", user)
        if (!user) {
            return res.json({success:false,message:"User Doesn't exists"})
        }
        const isMatch= await bcrypt.compare(password,user.password)
        console.log("Password match:", isMatch)

        if (!isMatch) {
            return res.json({success:false,message:"Invalid Credentials"})
        }
        const token=createToken(user._id);
        res.json({success:true,token})


    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message || "Error"})
    }
}
const createToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET || 'your-super-secret-jwt-key-2024-food-delivery-admin-panel')
}

//register user
const registerUser = async (req,res)=>{
    const {name ,password,email}=req.body;
    try {
        //checking use exits or not
        const exists=await userModel.findOne({email});
        if(exists){
            return res.json({success:false,message:"User already exists"})
        }
        // validateing email and password
        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Please Enter a valid E-mail"})
        }
        if(password.length<8){
            return res.json({success:false,message:"Please enter a strong password"})
        }

        //hashing user password
        const salt= await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new userModel({
            name:name,
            email:email,
            password:hashedPassword
        })

        const user = await newUser.save()
        const token= createToken(user._id)
        res.json({success:true,token})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message || "Error"})
    }
}

export {loginUser,registerUser};