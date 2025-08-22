import Contact from "../models/contactModel.js";

export async function createContact(req,res,next) {
    try {        
      const data = await Contact.create({...req.body})
      if(!data)
        return res.status(400).json({
            status:"failed",
            message:"There was some error while creating Address"
        })
        res.status(200).json({
            status:"success",
            data
        })
    } catch (err) {
        next(err)
    }
    
}
export async function getContact(req,res,next) {
    try {
        
      const data = await Contact.find({})
      if(!data)
        return res.status(400).json({
            status:"failed",
            message:"No address Found"
        })
        res.status(200).json({
            status:"success",
            data
        })
    } catch (err) {
        next(err)
    }    
}

export async function updateContact(req,res,next) {
    try {
    //    console.log(req.body)
       const {email,contactNo,area,city,country,postalCode}=req.body
       const updatedContactData = {
        email,
        contactNo,
        address:{
            area,city,country,postalCode
        }
       }
    //    console.log(updatedContactData)
      const data = await Contact.findOneAndUpdate(
        {},
        updatedContactData,
        {new:true,runValidators:true}
      )
      if(!data)
        return res.status(400).json({
            status:"failed",
            message:"address not updated or could not be found"
        })
        res.status(200).json({
            status:"success",
            data
        })
    } catch (err) {
        next(err)
    }
    
}
export async function deleteContact(req,res,next) {
    try {        
      const data = await Contact.deleteMany({})
      if(!data)
        return res.status(400).json({
            status:"failed",
            message:"No address Found to delete"
        })
        res.status(200).json({
            status:"success",
            data:null
        })
    } catch (err) {
        next(err)
    }
    
}