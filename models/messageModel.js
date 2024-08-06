import mongoose from "mongoose";
// Define the enum for message types
const messageTypes = {
  TEXT: "text",
  FILE: "file",
};

// Create the message schema
const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messageType: {
    type: String,
    enum: [messageTypes.TEXT, messageTypes.FILE],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  isDeletedBySender: {
    type: Boolean,
    default: false,
  },
  isDeletedByReceiver: {
    type: Boolean,
    default: false,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the message model
const Message = mongoose.model("Message", messageSchema);

export default Message;
