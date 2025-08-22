import express from "express"
import * as contactController  from "../controllers/contactController.js"
const router = express.Router()

router.route("/")
    .post(contactController.createContact)
    .get(contactController.getContact)
    .patch(contactController.updateContact)
    .delete(contactController.deleteContact)

export default router