import mongoose from "mongoose";
const currencyRateSchema = new mongoose.Schema({
    inrRate:{
        type:Number,
        required:true
    },
    updateAt:{
        type:Date,
        default:Date.now
    }
})
const CurrencyRate = mongoose.model("currencyRate",currencyRateSchema)
export default CurrencyRate