import { compare } from "bcrypt";
import User from "../models/userModel.js";
import { generateTokens } from "../services/tokenService.js";
import fs from "fs";

import path from "path";
const AuthController = {
  signUp: async (req, res) => {
    try {
      console.log(req.body);
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Email is already in use" });
      } else {
        const newUser = await User.create({ email, password });
        newUser.password = undefined;
        return res.status(201).json({ user: newUser });
      }
    } catch (error) {
      console.error("Error during user signup:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  logIn: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate request body
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return res
          .status(404)
          .json({ message: "User not found with given email" });
      }

      // Compare passwords
      const isPasswordMatch = await compare(password, existingUser.password);
      if (!isPasswordMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // Remove password before sending response
      existingUser.password = undefined;

      // genrate token for authetication of api
      const { accessToken, refreshToken } = await generateTokens(existingUser);
      // Send success response
      return res
        .status(200)
        .json({ data: existingUser, accessToken, refreshToken });
    } catch (error) {
      console.error("Error during user login:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  setUserProfile: async (req, res) => {
    try {
      const { originalname, path: tempPath } = req.file;
      const ext = path.extname(originalname); // Get file extension
      const newPath = `${tempPath}${ext}`; // Correct path with extension

      // Rename file
      fs.rename(tempPath, newPath, (err) => {
        if (err) {
          console.error("Error renaming file:", err);
          return res.status(500).json({ message: "Error processing file" });
        }
      });

      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const avatarUrl = `/uploads/${path.basename(newPath)}`;
      console.log(avatarUrl);
      const result = await User.findOneAndUpdate(
        { email }, // Correctly formatted query
        {
          ...req.body,
          profileSetup: true,
          avatar: avatarUrl,
        },
        {
          new: true,
        }
      );

      if (!result) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({ data: result });
    } catch (error) {
      console.error("Error updating user profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};

export default AuthController;
