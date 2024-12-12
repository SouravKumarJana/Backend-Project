import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))                           //This configeration is used for take text formate    // when we config something we generally used use                  
app.use(express.urlencoded({extended: true, limit:"16kb"}))     //This configeration is used for understanding the url  and take data from url 
app.use(express.static("public"))                              //This configeration is used for tempurary file store  . Here public is a folder name
app.use(cookieParser())                                       // it is the middleware of cookie , it is use for access the cookie and set data at cookie


//routes import
import userRouter from "./routes/user.routes.js"

//routes declaration
app.use("/api/v1/users" , userRouter)
                                           

export { app }