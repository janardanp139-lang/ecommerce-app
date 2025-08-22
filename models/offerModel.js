import mongoose from "mongoose";
const offerSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,"A offer must have title"]
    },
    description:{
        type:String,
        required:[true,"Offer must have despription"]
    },
    discount:{
        type:Number,
        required:[true,"Discount is required"]
    },
    value:{
        type:String,
        required:[true,"Value is required"],
        unique:true,
        trim:true
    },
    image:{
        url:String,
        public_id:String
    }
})
const Offer = mongoose.model("Offers",offerSchema)
export default Offer