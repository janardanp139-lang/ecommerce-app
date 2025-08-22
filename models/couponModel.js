import mongoose from "mongoose"
const couponSchema = new mongoose.Schema({
    title:{
        type:String,
        unique:true
    },
    discountPrice:Number
})
const Coupon = mongoose.model("Coupons",couponSchema)
export default Coupon