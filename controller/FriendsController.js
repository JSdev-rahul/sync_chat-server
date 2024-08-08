import mongoose from "mongoose";
import Friends from "../models/friendsModel.js";
import User from "../models/userModel.js";
import FriendRequest from "../models/friendsRequestModel.js";

const FriendsController = {
  addFriend: async (req, res) => {
    try {
      const { userId, friends } = req.body;

      const exitFriend = await Friends.findOne({
        userId,
      });
      const isExist = exitFriend?.friends?.some(
        (item) =>
          item.toString() === new mongoose.Types.ObjectId(friends[0]).toString()
      );
      if (isExist) {
        return res.status(200).json({
          message: "user already in your friend list",
        });
      }
      // Check if the user exists
      const existingUser = await User.findById(userId);

      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Fetch existing friends list for the user
      let friendsList = await Friends.findOne({ userId });

      if (friendsList) {
        // Update existing friends list
        const newFriends = new Set([
          ...friendsList.friends.map((friend) => friend.toString()),
          ...friends,
        ]);
        friendsList.friends = Array.from(newFriends);
        await friendsList.save();
      } else {
        // Create a new friends list
        friendsList = await Friends.create({ userId, friends });
        await friendsList.save();
      }
      // update exitsiting FR collection
      const updateStatusOfFriendRequest = await FriendRequest.findOneAndUpdate(
        {
          senderId: new mongoose.Types.ObjectId(friends[0]),
        },
        {
          status: "accepet",
        },
        {
          new: true,
        }
      );
      console.log("updateStatusOfFriendRequest",updateStatusOfFriendRequest);

      const isAlreadyInFriendList = await Friends.find({ userId: friends[0] });

      if (isAlreadyInFriendList.length <= 0) {
        const isfriendRequestAlreadyAvailable = await FriendRequest.find({
          senderId: userId,
        });

        if (isfriendRequestAlreadyAvailable.length <= 0) {
          const newFriendRequest = await FriendRequest.create({
            senderId: userId,
            receiverId: friends[0],
            status: "pending",
          });

          await newFriendRequest.save();
        }
      }

      // Create a new friend request

      return res.status(200).json({
        message: "Friends added successfully",
        friends: friendsList.friends,
      });
    } catch (error) {
      console.error("Error adding friends:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
  },
  getFriendsList: async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 5 } = req.query;

      console.log(page, limit);
      // Fetch the user's friends list
      const friendsList = await Friends.aggregate([
        {
          $match: { userId: new mongoose.Types.ObjectId(userId) },
        },

        {
          $unwind: "$friends",
        },
        {
          $skip: parseInt(page) * parseInt(limit) - parseInt(limit),
        },
        {
          $limit: parseInt(limit),
        },
        {
          $lookup: {
            from: "users", // The name of the User collection
            localField: "friends", // Field from the Friends collection
            foreignField: "_id", // Field from the User collection
            as: "friendDetails",
          },
        },
        {
          $unwind: "$friendDetails",
        },
        {
          $project: {
            _id: 0, // Exclude the default _id if not needed in the output
            userId: 1,
            friends: 1,
            friendDetails: {
              _id: 1, // Include _id of friendDetails
              profileSetup: 1,
              email: 1, // Include profileSetup of friendDetails
              firstName: 1,
              lastName: 1,
              avatar: 1,
            },
          },
        },
      ]);

      res.status(200).json({ data: friendsList });
    } catch (error) {
      console.error("Error getting friends list:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
  },
};
export default FriendsController;
