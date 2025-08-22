import express from "express"
import * as mailController from "../controllers/mailController.js"
const router = express.Router()

router.route("/send")
    .post(mailController.sendInquiryMail)

export default router