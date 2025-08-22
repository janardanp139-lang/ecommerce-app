import cloudinary from "../config/cloudinary.js"
import Banner from "../models/bannerModel.js"
export async function createBanner(req, res, next) {
    try {
        const { heading, description } = req.body
        const image = req.file

        if (!heading || !description || !image)
            return res.status(400).json({
                status: "failed",
                message: "Fields are required"
            })
        const imagePromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ folder: "ShoppyX/Home-Banners", secure:true },
                (err, results) => {
                    if (err)
                        reject(new Error("Error uploading photot"))
                    resolve({ url: results.url, public_id: results.public_id })
                }
            )
            uploadStream.end(req.file.buffer)
        })
        const imageResult = await imagePromise
        console.log(imageResult)
        const newBanner = {
            heading,
            description,
            image: {
                url: imageResult.url,
                public_id: imageResult.public_id
            }
        }
        const banner = await Banner.create(newBanner)
        res.status(200).json({
            status: "success",
            data: banner
        })

    } catch (err) {
        next(err)
    }
}
export async function getAllBanners(req, res, next) {
    try {

        const banners = await Banner.find()
        if (!banners)
            return res.status(400).json({
                status: "failed",
                message: "No banners found"
            })
        res.status(200).json({
            status: "success",
            data: banners
        })

    } catch (err) {
        next(err)
    }
}
export async function updateBanner(req, res, next) {
    try {
        const { heading, description, hasImageChanged } = req.body
        console.log(req.body)
        if (!heading || !description)
            return res.status(400).json({
                status: "failed",
                message: "Fields are required"
            })
        //lets find the banner
        const banner = await Banner.findById(req.params.id)
        if (!banner)
            return res.status(400).json({
                status: "failed",
                message: "Banner not found"
            })
        let imageResult = banner.image
        //if image has changed then delete the previous image 
        //and upload the new image
        if (hasImageChanged=="true") {
            const image = req.file
            // console.log("new image needs to be uploaded")
            //delete the existing image
            await cloudinary.uploader.destroy(banner.image.public_id)
            //upload the new image
            const imagePromise = new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({ folder: "ShoppyX/Home-Banners/", secure:true },
                    (err, results) => {
                        if (err)
                            reject(new Error("Error uploading photot"))
                        resolve({ url: results.url, public_id: results.public_id })
                    }
                )
                uploadStream.end(req.file.buffer)
            })
            imageResult = await imagePromise
        }
        const updateBanner = await Banner.findByIdAndUpdate(banner._id,
            {
                heading,
                description,
                image: {
                    url: imageResult.url,
                    public_id: imageResult.public_id
                }
            }, { new: true })

        res.status(200).json({
            status: "success",
            data: updateBanner
        })

    } catch (err) {
        next(err)
    }
}
export async function deleteBanner(req, res, next) {
    try {
        //lets find the banner
        const banner = await Banner.findById(req.params.id)
        if (!banner)
            return res.status(400).json({
                status: "failed",
                message: "Banner not found"
            })

        //delete the existing image
        await cloudinary.uploader.destroy(banner.image.public_id)

        const data = await Banner.findByIdAndDelete(banner._id)
        res.status(200).json({
            status: "success",
            message:"Banner deleted successfully",
            data: null
        })

    } catch (err) {
        next(err)
    }
}
