import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    contactNo:Number,
    email:String,
    address:
        {
            area:{
                type:String,
                required:[true,"Address should have area"]
            },
            city:{
                type:String,
                required:[true,"Address should have city"]
            },
            country:{
                type:String,
                required:[true,"Address should have country"]
            },
            postalCode:{
                type:Number,
                required:[true,"Address should have postalcode"]
            }
        }
    
})

const Contact = mongoose.model("Contact",contactSchema)
export default Contact