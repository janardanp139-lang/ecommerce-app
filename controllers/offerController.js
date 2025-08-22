import cloudinary from "../config/cloudinary.js";
import Offer from "../models/offerModel.js";
export async function createOffer(req, res, next) {
    try {
        const { title, description,discount,value } = req.body
        const image = req.file
        if (!title || !description || !value || !discount || !image)
            return res.status(400).json({
                status: "failed",
                message: "Fields are required"
            })
        //we wont updload the image if the value of offer already exist so check by creating
        const newOffer = {
            title,
            description,
            value,
            discount,
            
        }
        const offer = await Offer.create(newOffer)
        //now if we dont get any error then procced
        const imagePromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ folder: "ShoppyX/Offers", secure:true },
                (err, results) => {
                    if (err)
                        reject(new Error("Error uploading photo"))
                    resolve({ url: results.url, public_id: results.public_id })
                }
            )
            uploadStream.end(req.file.buffer)
        })
        const imageResult = await imagePromise
        console.log(imageResult)
        offer.image={
            url:imageResult.url,
            public_id:imageResult.public_id
        }
        await offer.save()
        
        res.status(200).json({
            status: "success",
            data: offer
        })

    } catch (err) {
        next(err)
    }
}
export async function getAllOffers(req, res, next) {
    try {

        const offers = await Offer.find()
        if (!offers)
            return res.status(400).json({
                status: "failed",
                message: "No banners found"
            })
        res.status(200).json({
            status: "success",
            data: offers
        })

    } catch (err) {
        next(err)
    }
}
export async function updateOffer(req, res, next) {
    try {
        const { title, description, value, discount, hasImageChanged } = req.body
        console.log(req.body)
        if (!title || !description || !value || !discount)
            return res.status(400).json({
                status: "failed",
                message: "Fields are required"
            })
        //lets find the banner
        const offer = await Offer.findById(req.params.id)
        if (!offer)
            return res.status(400).json({
                status: "failed",
                message: "Banner not found"
            })
        let imageResult = offer.image
        //if image has changed then delete the previous image 
        //and upload the new image
        if (hasImageChanged=="true") {
            const image = req.file
            // console.log("new image needs to be uploaded")
            //delete the existing image
            await cloudinary.uploader.destroy(offer.image.public_id)
            //upload the new image
            const imagePromise = new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({ folder: "ShoppyX/Offers/", secure:true },
                    (err, results) => {
                        if (err)
                            reject(new Error("Error uploading photo"))
                        resolve({ url: results.url, public_id: results.public_id })
                    }
                )
                uploadStream.end(req.file.buffer)
            })
            imageResult = await imagePromise
        }
        const updateOffer = await Offer.findByIdAndUpdate(offer._id,
            {
                title,
                description,
                discount,
                value,
                image: {
                    url: imageResult.url,
                    public_id: imageResult.public_id
                }
            }, { new: true })

        res.status(200).json({
            status: "success",
            data: updateOffer
        })

    } catch (err) {
        next(err)
    }
}
export async function deleteOffer(req, res, next) {
    try {
        //lets find the offer
        const offer = await Offer.findById(req.params.id)
        if (!offer)
            return res.status(400).json({
                status: "failed",
                message: "Offer not found"
            })

        //delete the existing image
        await cloudinary.uploader.destroy(offer.image.public_id)

        const data = await Offer.findByIdAndDelete(offer._id)
        res.status(200).json({
            status: "success",
            message:"Offer deleted successfully",
            data: null
        })

    } catch (err) {
        next(err)
    }
}