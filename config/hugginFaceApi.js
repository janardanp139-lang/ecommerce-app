import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";
dotenv.config()
const huggingFaceApi = new HfInference(process.env.HF_API_KEY)
export default huggingFaceApi