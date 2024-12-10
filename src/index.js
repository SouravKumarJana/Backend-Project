//require('dotenv').config({path: './.env'})                  //always at first file import the .env file , to give the acess the .env file to all other  file
import dotenv from "dotenv"
import connectDB from "./db/index.js"
import {app} from "./app.js"

dotenv.config({
    path: './.env'
})


connectDB()                                        //for creating connection with databse , call connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000), ()=>{
        console.log(`server running at port : ${process.env.PORT}`)
    }
})
.catch((error)=>{
    console.log("Mongo Db cinnection is failed !!!", error)
})





/*
import express from "express"
const app = express()

(async () =>{                                                              //use iffy function (for function define and execute together)
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)      //connect the mongo db
       app.on("error" , (error)=>{                                          // this is checking express is working or not
        console.log("ERRR : ",error);
        throw error;
       })

       app.listen(process.env.PORT , ()=>{
        console.log(`App is listening on port ${process.env.PORT}`)
       })
    } catch (error) {
        console.log("ERROR: ",error)
        throw error
    }
})()
*/    