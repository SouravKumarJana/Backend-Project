import { Router } from "express";
    import { changeCurrentPassword, 
            getCurrentUser, 
            getUserChannelProfile, 
            getWatchHistory, 
            loginUser, 
            logoutUser, 
            refreshAccessToken, 
            registerUser, 
            updateAccountDetails, 
            updateUserAvatar, 
            updateUserCoverImage} from "../controllers/user.controller.js"

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

//http://localhost:8000//api/v1/users/register

router.route("/register").post(
    upload.fields([                // before register we put a middleware to uplode the file at local storage         
        {
            name: "avatar",      
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser        //register the new user 
)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT, logoutUser)    // before executed "logoutUser" method , executed the middleware "verifyJWT"
                                                       // because for logout authentication is nedded

router.route("/refresh-token").post(verifyJWT, refreshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/update-account-details").patch(verifyJWT, updateAccountDetails)  // Here instade of "post" we use "patch" , Because: if you post then it update the all field & if ypu ptch then it update the particuler field

router.route("/update-avatar").patch(verifyJWT, upload.single("avatar") , updateUserAvatar)

router.route("/update-coverImage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/channel/:username").get(verifyJWT, getUserChannelProfile)       //at getUserChannelProfile we get "username" from req.params (means from url) .so here routes should be "/something/:username"  

router.route("/watch-hitory").get(verifyJWT, getWatchHistory)

export default router;