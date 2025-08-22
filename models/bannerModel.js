import mongoose from "mongoose";
const bannerSchema = new mongoose.Schema({
    heading:{
        type:String,
        required:[true,"Banner heading is required"]
    },
    description:{
        type:String,
        required:[true,"A description is required"]
    },
    image:{
        url:{
            type:String,
            required:true
        },
        public_id:{
            type:String,
            required:true
        }
    }
})

const Banner = mongoose.model("Banner",bannerSchema)
export default Banner