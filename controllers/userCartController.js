import User from "../models/userModel.js";
export async function addNewProduct(req,res,next){
    try {
        const userId = req.user._id
        // console.log(req.body)
        const {productId,name,image,size,price,quantity}=req.body
        // const user = await User.findById(userId)
        const user = req.user
        user.cart.push({productId,name,image,size,price,quantity})
        const totalCartAmount = user.cartAmount + parseInt(price)
        user.cartAmount = totalCartAmount
        await user.save()
        // console.log(user)
        res.status(200).json({
            status:"success",
            data:user
        })
    //   const data = await 
    } catch (err) {
        next(err)
    }
}
export async function getAllCartProducts(req,res,next){
    try {
        const userId = req.user._id
        const user = await User.findById(userId)
        // const user = req.user
        // const totalCartAmount = user.cartAmount
        // user.cartAmount = totalCartAmount
        // await user.save()
        // console.log(user)
        // console.log(user)
        res.status(200).json({
            status:"success",
            data:{
                cart:user.cart,
                cartAmount:user.cartAmount
            }
        })
    //   const data = await 
    } catch (err) {
        next(err)
    }
}
export async function checkCartProduct(req,res,next){
    try {
        
        const user= req.user
        const {productId} = req.params
        // console.log(productId)
        // console.log(user)
        const doesProductExist = user.cart.some(product=>product.productId.toString()===productId)
        // console.log(doesProductExist)
        res.status(200).json({
            status:"success",
            data:doesProductExist
        })
    //   const data = await 
    } catch (err) {
        next(err)
    }
}
export async function updateQuantity(req,res,next){
    try {
        // console.log(req.body)
        const {productId} = req.params
        const {quantity}=req.body
        // console.log(productId)
        const user = req.user
        const productIndex = user.cart.findIndex((product)=>product.productId.toString()===productId)
        // console.log(productIndex)
        user.cart[productIndex].quantity=parseInt(quantity)
        const totalCartAmount = user.cart.reduce((acc,product)=>{
            return acc+(product.price*product.quantity)
        },0)
        user.cartAmount=totalCartAmount
        await user.save()
        res.status(200).json({
            status:"success",
            data:user
        })
    } catch (err) {
        next(err)
    }
}
export async function deleteCartProduct(req,res,next){
    try {
        const {productId}=req.params
        const user = req.user
        if(user.cart.length===0)
            return res.status(400).json({
                status:"failed",
                message:"Cart is already empty"
            })
        const filteredProduct=user.cart.filter((product)=>product.productId.toString()!==productId)
        const updatedCartAmount = filteredProduct.reduce((acc,product)=>{
            return acc+product.price
        },0)
        user.cart=filteredProduct
        user.cartAmount=updatedCartAmount
        await user.save()
        res.status(200).json({
            status:"success",
            data:user
        })
    } catch (err) {
        next(err)
    }
}
export async function deleteAllCartProducts(req,res,next){
    try {
        const user = req.user
        if(user.cart.length===0)
            return res.status(400).json({
                status:"failed",
                message:"Cart is already empty"
            })
        
        user.cart=[]
        user.cartAmount=0
        await user.save()
        res.status(200).json({
            status:"success",
            data:user
        })
    } catch (err) {
        next(err)
    }
}
