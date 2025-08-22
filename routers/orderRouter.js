import express from "express"
import upload from "../controllers/uploadController.js"
import * as userController from "../controllers/userController.js"
import * as orderController from "../controllers/orderController.js"
const router = express.Router()
router.route("/create")
    .post(userController.protectRoute,orderController.createOrder)
router.route("/getAll")
    .get(orderController.getAllOrders)
router.route("/getLimitedOrders")
    .get(orderController.getOrdersByPage)
router.route("/getUserOrders")
    .get(userController.protectRoute,orderController.getAllUserOrders)
router.route("/getSearchedOrder/:orderId")
    .get(orderController.getOrderBySearch)
router.route("/:orderId")
    .get(userController.protectRoute,orderController.getOrderByOrderId)
    .patch(orderController.updateOrderById)
export default router