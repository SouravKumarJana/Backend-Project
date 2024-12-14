import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {APIResponse} from "../utils/APIResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

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

const changeCurrentPassword = asyncHandler(async (req, res) => {
    
    const {oldPassword, newPassword, confirmPassword} = req.body

    const user = await User.findById(req.user?._id)       // Here user want to change password , means it is sure that user is "logged in" , 
                                                //so auth.middleware.js is already executed (when the user was login) .so at req.user ,the all data of this user is present
    if(newPassword!== confirmPassword) {
        throw new APIError(401, "comfirm password not matched with new password")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)   // cheack the old password (that given by the user) is matched with the password that saved at dataBase

    if(!isPasswordCorrect) {
        throw APIError(400, "Invalid old password")
    }
    
    user.password= newPassword                       // if password matched
    await user.save({validateBeforeSave: false})     // save the new password at database // at database always save the encrypted password , 
                                                     //because : if you see the-> user.model.js ; here at "save" section of password always a hooks is called using "pre" (in the hook we encrypt the password using bcrypt before saving)

    return res.status(200)
    .json(
        new APIResponse(200, {}, "password change successfully")
    )
})


const getCurrentUser = asyncHandler( async (req, res) =>{
    return res.status(200)
    .json(
        new APIResponse(200, req.user, "Current User fetched Successfully") 
    )                                                                        //For to get currentUser,  user should logged in so , from req.user of auth.miidleware.js , we can get user 
})

const updateAccountDetails = asyncHandler( async (req, res) =>{
    const {fullname, email} = req.body 

    if(!fullname || !email){
        throw new APIError(400, "all fields are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname: fullname,
                email: email
            }
        },
        {new: true}
    ).select("-password")     // remove password field (because we dont want to password at response)

    return res.status(200)
    .json(
        new APIResponse(200, user, "account details update successfully" )
    )
})


const updateUserAvatar = asyncHandler(async (req, res) =>{
    const avatarLocalPath = req.file?.path                   // take the new avatar image that user gives  .. Actually req.file comes from multer (multer.middleware)

    if(!avatarLocalPath){
        throw new APIError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new APIError(400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(         // it find by the id and then update and save
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200)
    .json(
        new APIResponse(200, user, "avatar is successfully updated")
    )
})

const updateUserCoverImage = asyncHandler( async (req, res) =>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw APIError(400, "coverImage file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new APIError(400, "Error while uploading on coverImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200)
    .json(
        new APIResponse(200, user, "coverImage is successfully updated")
    )
})


const getUserChannelProfile = asyncHandler(async(req, res)=>{  //Here we want to see the other channel profile
    const {username} = req.params            // actually when we click the channel link , then through the link we can see the channel profile

    if(!username.trim()) {
        throw new APIError(400, "username is missing")
    }

    const channel = await User.aggregate([                          //*****  the all code of aggrigation-pipeline not go through mongoose , it goes to MongoDb directly
        {
            $match:{
                username: username?.toLowerCase()     // it gives the only one collection -> that is the user(channel) which profile we wnat to see
            }
        },
        {
            $lookup: {                                      // join Subscription model with User model  
                from: "subscriptions",                     // "Subscription" model save at mongoDb as "subscriptions"
                localField: "_id",
                foreignField: "channel",             // if you want subscriber then see the documants where channel(channel_id)=== user_id
                as: "subscribers"                    //Here create a array named subscribers where store the documents, where  _id === channel
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",          // if you want the users which are subscribe by user (which profile we want to see) , then see the documents where user_id === subscriber (subscriber_id)
                as: "subscribedTo"                   //Here create a array named subscribedTo where store the documents, where _id === subscriber (subscriber-id)
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size: "$subscribers"
                },
                
                channelSubscribedCount: {
                    $size:"$subscribedTo"
                },
                isSubscribed: {               // Here we try to cheack , I (means the user who want to see the channel profile of other user ) subscribe or not the channel
                    $cond:{
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]} ,  // the user (who want see the profile) surely is logged-in , so the req.user is means you (the user who want to see) 
                                                                                //  your id is present or not in subscribes of user (which profile you want to see)
                        then: true,                                             // if present return true , else return false
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelSubscribedCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    if(!channel?.length){
        throw new APIError(404, "Channel does not exist")
    }
    return res.status(200)
    .json(
        new APIResponse(200, channel[0] , "User channel fetched successfully")
    )
})


const getWatchHistory = asyncHandler( async(req, res) =>{
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)      // req.user._id : it gives the String (like-> '12bdhceb2382') , Here want MongoDb id (like-> ObjectId('12bdhceb2382'))  because the aggrigation pipeline code directly go to mongoose not go through mongoose
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline:[                              // create a neasted pipeline
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [                // neasted pipeline
                                {
                                    $project: {        // under pipline we use $projecte, so it projected at under owner field
                                        fullname: 1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{                     //Here we override the existing owner field
                                $first: "$owner"       // give the owner as object 
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200)
    .json(
        new APIResponse(
            200, 
            user[0].watchHistory,
            "Watch history fetch successfully" 
        )
    )
})


export {   
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}