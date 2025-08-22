import express from "express"
import * as currencyRateController from "../controllers/currencyRateController.js"
const router = express.Router()

router.route("/create")
       .post(currencyRateController.createCurrencyRate)
router.route("/update")
       .patch(currencyRateController.updateCurrencyRate)
router.route("/getRate")
       .get(currencyRateController.getCurrencyRate)

export default router