import CurrencyRate from "../models/currencyRateModel.js";

export async function createCurrencyRate(req,res,next){
    try {
      const {currentInr} = req.body
      if(!currentInr)
        return res.status(404).json({
            status:"failed",
            message:"field is required"
        })
        const data = await CurrencyRate.create({inrRate:currentInr})
        return res.status(200).json({
            status:"success",
            message:"Rate added successfully",
            data
        })
    } catch (err) {
        next(err)
    }
}
export async function updateCurrencyRate(req,res,next){
    try {
      const {currentInr} = req.body
      if(!currentInr)
        return res.status(404).json({
            status:"failed",
            message:"field is required"
        })
        let data = await CurrencyRate.findOne()
        if(!data){
            data = await CurrencyRate.create({inrRate:currentInr})
        }else{
            data.inrRate=currentInr
            data.updateAt = Date.now()
            await data.save()
        }
        return res.status(200).json({
            status:"success",
            message:"Rate updated successfully",
            data
        })
    } catch (err) {
        next(err)
    }
}
export async function getCurrencyRate(req,res,next){
    try {
        let data = await CurrencyRate.findOne()
        if(!data){
            return res.status(404).json({
                status:"failed",
                message:"Rate not set"
            })
        }
        return res.status(200).json({
            status:"success",
            data
        })
    } catch (err) {
        next(err)
    }
}