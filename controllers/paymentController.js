import Stripe from "stripe"
import dotenv from "dotenv"
import Order from "../models/orderModel.js"
import User from "../models/userModel.js"
import CurrencyRate from "../models/currencyRateModel.js"

dotenv.config()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
export async function createStripeCheckoutSession(req, res, next) {
    try {
      const user = req.user
      const { products, totalPrice, finalPrice } = req.body
  
      if (!products?.length || !finalPrice)
        return res.status(400).json({ message: "Missing fields" })
  
       // calling my api as the usd and inr amount changes
       const currencyRate = await CurrencyRate.findOne().select("inrRate")
       if (!currencyRate?.inrRate) {
        return res.status(500).json({ message: "Currency rate not found" });
      }
    const INR_TO_USD = 1 / currencyRate.inrRate;

    const line_items = products.map((item) => ({
      price_data: {
        currency: "usd", // keep USD for Stripe
        product_data: {
          name: item.name,
        },
        // Convert from INR to USD, then multiply by 100 (cents)
        unit_amount: Math.round(item.price * INR_TO_USD * 100),
      },
      quantity: item.quantity,
    }));
  
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        customer_email: user.email,
        success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/checkout`,
        metadata: {
          userId: user._id.toString(),
          cart: JSON.stringify(products),
          totalPrice: totalPrice.toString(),
          finalPrice: finalPrice.toString(),
        },
      })
  
      res.status(200).json({ url: session.url })
    } catch (err) {
      next(err)
    }
  }

  export async function verifyStripeCheckoutSession(req, res, next) {
    try {
      const session_id = req.query.session_id
      if (!session_id) return res.status(400).json({ message: "Session ID missing" })
  
      const session = await stripe.checkout.sessions.retrieve(session_id)
      if (session.payment_status !== "paid")
        return res.status(400).json({ message: "Payment not completed" })
  
      const userId = session.metadata.userId
      const cart = JSON.parse(session.metadata.cart)
      const totalPrice = Number(session.metadata.totalPrice)
      const finalPrice = Number(session.metadata.finalPrice)
  
      const user = await User.findById(userId)
      if (!user) return res.status(404).json({ message: "User not found" })
  
      // Create order
      const order = await Order.create({
        user: user._id,
        products: cart,
        totalPrice,
        finalPrice,
        paymentIntentId: session.payment_intent,
        orderStatus: "Order Placed",
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
      })
  
      // Update user
      user.orders.push(order._id)
      user.cart = []
      user.cartAmount = 0
      await user.save()
  
      res.status(200).json({ message: "Order created successfully" })
    } catch (err) {
      next(err)
    }
  }
  