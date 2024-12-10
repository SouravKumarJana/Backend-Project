import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {APIResponse} from "../utils/APIResponse.js"

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
    console.log("email :", email);

    if(
        [fullname, username, email, password].some((field) =>       //Here using "some" we can check all field. if any field is empty , then it return "true"... Means "some" work "and" operator that apply at all field
        field?.trim() === "")
    ) {
        throw new APIError(400, "all fields are required for register")
    }
    
    const existedUser = User.findOne({            //Now checck the user is already exist or not
        $or: [{username}, {email}]               //$or : comes from mongoose , it is like normal "or" operator
    })
    if(existedUser) {
        throw new APIError(409, "user is email or username is already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;   //it gives local-path of avatar (that store at temp file by multer)
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

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
        username: username.toLowerCase()

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


export {registerUser}