import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import morgan from "morgan"
import connectDB from "./config/database.js"
import productsRouter from "./routers/productsRouter.js"
import categoryRouter from "./routers/categoryRouter.js"
import userRouter from "./routers/userRouter.js"
import cartRouter from "./routers/cartRouter.js"
import adminRouter from "./routers/adminRouter.js"
import bannerRouter from "./routers/bannerRouter.js"
import offerRouter from "./routers/offerRouter.js"
import orderRouter from "./routers/orderRouter.js"
import paymentRouter from "./routers/paymentRouter.js"
import couponRouter from "./routers/couponRouter.js"
import contactRouter from "./routers/contactRouter.js"
import mailRouter from "./routers/mailRouter.js"
import reviewRouter from "./routers/reviewRouter.js"
import currencyRateRouter from "./routers/currencyRateRouter.js"
import cookieParser from "cookie-parser"
dotenv.config()

const app =express()
app.use(cors({
    origin:["http://localhost:5173","https://shoppy-x.vercel.app"],
    method:["GET", "POST", "PUT","PATCH", "DELETE"],
    credentials:true
}))
//middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan("dev"))

//request
//connect the database
connectDB()


//routes
app.use("/api/v1/products",productsRouter)
app.use("/api/v1/reviews",reviewRouter)
app.use("/api/v1/categories",categoryRouter)
app.use("/api/v1/users",userRouter)
app.use("/api/v1/cart",cartRouter)
app.use("/api/v1/admin",adminRouter)
app.use("/api/v1/banners",bannerRouter)
app.use("/api/v1/offers",offerRouter)
app.use("/api/v1/coupons",couponRouter)
app.use("/api/v1/orders",orderRouter)
app.use("/api/v1/contact",contactRouter)
app.use("/api/v1/mail",mailRouter)
app.use("/api/v1/payments",paymentRouter)
app.use("/api/v1/currencyRate",currencyRateRouter)


app.use("*",(req,res,next)=>{
    res.status(404).json({
        status:"error",
        message:"This page is not found"
    })
})

//Global error handling
app.use((err,req,res,next)=>{
    console.log(err.stack)
    res.status(500).json({
        status:"error",
        message: err.message||"Something went wrong",
        details:err
    })
})


const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log("server is running...")
})
