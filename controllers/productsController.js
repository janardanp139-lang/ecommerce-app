import Product from "../models/productModel.js"
import cloudinary from "../config/cloudinary.js"
import huggingFaceApi from "../config/hugginFaceApi.js"
import { model } from "mongoose"
const maxProductsPerPage = 15
export async function getAllProducts(req,res,next){
    try {

      const products = await Product.find({})
      res.status(200).json({
        status:"success",
        data:products
      })
    } catch (err) {
      next(err)       
    }
}
export async function getAllProductsByPage(req,res,next){
    try {
      const page =parseInt(req.query.page) || 1
      // console.log("thepage",req.query)
      
      const skipAmount = (page - 1)*maxProductsPerPage
      const products = await Product.find({}).skip(skipAmount).limit(maxProductsPerPage)
      const totalResults = await Product.countDocuments({})
      const totalPages = Math.ceil(totalResults/maxProductsPerPage)
      res.status(200).json({
        status:"success",
        totalResults,
        totalPages,
        data:products
      })
    } catch (err) {
      next(err)       
    }
}
export async function getProductsByCategory(req,res,next){
    try {
       
      const {category}=req.params
      const page = parseInt(req.query.page) || 1
      // console.log(req.query)
      const filterQuery = {category}
      //price filtering  
      if(req.query.price){
        if(req.query.price.gte)
          filterQuery.finalPrice={...filterQuery.finalPrice,$gte:Number(req.query.price.gte)}
        if(req.query.price.lte)
          filterQuery.finalPrice={...filterQuery.finalPrice,$lte:Number(req.query.price.lte)}
      }
      //discount filtering  
      if(req.query.discount){
        if(req.query.discount.gte)
          filterQuery.discount={...filterQuery.discount,$gte:Number(req.query.discount.gte)}
      }
      //rating filtering  
      if(req.query.rating){
        if(req.query.rating.gte)
          filterQuery.rating={...filterQuery.rating,$gte:Number(req.query.rating.gte)}
        }
        console.log("filterobject",filterQuery)
      // console.log('query',page)
       //per page how many products
      const skipAmount = (page-1)*maxProductsPerPage
      const products = await Product.find(filterQuery).skip(skipAmount).limit(maxProductsPerPage)
      const totalResults = await Product.countDocuments(filterQuery)
  
      res.status(200).json({
        status:"success",
        totalResults,
        totalPages: Math.ceil(totalResults/maxProductsPerPage),
        data:products
      })
    } catch (err) {
      next(err)       
    }
}
export async function getAllFeaturedProducts(req,res,next){
    try {
      const products = await Product.find({featuredProduct:true})
      res.status(200).json({
        status:"success",
        data:products
      })
    } catch (err) {
      next(err)       
    }
}
export async function createProduct(req,res,next){
    try {
      console.log(req.body)
      // console.log(req.files)
      if(!req.files || req.files.length===0)
        return res.status(400).json({
          status:"failed",
          message:"At least one image required"
        })
      if(req.files.length>5)
        return res.status(400).json({
          status:"failed",
          message:"Maximum 5 images can be uploaded"
        })
      const imageUploadPromises = req.files.map((file)=>{
        return new Promise((resolve,reject)=>{
          const uploadstream = cloudinary.uploader.upload_stream({folder:"ShoppyX/Products/", secure:true},
            (error,results)=>{
              if(error)
                return reject(new Error("Something went wrong while uploading"))
              return resolve({url:results.secure_url,public_id:results.public_id})
            }
          )
          uploadstream.end(file.buffer)
        })
      })
      const imageUrls = await Promise.all(imageUploadPromises)
      // console.log(imageUrls)
      req.body.featuredProduct= req.body.featuredProduct==="true"
      const products = await Product.create({...req.body,images:imageUrls})
      res.status(200).json({
        status:"success",
        data:products
      })
    } catch (err) {
      next(err)       
    }
}
export async function getProduct(req,res,next){
    try {
      
      // const product = await Product.findById(req.params.id).populate({
      //   path:"reviews",
      //   populate:{
      //     path:"userId",
      //     select:"name"
      //   }
      // })
      const product = await Product.findById(req.params.id)
      if(!product)
        return res.status(404).json({
          status:"failed",
          message:"Product not found"
        })
      res.status(200).json({
        status:"success",
        data:product
      })
    } catch (err) {
      next(err)
    }
}
export async function getProductsByQuery(req,res,next){
  try {
    const {page=1} = req.query
    const {searchedQuery}=req.params
    console.log(searchedQuery)
    console.log(req.query)
    
    if(!searchedQuery || !page)
      return res.status(400).json({
        status:"failed",
        message:"query parameter or page required"
      })
    
    // Add error handling for HuggingFace API
    let queryEmbedding;
    try {
      queryEmbedding = await huggingFaceApi.featureExtraction({
        model:"sentence-transformers/all-MiniLM-L6-v2",
        inputs:searchedQuery
      });
    } catch (error) {
      console.error("HuggingFace API error:", error.message);
      // Continue with text-based search only - don't let the vector search fail the whole request
      queryEmbedding = null;
    }
    
    const filterQuery = {}
    //price filtering  
    if(req.query.price){
      if(req.query.price.gte)
        filterQuery.finalPrice={...filterQuery.finalPrice,$gte:Number(req.query.price.gte)}
      if(req.query.price.lte)
        filterQuery.finalPrice={...filterQuery.finalPrice,$lte:Number(req.query.price.lte)}
    }
    //discount filtering  
    if(req.query.discount){
      if(req.query.discount.gte)
        filterQuery.discount={...filterQuery.discount,$gte:Number(req.query.discount.gte)}
    }
    //rating filtering  
    if(req.query.rating){
      if(req.query.rating.gte)
        filterQuery.rating={...filterQuery.rating,$gte:Number(req.query.rating.gte)}
    }
    console.log("filterobject", filterQuery)

    const skipAmount = (parseInt(page)-1)*maxProductsPerPage
    
    // Modify the search pipeline based on whether we have vector embeddings
    const searchPipeline = [];
    
    // Only add vector search if we have embeddings
    if (queryEmbedding) {
      searchPipeline.push({
        $vectorSearch:{
          index:"vector_index",
          path:"vector",
          queryVector:queryEmbedding,
          numCandidates:20,
          limit:20,
        },
      });
    }
    
    // Always include text-based searching
    searchPipeline.push({
      $match: {
        $and: [
          {
            $or: [
              { category: new RegExp(searchedQuery, "i") },
              { name: new RegExp(searchedQuery, "i") },
              { description: new RegExp(searchedQuery, "i") }
            ]
          },
          filterQuery
        ]
      },
    });
    
    searchPipeline.push({
      $facet:{
        metadata:[{ $count:"total" }],
        data:[
          { $skip:skipAmount },
          { $limit:maxProductsPerPage },
          { $project:{ vector:0 }}, //exclude vector field
        ]
      }
    });
    
    const results = await Product.aggregate(searchPipeline);
    
    if(!results)
      return res.status(404).json({
        status:"failed",
        message:"No results found"
      })
      
    const totalResults = results[0].metadata.length > 0 ? results[0].metadata[0].total : 0;
    if(totalResults===0)
      return res.status(400).json({
        status: "failed",
        message: "No results found",
      })

    res.status(200).json({
      status:"success",
      totalResults,
      totalPages: Math.ceil(totalResults/maxProductsPerPage),
      data:results[0].data
    })
  } catch (err) {
    console.error("Search error:", err);
    next(err)
  }
}
export async function getSearchSuggestions(req,res,next){
  try {
    const {query,page=1} = req.query
    if(!query || !page)
      return res.status(400).json({
        status:"failed",
        message:"query parameter or page required"
      })
      
    // Add error handling for HuggingFace API
    let queryEmbedding;
    try {
      queryEmbedding = await huggingFaceApi.featureExtraction({
        model:"sentence-transformers/all-MiniLM-L6-v2",
        inputs:query
      });
    } catch (error) {
      console.error("HuggingFace API error:", error.message);
      // Continue with text-based search only
      queryEmbedding = null;
    }
    
    const maxProductsPerPage=5
    const skipAmount = (parseInt(page)-1)*maxProductsPerPage
    
    // Modify the search pipeline based on whether we have vector embeddings
    const searchPipeline = [];
    
    // Only add vector search if we have embeddings
    if (queryEmbedding) {
      searchPipeline.push({
        $vectorSearch:{
          index:"vector_index",
          path:"vector",
          queryVector:queryEmbedding,
          numCandidates:20,
          limit:20,
        },
      });
    }
    
    // Always include text-based searching
    searchPipeline.push({
      $match: {
        $or: [
          { category: new RegExp(query, "i") }, // Match by category
          { name: new RegExp(query, "i") }, // Match by product name
          { description: new RegExp(query,"i")}//match by description
        ],
      },
    });
    
    searchPipeline.push({
      $facet:{
        metadata:[{ $count:"total" }],
        data:[
          { $skip:skipAmount },
          { $limit:maxProductsPerPage },
          { 
            $project:{ 
              _id:1,
              name:1,
              images:1,
            }
          },
        ]
      }
    });
    
    const results = await Product.aggregate(searchPipeline);
    
    if(!results)
      return res.status(404).json({
        status:"failed",
        message:"No results found"
      })
      
    const totalResults = results[0].metadata.length > 0 ? results[0].metadata[0].total : 0;
    if(totalResults===0)
      return res.status(400).json({
        status: "failed",
        message: "No results found",
      })

    res.status(200).json({
      status:"success",
      data:results[0].data
    })
  } catch (err) {
    console.error("Search suggestions error:", err);
    next(err)
  }
}
export async function deleteProduct(req,res,next){
    try {
      
      const product = await Product.findById(req.params.id)
      if(!product) 
        return res.status(404).json({
          status:"failed",
          message:"Product with that id could not be found!"
        }) 
      const deleteImagesProduct = product.images.map(img=>cloudinary.uploader.destroy(img.public_id))
      await Promise.all(deleteImagesProduct)
      await Product.findByIdAndDelete(req.params.id)
      res.status(200).json({
        status:"success",
        data:null
      })
    } catch (err) {
      next(err)    
    }
}
export async function updateProduct(req,res,next){
    try {
      console.log("form data received",req.body)
      const product = await Product.findById(req.params.id)
      if(!product){
        return res.status(400).json({
          status:"failed",
          message:"product not found"
        })
      }
      //1)at first we will delete those image that dont need anymore
      //2)upload the new image and merge with the existing image of products
      const {name,availableSize,category,inStock,imageUrls,description,discount,featuredProduct,features,actualPrice} = req.body
      let allProductImages=product.images
      const imagesToBeDeleted= allProductImages.filter(img=>!imageUrls.includes(img.url))
      const imagesToBeStayed = allProductImages.filter(img=>imageUrls.includes(img.url))
      const imagesToBeUploaded = req.files
      // console.log("all images",allProductImages)
      // console.log("stayable images",imagesToBeStayed)
      // console.log("deleteable images",imagesToBeDeleted)
      // console.log("form files received",imagesToBeUploaded)
      //delete the images
      if(imagesToBeDeleted.length>0){
        const deleteImagesPromise = imagesToBeDeleted?.map(img=>cloudinary.uploader.destroy(img.public_id))
         await Promise.all(deleteImagesPromise)       
      }
      //upload new images
      let uploadedImageUrls=[]
      if(imagesToBeUploaded.length>0){
        const uploadImagePromise = imagesToBeUploaded.map(img=>{
          return new Promise((resolve,reject)=>{
            const uploadstream = cloudinary.uploader.upload_stream(
              {folder:"ShoppyX/Products/", secure:true},
              (err,results)=>{
                if(err)
                  reject(new Error("Error uploading image"))
                resolve({url:results.secure_url,public_id:results.public_id})
            })
            uploadstream.end(img.buffer)
          })
        })
        uploadedImageUrls = await Promise.all(uploadImagePromise)
      }
      //merge all products images urls
      allProductImages = [...imagesToBeStayed,...uploadedImageUrls]
      // const finalPrice = Math.round(actualPrice-(actualPrice*discount)/100)
      // const updateProduct = {
      //   name,
      //   availableSize,
      //   category,
      //   inStock,
      //   description,
      //   discount,
      //   featuredProduct:featuredProduct==="true",
      //   features,
      //   actualPrice,
      //   finalPrice,
      //   images: allProductImages
      // }
      // const updatedProductResult = await Product.findByIdAndUpdate(req.params.id,updateProduct,{
      //   new:true
      // })
      product.name = name;
    product.availableSize = availableSize;
    product.category = category;
    product.inStock = inStock;
    product.description = description;
    product.discount = discount;
    product.featuredProduct = featuredProduct === "true";
    product.features = features;
    product.actualPrice = actualPrice;
    product.finalPrice = Math.round(actualPrice - (actualPrice * discount) / 100);
    product.images = allProductImages;

    //now save
    await product.save()
      res.status(200).json({
        status:"success",
        data:product
      })
      
    } catch (err) {      
      next(err)
    }
}
export async function deleteAllProduct(req,res,next){
    try {
      
      await Product.deleteMany({})
      
      res.status(200).json({
        status:"success",
        data:null
      })
    } catch (err) {      
      next(err)
    }
}

//i changed the model so some fields werenot there so i updated the exiting product using this code
// export async function updateExisting(req,res,next) {
//   try {
//     const data = await Product.updateMany({ featuredProduct: { $exists: false } }, { $set: { featuredProduct: false } });
//     console.log("All existing products updated successfully!");
//     res.status(200).json({
//       status:"success",
//       data
//     })
// } catch (error) {
//     console.error("Error updating products:", error);
// }
// }

// export async function updateProducts(req,res,next) {
// try {
  

//   const products = await Product.find();

//   const allProduct = await Product.updateMany(
//     { price: { $exists: true } }, 
//     [
//       {
//         $set: {
//           actualPrice: "$price",
//           finalPrice: {
//             $round: [{ $subtract: ["$price", { $multiply: ["$price", { $divide: ["$discount", 100] }] }] }, 0]
//           }
//         },
//       },
//       { $unset: "price" }
//     ]
//   );
//   console.log("✅ Bulk update completed!");
  

//   console.log("✅ All products updated: 'price' → 'actualPrice' & added 'finalPrice'!");
//   res.status(200).json({
//     status:"success",
//     data:allProduct
//   })
// } catch (err) {
//   next(err)
// }
// }
// export async function bulkUpdateVectors() {  
//   try {  
//     console.log("🔄 Fetching products without valid vectors...");  

//     // Find products where vector does not exist OR is empty
//     const products = await Product.find({
//       $or: [{ vector: { $exists: false } }, { vector: { $size: 0 } }],
//     }).select("+description +name +category");  

//     if (products.length === 0) {  
//       console.log("✅ All products already have valid vectors. No update needed.");  
//       return;  
//     }  

//     console.log(`🔄 Found ${products.length} products to update.`);  

//     // Process updates in parallel (limit concurrency to prevent API overload)
//     const updatePromises = products.map(async (product) => {  
//       try {  
//         const name = product.name || "";  
//         const description = product.description || "";  
//         const category = product.category || "";  

//         const embeddings = await huggingFaceApi.featureExtraction({  
//           model: "sentence-transformers/all-MiniLM-L6-v2",  
//           inputs: `name: ${name} description: ${description} category: ${category}`,  
//         });  

//         product.vector = embeddings;  
//         await product.save();  

//         console.log(`✅ Updated product: ${product.name}`);  
//       } catch (err) {  
//         console.error(`❌ Error updating product ${product.name}:`, err);  
//       }  
//     });  

//     // Wait for all updates to finish  
//     await Promise.all(updatePromises);  
//     console.log("🎉 Bulk update completed!");  

//   } catch (error) {  
//     console.error("❌ Bulk update failed:", error);  
//   } 
//   // finally {  
//   //   // ❌ Don't close if running inside app  
//   //   if (process.env.STANDALONE_SCRIPT === "true") {  
//   //     mongoose.connection.close();  
//   //   }  
//   // }  
// }  

// bulkUpdateVectors()

// async function removeVectorsFromProducts() {
//   try {
   
//     const result = await Product.updateMany({}, { $unset: { vector: 1 } });

//     console.log(`✅ Successfully removed vectors from ${result.modifiedCount} products.`);
    
//     mongoose.connection.close();
//   } catch (error) {
//     console.error("❌ Error removing vectors:", error);
//     mongoose.connection.close();
//   }
// }
// removeVectorsFromProducts();