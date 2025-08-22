import express from "express"
import * as couponController from "../controllers/couponController.js"
const router = express.Router()
router.route("/create")
    .post(couponController.createCoupon)
router.route("/getAll")
    .get(couponController.getAllCoupons)
router.route("/get/:couponName")
    .get(couponController.getCouponByName)
router.route("/:couponId")
    .patch(couponController.updateCoupon)
    .delete(couponController.deleteCoupon)
export default router