import User from "../models/userModel.js";

const UserController = {
  searchUser: async (req, res) => {
    try {
      const { q = "", limit = 0 } = req.query;

      const searchQuery = new RegExp(q, "i"); // 'i' for case-insensitive

      const users = await User.aggregate([
        {
          $match: {
            $or: [
              { profileSetup: true },
              { firstName: { $regex: searchQuery } },
              { lastName: { $regex: searchQuery } },
              { email: { $regex: searchQuery } },
            ],
          },
        },
        {
          $limit: parseInt(limit),
        },
        {
          $project: {
            id: "$_id",
            name: "$firstName",
            lname: "$lastName",
            email: "$email",
            // avatar:"$avatar"
          },
        },
      ]);
      return res.status(200).json({ data: users });
    } catch (error) {}
  },
};

export default UserController;
