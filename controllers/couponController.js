import Coupon from "../models/couponModel.js"

export async function createCoupon(req,res,next){
    try {
      const {title,discountPrice} = req.body
    //   console.log(req.body)
      if(!title || !discountPrice)
        return res.status(400).json({
            status:"failed",
            message:"Fields are required"
        })
        const coupon = await Coupon.create({title,discountPrice})
        res.status(200).json({
            status:"success",
            message:"Coupon created successfully",
            data:coupon
        })
    } catch (err) {
        next(err)
    }
}
export async function getAllCoupons(req,res,next){
    try {
        const coupon = await Coupon.find()
        if(!coupon)
            return res.status(400).json({
                status:"failed",
                message:"No coupons found"
            })
        res.status(200).json({
            status:"success",
            data:coupon
        })
    } catch (err) {
        next(err)
    }
}
export async function getCouponByName(req,res,next){
    try {
        const {couponName} = req.params
        // console.log(cuponName)
        if(!couponName)
            return res.status(400).json({
                status:"failed",
                message:"Coupon name is required"
            })
        const coupon = await Coupon.findOne({title:{$eq:couponName}})
        if(!coupon)
            return res.status(400).json({
                status:"failed",
                message:"No coupons found"
            })
        res.status(200).json({
            status:"success",
            data:coupon
        })
    } catch (err) {
        next(err)
    }
}
export async function updateCoupon(req,res,next){
    try {
        const {couponId} = req.params
        // const {title,discountPrice} = req.body
        // if(!title || !discountPrice)
        //     return res.status(400).json({
        //         status:"failed",
        //         message:"Fields are required"
        //     })
        
        const coupon = await Coupon.findByIdAndUpdate(couponId,req.body,{
            new:true,
        })
        if(!coupon)
            return res.status(400).json({
                status:"failed",
                message:"Coupon not found"
            })
        res.status(200).json({
            status:"success",
            message:"Coupon updated successfully",
            data:coupon
        })
    } catch (err) {
        next(err)
    }
}
export async function deleteCoupon(req,res,next){
    try {
        const {couponId} = req.params
        const coupon = await Coupon.findByIdAndDelete(couponId)
        if(!coupon)
            return res.status(400).json({
                status:"failed",
                message:"Coupon not found"
            })
        res.status(200).json({
            status:"success",
            message:"Coupon deleted successfully",
            data:null
        })
    } catch (err) {
        next(err)
    }
}