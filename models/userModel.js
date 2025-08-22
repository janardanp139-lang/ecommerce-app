import mongoose from "mongoose";
import bcrypt from "bcryptjs"
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"A user should have a name."]
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    password:{
        type:String,
        select:false,
        required:[true,"Password is required"],
    },
    profileImage:{
        url:{
            type:String,
            default:"https://res.cloudinary.com/dy5s9hgoa/image/upload/v1740895975/ShoppyX/Users/ndcuvtpn9uhiuxxsxnyr.png",
            // required:true
        },
        public_id:{
            type:String,
            default:"ShoppyX/Users/default_profile_image"
            // required:true
        }
    },
    email:{
        type:String,
        unique:true,
        required:[true,"User should have a email id"]
    },
    contactNo:{
        type:Number,
        required:[true,"User should have a Contact No."]
    },
    address:{
        area:{
            type:String,
            required:function(){
                return this.role==="user"
            }
        },
        city:{
            type:String,
            required:function(){
                return this.role==="user"
            }
        },
        state:{
            type:String,
            required:function(){
                return this.role==="user"
            }
        },
        country:{
            type:String,
            required:function(){
                return this.role==="user"
            }
        },
        postalCode:{
            type:Number,
            required:function(){
                return this.role==="user"
            }
        }
    },
    cart:[
        {
            productId:{type: mongoose.Schema.Types.ObjectId},
            name:String,
            size:{
                type:String,
                default:null
            },
            image:String,
            price:Number,
            quantity:{type:Number,min:1,default:1}
        }
    ],
    cartAmount:{
        type:Number,
        default:0
    },
    orders:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order"
    }]
},{timestamps:true})

userSchema.pre("save",async function (next){
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password,12)
    next()
})

userSchema.methods.checkPassword=async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password)
}

const User = mongoose.model("User",userSchema)
export default User