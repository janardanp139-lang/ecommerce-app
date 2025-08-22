import mongoose from "mongoose";
import huggingFaceApi from "../config/hugginFaceApi.js";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A product must have name"]
    },
    actualPrice: Number,
    discount: Number,
    finalPrice: Number,
    inStock: Number,
    rating: Number,
    description: String,
    availableSize: String,
    features: String,
    category: String,
    featuredProduct: {
        type: Boolean,
        default: false
    },
    images: [{
        url: String,
        public_id: String
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }],
    vector: {
        type: [Number],
        select: false,
        default: [],
        validate: {
            validator: function(v) {
                return v.length === 384 || v.length === 0
            },
            message: "Vector must be either empty or 384-dimensional"
        }
    }
});

productSchema.pre("validate", async function(next) {
    if (this.isModified("description") || this.isModified("name") || this.isModified("category")) {
        try {
            const name = this.name || "";
            const description = this.description || "";
            const category = this.category || "";
            const embeddingText = `name:${name} description: ${description} category: ${category}`;

            // Check if API is available
            const response = await fetch('https://api-inference.huggingface.co/status');
            if (!response.ok) {
                console.warn("Hugging Face API unavailable - proceeding without vector");
                return next();
            }

            const embeddings = await huggingFaceApi.featureExtraction({
                model: "sentence-transformers/all-MiniLM-L6-v2",
                inputs: embeddingText,
            });

            if (!embeddings || embeddings.length !== 384) {
                throw new Error("Invalid embeddings received");
            }

            this.vector = embeddings;
        } catch (error) {
            console.error("Hugging Face embedding failed:", error.message);
            this.vector = []; // Set empty array instead of failing
        }
    }
    next();
});

productSchema.pre("save", function(next) {
    if (this.isModified("discount") || this.isModified("actualPrice")) {
        this.finalPrice = Math.round(this.actualPrice - (this.actualPrice * this.discount) / 100);
    }
    next();
});

// Add retry mechanism for failed embeddings
productSchema.methods.generateEmbedding = async function() {
    try {
        const embeddingText = `name:${this.name} description: ${this.description} category: ${this.category}`;
        const embeddings = await huggingFaceApi.featureExtraction({
            model: "sentence-transformers/all-MiniLM-L6-v2",
            inputs: embeddingText,
        });

        if (embeddings?.length === 384) {
            this.vector = embeddings;
            await this.save();
        }
    } catch (error) {
        console.error("Retry embedding generation failed:", error.message);
    }
};

const Product = mongoose.model("Products", productSchema);
export default Product;