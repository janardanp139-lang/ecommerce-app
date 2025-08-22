import express from "express"
import upload from "../controllers/uploadController.js"
import * as offerController from "../controllers/offerController.js"
const router = express.Router()
router.route("/create")
    .post(upload.single("image"),offerController.createOffer)
router.route("/getAll")
    .get(offerController.getAllOffers)
router.route("/:id")
    .patch(upload.single("image"),offerController.updateOffer)
    .delete(offerController.deleteOffer)
export default router