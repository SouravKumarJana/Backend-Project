import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser} from "../controllers/user.controller.js"
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

router.route("refresh-token").post(verifyJWT, refreshAccessToken)


export default router;