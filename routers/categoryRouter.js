import express from "express"
import * as categoryController  from "../controllers/categoryController.js"
import upload from "../controllers/uploadController.js"
const router = express.Router()
router.route("/create")
    .post(upload.single("image"),categoryController.createCategory)
router.route("/getAll")
    .get(categoryController.getAllCategories)
router.route("/getAllFeatured")
    .get(categoryController.getAllCategories)
router.route("/getSome")
    .get(categoryController.getSomeCategories)
router.route("/getName/:category")
    .get(categoryController.getNameOfCategory)

router.route("/:id")
    .patch(upload.single("image"),categoryController.updateCategory)
    .delete(categoryController.deleteCategory)

export default router