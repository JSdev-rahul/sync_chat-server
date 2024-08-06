import mongoose from "mongoose";
import bcrypt, { hash } from "bcrypt";
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "email requiredd"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "password requiredd"],
    trim: true,
  },
  firstName: {
    type: String,
    required: false,
    trim: true,
  },
  lastName: {
    type: String,
    required: false,
    trim: true,
  },
  avatar: {
    type: String,
    required: false,
  },
  color: {
    type: Number,
    required: false,
  },
  profileSetup: {
    type: Boolean,
    default: false,
  },
});

// Pre-save hook to hash the password
userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
      this.password = await bcrypt.hash(this.password, salt); // Hash the password with the salt
    }
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", userSchema);
export default User;
