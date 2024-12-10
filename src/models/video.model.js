import mongoose, {Schema} from "mongoose"
import mongooseAggrigatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new Schema(
    {
        videoFile:{
            type: String,     //cloudinary url
            required: true
        },
        thumbanil:{
            type: String,      //cloudinary url
            required: true
        },
        title:{
            type: String,
            required: true
        },
        description:{
            type: String,
            required: true
        },
        duration:{
            type: Number,     // duration of the video extract from cloudnary after uploaded file at cloudinary
            required: true
        },
        views:{
            type: Number,
            default: 0
        },
        isPublished:{
            type: Boolean,
            default: true
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    }, {timestamps: true}
)

videoSchema.plugin(mongooseAggrigatePaginate)

export const Video = mongoose.model("Video", videoSchema);