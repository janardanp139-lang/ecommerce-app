import cloudinary from "../config/cloudinary.js"
import Category from "../models/categoryModel.js"

export async function createCategory(req,res,next) {
    try {
        const{title,value,featuredCategory}=req.body
        console.log("req body",req.body)
        const imageFile = req.file
        console.log("req file",req.file)
        if(!title || !value ||!featuredCategory|| !imageFile)
            return res.status(400).json({
                status:"failed",
                message:"Fields are required"
            })
        //atfirst check whether im getting error 
        const newCategory={
            title,
            value,
            featuredCategory: featuredCategory==="yes"
        }
        const data = await Category.create(newCategory)
        //now upload iamges
        const imageUploadPromise = new Promise((resolve,reject)=>{
            const uploadStream = cloudinary.uploader.upload_stream(
                {folder:"ShoppyX/Categories/", secure:true},
                (err,results)=>{
                    if(err)
                        reject(new Error("Error uploading image"))
                    resolve({url:results.secure_url,public_id:results.public_id})
            })
            uploadStream.end(imageFile.buffer)
        })
        const image=await imageUploadPromise
        data.image = image
        //now save 
        await data.save()
      res.status(200).json({
        status:"success",
        data
      })
    } catch (err) {
        next(err)
    }
}
export async function getAllCategories(req,res,next) {
    try {
      const data = await Category.find({})
      res.status(200).json({
        status:"success",
        data
      })
    } catch (err) {
        next(err)
    }
}
export async function getNameOfCategory(req,res,next) {
    try {
        const{category} = req.params
      const data = await Category.findOne({value:category})
      
      res.status(200).json({
        status:"success",
        title:data.title
      })
    } catch (err) {
        next(err)
    }
}

export async function getSomeCategories(req,res,next) {
    try {
      const data = await Category.find({}).limit(6)
      res.status(200).json({
        status:"success",
        data
      })
    } catch (err) {
        next(err)
    }
}
export async function updateCategory(req,res,next) {
    try {
        const{title,value,featuredCategory}=req.body
        const imageFile = req.file
        if(!title || !value || !featuredCategory)
            return res.status(400).json({
                status:"failed",
                message:"Fields are required"
            })
        const category = await Category.findById(req.params.id)
        if(!category){
            return res.status(400).json({
                status:"failed",
                message:"Category not found"
            })
        }
        category.title=title
        category.value=value
        category.featuredCategory = featuredCategory==="yes"
        
        if(imageFile){
            //at first delete the existing
            await cloudinary.uploader.destroy(category.image.public_id)
            //now upload new image
            const imageUploadPromise = new Promise((resolve,reject)=>{
                const uploadStream = cloudinary.uploader.upload_stream(
                    {folder:"ShoppyX/Categories/", secure:true},
                    (err,results)=>{
                        if(err)
                            reject(new Error("Error uploading image"))
                        resolve({url:results.secure_url,public_id:results.public_id})
                })
                uploadStream.end(imageFile.buffer)
            })
            const image=await imageUploadPromise
            category.image=image
        }
        await category.save()
      res.status(200).json({
        status:"success",
        data:category
      })
    } catch (err) {
        next(err)
    }
}
export async function deleteCategory(req,res,next) {
    try {
      const categoryItem = await Category.findById(req.params.id)
      if(!categoryItem)
        return res.status(404).json({
            status:"failed",
            message:"Category not found"
        })
        if(categoryItem.image?.public_id){
            const imageDeletePromise = cloudinary.uploader.destroy(categoryItem.image.public_id)
            await imageDeletePromise
        }

       await categoryItem.deleteOne()
      res.status(200).json({
        status:"success",
        data:null
      })
    } catch (err) {
        next(err)
    }
}