import mongoose from "mongoose";

const FriendsListSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      isBlock: {
        type: Boolean,
        default: false,
      },
    },
  ],
  // You can also include additional fields like status, timestamps, etc.
});

const Friends = mongoose.model("Friends", FriendsListSchema);
export default Friends;
