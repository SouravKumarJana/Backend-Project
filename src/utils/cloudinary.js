import { v2 as cloudinary } from 'cloudinary';
import fs from "fs" ;                                //fs : is the file_system of node js, which help to handle the file


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath , {             //if localFilePath is exist then upload the file at cloudinary
            resource_type: "auto"
        })
        console.log("file is uploadded at cloudinary", response.url);                   //File has been successfully uploadded
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath)     //remove the localy saved temporary file as the upload operation got failed
    }
}

export {uploadOnCloudinary}



