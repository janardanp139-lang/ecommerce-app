import express from "express"
import * as userController from "../controllers/userController.js"
import upload from "../controllers/uploadController.js"

const router = express.Router()
router.route("/checkAuth")
    .get(userController.checkAuth)
router.route("/signUp")
    .post(userController.createUser)

router.route("/signIn")
    .post(userController.signIn)
router.route("/logout")
    .post(userController.logOut)
router.route("/getAll")
    .get(userController.protectRoute,userController.getAllUsers)
router.route("/getMe")// it needs to come first 
    .get(userController.protectRoute,userController.getMyDetails)

router.route("/updateMyPhoto")
    .patch(userController.protectRoute,upload.single("image"),userController.updateMyPhoto)
router.route("/:userId") // it needs to me second after 
    .get(userController.getUser)
    .delete(userController.deleteUser)
router.route("/updateMe")
    .patch(userController.protectRoute,userController.updateMe)
router.route("/updateMyPassword")
    .patch(userController.protectRoute,userController.updateMyPassword)
router.route("/deleteMyPhoto")
    .patch(userController.protectRoute,userController.deleteMyPhoto)
export default router