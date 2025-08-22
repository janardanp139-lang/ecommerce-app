import express from "express"
import * as paymentController from "../controllers/paymentController.js"
import * as userController from "../controllers/userController.js"
const router = express.Router()

router.post("/create-checkout-session",userController.protectRoute,paymentController.createStripeCheckoutSession)
router.get("/verify-checkout-session",userController.protectRoute,paymentController.verifyStripeCheckoutSession)

export default router