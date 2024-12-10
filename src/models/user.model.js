import mongoose , {Schema} from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true           // index makes the username field as searchable field
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        fullname:{
            type: String,
            required: true,
            lowercase: true,
            index: true
        },
        avatar:{
            type: String,        //cloudinary url
            required: true
        },
        coverImage:{
            type: String         //cloudinary url
        },
        watchHistory:[
            {
                type: Schema.Types.ObjectId,
                ref: "video"
            }
        ],
        password:{
            type: String,
            required: [true, "password is required"]
        },
        refreshToken:{
            type: String
        }

    },{timestamps: true}
)

userSchema.pre("save", async function (next){            // Here we use "pre" hooks , before save the passwod at database , we want to execute the middleware(Here encrypt the password)  // encryption take time so we use async-await
    if(this.isModified("password")){
        this.password = bcrypt.hash(this.password, 10)     // encrypt the password // Here we encrypt password when any change occured in password field...Here 10 number of round (salting and then hassing)
        next()
    }
    else{
        return next()
    }
})

userSchema.methods.isPasswordCorrect = async function (password) {    // user define hooks   // it is for check authentication   // Here we cant use arrow function because arrow function cant access "this" keyword
    return await bcrypt.compare (password , this.password)            // it compare the user-given password(plane text) and encrypted(it fetch from database)  //Here "password": is user given password ,and "this.password" : encrypted password
}

userSchema.methods.generateAcessToken = function (){      //generate access token (payload , accessToken_secret ,expiryTime)
    return jwt.sign(
        {
            _id : this._id,
            username : this.username,
            email : this.email,
            fullname : this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id : this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema);