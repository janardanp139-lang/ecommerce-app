import mongoose from "mongoose";
const reviewSchema = new mongoose.Schema({
    // userName:String,
    userId:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:"User", 
        required:true
    },
    productId:{ 
        type:mongoose.Schema.Types.ObjectId, 
        ref:"Product", 
        required:true
    },
    reviewedDate: {
        type:Date,
        default:Date.now
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    description:{
        type:String,
        required:true
    },
    images:[{
        url:String,
        public_id:String
    }],
    videos:[{
        url:String,
        public_id:String
    }],

})
const Review = mongoose.model("Review",reviewSchema)
export default Review