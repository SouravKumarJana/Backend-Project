import mongoose, {Schema} from "mongoose";


const likeSchema = new Schema(
    {
        video:{                                             //if you like video
            type: Schema.Types.ObjectId,
            ref: "Video"     
        },
        Comment:{                                           // if you liked the comment
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        tweet:{                                             // if you liked the tweet
            type: Schema.Types.ObjectId,
            ref: "Tweet"
        },
        likedBy:{
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    },{timestamps: true}
)

export const Like = mongoose.model("Like",likeSchema)