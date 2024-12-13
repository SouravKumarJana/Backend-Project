import mongoose, {Schema} from "mongoosse";

const subscriptionSchema = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId,     // one who is subscribing  // He or she is also a user
            ref: "User"
        },
        channel:{
            type: Schema.Types.ObjectId,    // one whom subscribers are subscribing // He or she is also a user
            ref: "User"
        }
    }, {timestamps: true}
)

//Here , we try to create the  documents /collections  where two fields are present at every document , 
/*
    1. channel: where store the user._id of the channel
    2. subscriber: Where store the user._id of the user who subscribe the channel
*/

// if you find the number of subscriber of a channel, then count the documents which channel === user id of the user (this channel id)
// if you want to find a user subscribe how many channel , then count the documents which subscriber === user id of this user

export const Subscription = mongoose.model("Subscription", subscriptionSchema)

