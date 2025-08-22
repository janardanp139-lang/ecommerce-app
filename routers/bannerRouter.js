import express from "express"
import upload from "../controllers/uploadController.js"
import * as bannerController from "../controllers/bannerController.js"
const router = express.Router()
router.route("/create")
    .post(upload.single("image"),bannerController.createBanner)
router.route("/getAll")
    .get(bannerController.getAllBanners)
router.route("/:id")
    .patch(upload.single("image"),bannerController.updateBanner)
    .delete(bannerController.deleteBanner)
export default router