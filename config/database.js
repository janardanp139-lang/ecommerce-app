import mongoose from "mongoose";
export default async function connectDB() {
    try {
      await mongoose.connect(process.env.DATABASE_URI)
      console.log("database connected...")
    } catch (err) {
        console.log(err,"error connection database💥💥💥")
    }
}