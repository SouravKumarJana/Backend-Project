import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import {APIError} from "../utils/APIError.js"
import {User} from "../models/user.model.js"

// Here we create Authrization middle-ware

export const verifyJWT = asyncHandler( async (req, res, next) =>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")  //See explaination below  
        
        // Here we for check authorization , we try to access the "accessToken" that generated at "login" time.
        // we can access the the accessToken from cookies (because we set accessToken at cookies at login time)
        //In some case the cookies (at mobile application) is not present , then at "Authorization" of Header ( Authorization:Bearer <token> )
        //-the token is present, so in this case to get this token we replase "Bearer " with empty String ("") 
        
        if(!token) {
            throw new APIError(401, "unathorized request")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)    //below          
        //if acessToken is present, now try to get the decodded data(the data which are put at time generate access token) 
        // to see tha data of accessToken -> See generateAccessToken() at user.model.js
        
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )
    
        if(!user){
            throw new APIError(401, "Invalid Access Token")
        }
    
        req.user = user       //Here create a object of req named as "user" and assign all data of user
        next()                // after checking authorizaton , we go to next execution
    
    } catch (error) {
        throw new APIError(401, error?.message || "Invalid Access Token")
    }

})