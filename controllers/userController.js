import cloudinary from "../config/cloudinary.js";
import User from "../models/userModel.js";
import jwt, { decode } from "jsonwebtoken"
function getToken(id){
  return jwt.sign({id},process.env.JWT_SECRET_KEY,{
    expiresIn:"10d"
  })
}
export async function createUser(req, res, next) {
  try {
    const { name, password, confirmPassword, email, contactNo, area, city, state, country, postalCode } = req.body

    
    if(password!==confirmPassword)
      return res.status(400).json({
        status:"failed",
        message:"Password and confirm password should be same"
      })
    const newUser={
      name,
      email,
      password,
      contactNo,
      address:{
        area,
        city,
        state,
        country,
        postalCode
      }
    }
    const user = await User.create(newUser)
    if(!user) 
      return res.status(400).json({
        status:"failed",
        message:"User couldn't be created"
      })
    const token = getToken(user._id)
    // res.cookie("jwt",token,{
    //   httpOnly:true,
    //   secure:true,
    //   sameSite:"Strict",
    //   maxAge: 10 * 24 * 60 * 60 * 1000
    // })
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "None", // Changed from "Lax"
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    res.status(200).json({
      status:"success",
      token,
      data:user
    })
  } catch (err) {
    next(err)
  }
}

export async function signIn(req, res, next) {
  try {
    if(!req.body.password || !req.body.email)
      return res.status(400).json({
        status:"failed",
        message:"Email and Password is required"
      })
    const user = await User.findOne({email:req.body.email}).select("+password")//cuz password was select false
    
    if(!user||user.role==="admin")
      return res.status(400).json({
        status:"failed",
        message:"User not found"
      })
    if(! await user.checkPassword(req.body.password))
      return res.status(400).json({
        status:"failed",
        message:"Invalid Password"
      })
    const token = getToken(user._id)
    /*res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure secure cookies in production
      // secure:true, // Ensure secure cookies in production
      sameSite: "strict", // Prevent CSRF attacks
      maxAge: 10 * 24 * 60 * 60 * 1000,
    });*/
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "None", // Changed from "Lax"
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    
    user.password=undefined // dont wanna show the password as response
    res.status(200).json({
      status:"success",
      token,
      data:user
    })
        
  } catch (err) {
    next(err)
  }
}

export async function logOut(req,res,next){
  try {
    // res.cookie("jwt","",{
    //     httpOnly:true,
    //     expires:new Date(0)
    //   }
    // )
    res.cookie("jwt", "", {
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
export async function getAllUsers(req, res, next) {
  try {
    const users = await User.find({})
    // console.log(req.user)
    res.status(200).json({
      status:"success",
      data:users
    })
  } catch (err) {
    next(err)
  }
}
export async function getUser(req, res, next) {
  try {
    if(!req.params.userId)
      return res.status(400).json({
        status:"failed",
        message:"User not found"
      })
    const user = await User.findById(req.params.userId)
    res.status(200).json({
      status:"success",
      data:user
    })
  } catch (err) {
    next(err)
  }
}

export async function updateUser(req, res, next) {
  try {
    if(!req.body.password || !req.body.email)
      return res.status(400).json({
        status:"failed",
        message:"Email and Password is required"
      })
    const user = await User.findOne({email:req.body.email}).select("+password")//cuz password was select false
    
    if(!user)
      return res.status(400).json({
        status:"failed",
        message:"User not found"
      })
    if(! await user.checkPassword(req.body.password))
      return res.status(400).json({
        status:"failed",
        message:"Invalid Password"
      })
    res.status(200).json({
      status:"success",
      data:user
    })
        
  } catch (err) {
    next(err)
  }
}
export async function deleteUser(req, res, next) {
  try {
    if(!req.params.userId)
      return res.status(400).json({
        status:"failed",
        message:"User id is required"
      })
    const user = await User.findByIdAndDelete(req.params.userId)
    
    if(!user)
      return res.status(400).json({
        status:"failed",
        message:"User not found"
      })
    
    res.status(200).json({
      status:"success",
      data:null
    })
        
  } catch (err) {
    next(err)
  }
}
//for backend
export async function protectRoute(req,res,next){
  try {
    const token = req.cookies.jwt
    if(!token) 
      return res.status(401).json({
        status:"failed",
        message: "You are not logged in"
      })
    const decodedToken = jwt.verify(token,process.env.JWT_SECRET_KEY)
    req.user = await User.findById(decodedToken.id).select("-password")
    next()
  } catch (err) {
    next(err)
  }
}
export async function protectAdminRoute(req,res,next){
  try {
    const token = req.cookies.adminjwt
    // console.log(token)
  } catch (err) {
    next(err)
  }
}
//for frontend check
export async function checkAuth(req,res,next){
  try {
    const token = req.cookies.jwt
    if(!token) 
      return res.status(401).json({
        status:"failed",
        message: "You are not logged in"
      })
    const decodedToken = jwt.verify(token,process.env.JWT_SECRET_KEY)
    const user = await User.findById(decodedToken.id).select("-password")
    if(!user)
      return res.status(400).json({
        status:"failed",
        message: "User not found or token expired"
      })
    res.status(200).json({
      status:"success",
      user
    })

  } catch (err) {
    next(err)
  }
}

export async function getMyDetails(req, res, next) {
  try {
    const user = await User.findById(req.user._id)
    res.status(200).json({
      status:"success",
      data:user
    })
  } catch (err) {
    next(err)
  }
}
export async function updateMe(req,res,next){
  try {

    const { name, email, contactNo, area, city, state, country, postalCode } = req.body
    
    const userData={
      name,
      contactNo,
      address:{
        area,
        city,
        state,
        country,
        postalCode
      }
    }
    const user = await User.findByIdAndUpdate(req.user._id,userData,{new:true})
    if(!user)
      return res.status(400).json({
        status:"failed",
        message:"User not found"
      })
    res.status(200).json({
      status:"success",
      data:user
    })
    
  } catch (err) {
    next(err)
  }
}
export async function updateMyPhoto(req,res,next){
  try {
    if(!req.file)
      return res.status(400).json({
        status:"failed",
        message:"Profile image is required"
      })
    //at first delete the existing image
    await cloudinary.uploader.destroy(req.user.profileImage.public_id)
    //now upload new image
    const imagePromise = new Promise((resolve,reject)=>{
      const uploadstream = cloudinary.uploader.upload_stream({folder:"ShoppyX/Users/", secure:true},(error, results)=>{
        if(error)
          reject(new Error("There was an error uploading the image"))
        resolve({url:results.url,public_id:results.public_id})
      })
      uploadstream.end(req.file.buffer)
    })
    const profileImage=await imagePromise
    const data = await User.findByIdAndUpdate(req.user._id,{profileImage},{new:true})
    res.status(200).json({
      status:"success",
      data
    })
  } catch (err) {
    next(err)
  }
}
export async function deleteMyPhoto(req,res,next){
  try {
    const imagePublicId = req.user.profileImage.public_id
    const deleteImagePromise = cloudinary.uploader.destroy(imagePublicId)
    await deleteImagePromise
    const user = await User.findByIdAndUpdate(req.user._id,{
      profileImage:{
        url:"https://res.cloudinary.com/dy5s9hgoa/image/upload/v1740895975/ShoppyX/Users/ndcuvtpn9uhiuxxsxnyr.png",
        public_id:"ShoppyX/Users/default_profile_image"
      }
    },{new:true})
    res.status(200).json({
      status:"success",
      data:user
    })
  } catch (err) {
    next(err)
  }
}
export async function updateMyPassword(req,res,next) {
  try {
    const {currentPassword,newPassword,confirmPassword}=req.body
    // console.log(currentPassword,newPassword,confirmPassword)
    const user = await User.findById(req.user._id).select("+password")
    if(!await user.checkPassword(currentPassword))
      return res.status(400).json({
        status:"failed",
        message:"Incorrect Password"
      })
    if(newPassword!==confirmPassword)
      return res.status(400).json({
        status:"failed",
        message:"Password should be same as confirm password"
      })
      
    user.password=newPassword
    await user.save()
    res.status(200).json({
      status:"success",
      data:user
    })

  } catch (err) {
    next(err)
  }
}