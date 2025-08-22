import User from "../models/userModel.js";
import jwt, { decode } from "jsonwebtoken"
function getToken(id){
  return jwt.sign({id},process.env.JWT_SECRET_KEY,{
    expiresIn:"10d"
  })
}
export async function createAdmin(req,res,next) {
    try {
      const {name,role,email,contactNo,password,confirmPassword} = req.body
      if(!name || !email || !password)
        return res.status(400).json({
          status:"failed",
          message:"Necessary fields are required"
        })
      if(password!==confirmPassword)
        return res.status(400).json({
          status:"failed",
          message:"Passwords do not match"
        })
      const newAdmin={
        name,
        role,
        email,
        contactNo,
        password
      }
      const admin = await User.create(newAdmin)
      res.status(200).json({
        status:"success",
        data:admin
      })
    } catch (err) {
      next(err)
    }
}
export async function adminSignIn(req,res,next){
  try {
    const {email,password} = req.body
    if(!email || !password)
      return res.status(400).json({
        status:"failed",
        message:"fields are required"
      })
    const admin = await User.findOne({email}).select("+password")
    
    if(!admin || admin.role ==="user")
      return res.status(400).json({
        status:"failed",
        message: "admin not found"
      })
    if(!await admin.checkPassword(password))
      return res.status(400).json({
        status:"failed",
        message: "incorrect password"
      })
    const token = getToken(admin._id)
    // res.cookie("adminjwt",token,{
    //   httpOnly:true,
    //   secure: process.env.NODE_ENV==="production",
    //   sameSite:"strict",
    //   maxAge: 10 * 24 * 60 * 60 * 1000
    // })
    res.cookie("adminjwt", token, {
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "None", // Changed from "Lax"
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    
    admin.password = undefined
    res.status(200).json({
      status:"success",
      data:admin
    })
  } catch (err) {
    next(err)
  }
}
export async function adminLogOut(req,res,next){
    try {
      // res.cookie("adminjwt","",{
      //   httpOnly:true,
      //   expires:new Date(0)
      // })
      res.cookie("adminjwt", "", {
        httpOnly: true,
        secure: true, // Add this
        sameSite: "None", // Add this
        path: "/", // Add this
        expires: new Date(0), // Immediate expiration
      });
      res.status(200).json({
        status:"success",
        message:"Logged out successfully"
      })
    } catch (err) {
        next(err)
    }
}
export async function protectAdminRoute(req,res,next){
    try {
        const token = req.cookies.adminjwt
        if(!token)
            return res.status(400).json({
                status:"failed",
                message:"token not found"
            })
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET_KEY)
        
        const admin = await User.findById(decodedToken.id).select("-password")
        
        if(!admin || admin.role==="user")
            return res.status(400).json({
                status:"failed",
                message:"Your are not logged in as an admin"
            })
        req.admin=admin
        next()
    } catch (err) {
        next(err)
    }
}
export async function checkAdminAuth(req,res,next){
    try {
        const token = req.cookies.adminjwt
        
        if(!token)
            //returning is importing otherwise it will keep going in and give error
            return res.status(400).json({
                status:"failed",
                message:"Token not found"
            })
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET_KEY)
        
        const admin = await User.findById(decodedToken.id).select("-password")
        
        if(!admin || admin.role==="user")
            return res.status(401).json({
                status:"failed",
                message:"Your are not logged in as an admin"
            })
        res.status(200).json({
            status:"success",
            data:admin
        })
    } catch (err) {
        console.log(err)
        throw new Error(err)
    }
}