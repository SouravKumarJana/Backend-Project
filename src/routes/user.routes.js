import { Router } from "express";
import { registerUser} from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js";


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
    registerUser)                  //register the new user 


export default router;