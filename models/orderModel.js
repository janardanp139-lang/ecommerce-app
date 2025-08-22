import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    orderId:{
        type:String,
        unique:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    orderStatusTimeline: [
        {
            _id:false,
          title: { type: String, required: true },
          status: { type: Boolean, default: false },
          description: { type: String, required: true },
          date: { type: Date },
        },
      ],
    orderStatus:String,
    products:[{
        productId:mongoose.Schema.Types.ObjectId,
        name:"String",
        image:"String",
        price:Number,
        quantity:{
            type:Number,
            default:1
        }
    }],
    totalPrice:Number,
    finalPrice:Number
},{timestamps:true})
orderSchema.pre("save",async function(next){
    if(!this.isNew) return next()
    const orderCount = await mongoose.model("Orders").countDocuments()
    this.orderId = "ORD"+String(orderCount+1).padStart(5,"0")
    next()
})
const Order = mongoose.model("Orders",orderSchema)
export default Order