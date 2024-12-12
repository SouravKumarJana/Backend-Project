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

export const Subscription = mongoose.model("Subscription", subscriptionSchema)

