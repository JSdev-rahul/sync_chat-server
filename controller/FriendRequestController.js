import mongoose from "mongoose";
import FriendRequest from "../models/friendsRequestModel.js";
import Friends from "../models/friendsModel.js";
import User from "../models/userModel.js";
const FriendRequestController = {
  fetchAllFriendRequest: async (req, res) => {
    try {
      const { userId } = req.params;
      const { status } = req.query;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const matchCriteria = {
        receiverId: new mongoose.Types.ObjectId(userId),
        status,
      };

      const allFriendRequest = await FriendRequest.aggregate([
        { $match: matchCriteria },
        {
          $lookup: {
            from: "users",
            localField: "senderId",
            foreignField: "_id",
            as: "friendRequestDetails",
          },
        },
        {
          $unwind: "$friendRequestDetails",
        },
        {
          $project: {
            _id: 1,
            status: 1,
            createdAt: 1,
            friendRequestDetails: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              avatar: 1,
              email: 1,
              profileSetup: 1,
            },
          },
        },
      ]);
      res.status(200).json({ data: allFriendRequest });
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  updateFriendRequestStatus: async (req, res) => {
    try {
      const { friendRequestId } = req.params;
      const { status } = req.body; // Assuming status is passed in the request body (e.g., "accept", "decline")

      if (!status || !["accept", "decline", "pending"].includes(status)) {
        return res.status(400).json({ message: "Invalid status provided" });
      }

      const updateRequestData = await FriendRequest.findByIdAndUpdate(
        friendRequestId,
        { status },
        { new: true }
      );

      if (!updateRequestData) {
        return res.status(404).json({ message: "Friend request not found" });
      }

      // Send success response
      res.status(200).json({
        message: `Friend request has been decline successfully`,
      });
    } catch (error) {
      console.error("Error updating friend request status:", error);

      // Send error response
      res.status(500).json({
        message: "An error occurred while updating the friend request status",
      });
    }
  },
  acceptFriendRequest: async (req, res) => {
    try {
      const { userId, friends } = req.body;

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

        return res.status(200).json({
          message: "Friends added successfully",
          friends: friendsList.friends,
        });
      } else {
        // Create a new friends list
        friendsList = await Friends.create({ userId, friends });

        return res.status(201).json({
          message: "Friends list created and friends added successfully",
          friends: friendsList.friends,
        });
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
  },
};
export default FriendRequestController;
