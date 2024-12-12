import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {APIResponse} from "../utils/APIResponse.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens = async (userId) =>{       //See this method at time of login function
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAcessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken              // we want to store the refresh token at database of this user, because when the access token is expired, the refresh token is required to generate a new access token 
        await user.save({ validateBeforeSave: false})   //save the accessToken in database, but when we do "save" operation the whole "User model" will be triggered , for this to do save password (or validation) is needed, To avoid the validation here we use "validateBeforSave : false "" 
        
        return {accessToken, refreshToken}           // return the access and refresh token
    
    } catch (error) {
        throw APIError(500, "something went wrong while generating refresh and access Token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    //get user details from frontend
    //validation - not empty the field
    //check if user alredy exists : username, email  ..if alredy exist then route at login  . if not exist then follow the below step
    //check for images, check for avatar
    //if images & avatar is present then upload them at cloudinary
    //create user object(because accepted object) - create entry in db
    //remove password and refresh token field from response because we dont want to give password to user
    //check for user creation
    //if user successfully created then return response
    
    const {fullname, email, username, password} = req.body      //from frontend the data comes through req.body
    //console.log("email :", email);
    //console.log(req.body);

    if(
        [fullname, username, email, password].some((field) =>       //Here using "some" we can check all field. if any field is empty , then it return "true"... Means "some" work "and" operator that apply at all field
        field?.trim() === "")
    ) {
        throw new APIError(400, "all fields are required for register")
    }
    
    const existedUser = await User.findOne({            //Now checck the user is already exist or not
        $or: [{username}, {email}]                 //$or : comes from mongoose , it is like normal "or" operator
    })
    if(existedUser) {
        throw new APIError(409, "user is email or username is already exist")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;   //it gives local-path of avatar (that store at temp file by multer)
    
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }


    if (!avatarLocalPath) {                                     // avatr file is mandatory for register
        throw new APIError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);         // uploading at coludinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new APIError (400, "Avatar file is required")
    }

    const user = await User.create({      //at database (at "User" mongoose model) store the data
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),

    })

    //Now try to send Response .But we dont want to send "password" and "refreshToken" at response 

    const createUser = await User.findById(user._id).select(
        "-password -refreshToken"                             // at select we write -password and -refreshToken : so password and refreshToken is not iclude at "createUser"        
    )

    if(!createUser) {
        throw new APIError(500, "something went wrong while registring the user")
    }

    return res.status(201).json(
        new APIResponse(200, createUser, "User register successfully" )
    )

})

const loginUser = asyncHandler(async (req, res) =>{
    //take data from req.body 
    //username or email
    //find the user from data base
    //generate access token and refresh token
    //send cookie
    //send response

    const {email, username, password} = req.body
    console.log(email)
    if(!username && !email){
        throw new APIError(400, "username or email is required")
    }
    const user = await User.findOne({
        $or: [{username}, {email}]                  //find from database either username or email
    })

    if(!user){
        throw new APIError(404, "user does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)  // Here we pass the password which is given from req.body (this password is given by user for login)

    if(!isPasswordValid){
        throw new APIError(401, "password not matched")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select(     //actually we want to send the response without password and refreshToken field, so Here we remove the password and refreshToken field
        "-password -refreshToken"
    )
    
    //set the tokens at cookie
    const options = {
        httpOnly: true,          // we only modify the cookie at server cant modify at frontend
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)      // set accessToken at cookie
    .cookie("refreshToken", refreshToken, options)    // set refreshToken at cookie
    .json(
        new APIResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken      //we set access and refresh token at cookie ,yet why we send this token at APIResponse ?    
                                                                   //because : if at any cause (at mobile application cookies are not set) user want to save the Tokens at local storage
            },
            "User logged in successfully"
        )
    )

})

const logoutUser = asyncHandler( async (req, res) => {
    //find the user
    // clear its cookie
    //remove its refresh token from database
    User.findByIdAndUpdate(
        req.user._id,                           // find by user id  // it comes from auth.middle.js
        {
            $unset: {                                    
                refreshToken: 1                  // remove the refresh token from database
            }
        },
        {
            new : true                          
        }
    )
    
    const options = {
        httpOnly: true,         
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)         // clear accessToken from cookie
    .clearCookie("refreshToken", options)        // clear refreshToken from cookie 
    .json(
        new APIResponse(200, {}, "User logged out")
    )

})

const refreshAccessToken = asyncHandler( async (req, res) =>{      // after expiry the accessToken, Try to get the new accessToken from refreshToken
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    
    if(!incommingRefreshToken) {
        throw new APIError(401, "unathorized request")
    }

    try {
        const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)  // if incommingRefresh token is found
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new APIError(401, "Refresh Token not found")
        }
    
        if(incommingRefreshToken !== user?.refreshToken) {        //if user found, then check the incommingRfreshToken that come from req.body is same or not with the refreshToken that saved at database of the user 
            throw new APIError(401, "Refres Token is expired or used")
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)       // generate new access token and new refresh token using old refreshToken
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            200,
            {accessToken, refreshToken: newRefreshToken},
            "Access Token refreshed successfully"
    
        )
    } catch (error) {
        throw new APIError(401, error?.message || "Invalied refresh Token")
    }

})


export {registerUser , loginUser, logoutUser, refreshAccessToken}