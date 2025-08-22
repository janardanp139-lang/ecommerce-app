import Order from "../models/orderModel.js";

export async function createOrder(req,res,next){
    try {
        const user = req.user
        const {products,totalPrice,finalPrice,orderStatus} = req.body
        // console.log(req.body)
        // console.log(user)
        // console.log(products)
        if(products.length===0||!totalPrice ||!finalPrice ||!orderStatus)
            return res.status(400).json({
                status:"failed",
                message:"Fields are required"
            })
        const newOrder={
            user:user._id,
            products,
            totalPrice,
            finalPrice,
            orderStatus,
            orderStatusTimeline: [
                {
                  title: "Order Placed",
                  status: true,
                  description: "Order confirmed",
                  date: new Date(),
                },
                {
                  title: "Shipped",
                  status: false,
                  description: "Package has been shipped",
                },
                {
                  title: "In Transit",
                  status: false,
                  description: "Package arrived at local facility",
                },
                {
                  title: "Out for Delivery",
                  status: false,
                  description: "Package is out for delivery",
                },
                {
                  title: "Delivered",
                  status: false,
                  description: "Package delivered to recipient",
                },
              ],
        }
        const order= await Order.create(newOrder)
        //push the order and empty the cart
        user.orders.push(order._id)
        user.cart=[]
        user.cartAmount=0
        await user.save()
        res.status(200).json({
            status:"success",
            data:order
        })
    
    } catch (err) {
        next(err)
    }
}
export async function getAllUserOrders(req,res,next){
    try {
        const user = req.user
        // const orders= await Order.find({user:user._id}).populate("user","name contactNo address")
        const orders= await Order.find({user:user._id}).sort({createdAt:-1})
        if(!orders)
            return res.status(400).json({
                status:"failed",
                message:"No orders found"
            })
        res.status(200).json({
            status:"success",
            data:orders
            // data:{
            //     user:{
            //         name:user.name,
            //         contactNo:user.contactNo,
            //         adress:user.address
            //     },
            //     orders
            // }
        })
    
    } catch (err) {
        next(err)
    }
}
export async function getAllOrders(req,res,next){
    try {
        const orders= await Order.find().populate({
            path:"user",
            select:"name"
        })
        if(!orders)
            return res.status(400).json({
                status:"failed",
                message:"No orders found"
            })
        res.status(200).json({
            status:"success",
            data:orders
            
        })
    
    } catch (err) {
        next(err)
    }
}
export async function getOrdersByPage(req,res,next){
    try {
        const page = parseInt(req.query.page)||1
        const maxOrdersPerPage = 12
        const skipAmount = (page-1)*maxOrdersPerPage
        const totalResults= await Order.countDocuments({})
        const totalPages = Math.ceil(totalResults/maxOrdersPerPage)
        // console.log(page)
        const orders= await Order.find().skip(skipAmount).limit(maxOrdersPerPage).populate({
            path:"user",
            select:"name"
        })
        
        if(!orders)
            return res.status(400).json({
                status:"failed",
                message:"No orders found"
            })
        res.status(200).json({
            status:"success",
            totalResults,
            totalPages,
            data:orders
            
        })
    
    } catch (err) {
        next(err)
    }
}
export async function getOrderByOrderId(req,res,next){
    try {
        const user = req.user
        const {orderId}=req.params
        const order= await Order.findOne({orderId:orderId})
        if( !order)
            return res.status(400).json({
                status:"failed",
                message:"No orders found"
            })
        // console.log(order)
        res.status(200).json({
            status:"success",
            data:{
                user:{
                    name:user.name,
                    contactNo:user.contactNo,
                    address:user.address
                },
                order
            }
        })
    
    } catch (err) {
        next(err)
    }
}
export async function updateOrderById(req,res,next){
    try {
        const {orderId}=req.params
        const {orderStatus} = req.body
        const order= await Order.findOne({orderId:orderId})
        if(!order)
            return res.status(400).json({
                status:"failed",
                message:"No orders found"
            })
        order.orderStatus=orderStatus
        let reachedCurrentStatus=false
        order.orderStatusTimeline.forEach((step)=>{
            if(!reachedCurrentStatus){
                step.status=true
                if(!step.date) step.date=new Date()
            }else{
                step.status=false
                step.date=undefined
            }
            if(step.title===orderStatus)
                reachedCurrentStatus=true
        })
        // console.log(order.orderStatusTimeline)
        await order.save()
        res.status(200).json({
            status:"success",
            data:order
        })
    
    } catch (err) {
        next(err)
    }
}
export async function getOrderBySearch(req,res,next){
    try {
        const user = req.user
        const {orderId}=req.params
        const order= await Order.findOne({orderId:orderId}).populate({
            path:"user",
            select:"name"
        })
        if( !order)
            return res.status(400).json({
                status:"failed",
                message:"Order doesn't exist"
            })
        // console.log(order)
        res.status(200).json({
            status:"success",
            data:order
        })
    
    } catch (err) {
        next(err)
    }
}
