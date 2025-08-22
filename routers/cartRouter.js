import express from "express"
import * as userCartController from "../controllers/userCartController.js"
import * as userController from "../controllers/userController.js"
const router = express.Router()

router.route("/addNewProduct")
    .post(userController.protectRoute,userCartController.addNewProduct)
router.route("/getAll")
    .get(userController.protectRoute,userCartController.getAllCartProducts)
router.route("/deleteCartProducts")
    .get(userController.protectRoute,userCartController.getAllCartProducts)
router.route("/checkProduct/:productId")
    .get(userController.protectRoute,userCartController.checkCartProduct)
router.route("/:productId")
    .patch(userController.protectRoute,userCartController.updateQuantity)
    .delete(userController.protectRoute,userCartController.deleteCartProduct)


export default router