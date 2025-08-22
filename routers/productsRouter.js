import express from "express"
import * as productsController from "../controllers/productsController.js"
import upload from "../controllers/uploadController.js"
const router = express.Router()

router.route("/getAll")
    .get(productsController.getAllProducts)
router.route("/getLimitedProducts")
    .get(productsController.getAllProductsByPage)
router.route("/getAllFeaturedProducts")
    .get(productsController.getAllFeaturedProducts)
router.route("/create")
    .post(upload.array("images",5),productsController.createProduct)
router.route("/deleteAll")
    .delete(productsController.deleteAllProduct)

router.route("/searchSuggestions")
    .get(productsController.getSearchSuggestions)
router.route("/queryProducts/:searchedQuery")
    .get(productsController.getProductsByQuery)
router.route("/getByCategory/:category")
    .get(productsController.getProductsByCategory)
// router.route("/featuredUpdate")
//     .patch(productsController.updateProducts)
router.route("/:id")
    .get(productsController.getProduct)
    .patch(upload.array("images",5),productsController.updateProduct)
    .delete(productsController.deleteProduct)

export default router