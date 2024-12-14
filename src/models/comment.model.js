import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
// multiple comment present in a video , so it is not possible to show the all comment in a time
// So, we can use "mongoose-aggregate-paginate-v2" to reload or go to next to see the all comment

const commentSchema = new Schema(
    {
        content:{
            type: String,
            required: true,
        }
    },
    {
        video:{
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {timestamps: true}
)

commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.Model("Comment", commentSchema)