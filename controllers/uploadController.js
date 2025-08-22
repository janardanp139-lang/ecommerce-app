import cloudinary from "../config/cloudinary.js";
import multer from "multer"
const storage = multer.memoryStorage()
const upload = multer({
    storage,
    limits: {fileSize:20*1024*1024},//max size 20 mb
})
export default upload