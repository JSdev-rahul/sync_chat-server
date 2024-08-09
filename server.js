import express from "express";
import { Server as socketIo } from "socket.io";
import dotenv from "dotenv";
import Message from "./models/messageModel.js"; // Adjust path as needed

dotenv.config();

const app = express();
let io;
let userSockets = {};
const socketServer = (server) => {
  io = new socketIo(server, {
    cors: {
      origin: "*", // Allow all origins (replace "*" with your client's origin if needed)
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
    },
  });

 

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSockets[userId] = socket.id;
      console.log(`User ${userId} connected with socket ID ${socket.id}`);
    }

    // Listen for new messages
    socket.on("sendMessage", async (message) => {
      console.log("message", message);
      console.log(`Received message: ${message.content} from user ${userId}`);

      const { receiverId, content, messageType = "text" } = message;

      // Save message to the database
      try {
        const newMessage = new Message({
          senderId: userId,
          receiverId: receiverId,
          messageType,
          content,
        });
        const resp = await newMessage.save();
        // Emit message to the receiver
        const receiverSocketId = userSockets[receiverId];
        const senderSocketId = userSockets[userId];
        if (receiverSocketId || senderSocketId) {
          const messageData = { ...resp._doc };

          if (receiverSocketId) {
            io.to(receiverSocketId).emit("receiveMessage", messageData);
          }

          // Emit to sender if connected
          if (senderSocketId) {
            io.to(senderSocketId).emit("receiveMessage", messageData);
          }
        } else {
          console.error(`Receiver with ID ${receiverId} not connected`);
        }
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    // Listen for request to load all messages
    socket.on("loadMessages", async ({ receiverId }) => {
      const userId = socket.handshake.query.userId;

      try {
        const messages = await Message.find({
          $or: [
            { senderId: userId, receiverId: receiverId },
            { senderId: receiverId, receiverId: userId },
          ],
        }).sort({ createdAt: 1 });

        socket.emit("allMessages", messages);
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    });

    // Listen to delete messages
    const handleDeleteMessage = async (messageId, updateData) => {
      const resp = await Message.findByIdAndUpdate(messageId, updateData, {
        new: true,
      });
      if (resp) {
        const receiverId = resp.receiverId;
        const receiverSocketId = userSockets[receiverId];
        const senderSocketId = userSockets[resp.senderId];

        if (receiverSocketId) {
          io.to(receiverSocketId).emit("messageDeleteResponse", resp);
        }
        if (senderSocketId) {
          io.to(senderSocketId).emit("messageDeleteResponse", resp);
        }
      }
    };

    socket.on("deleteSentMessage", ({ messageId }) => {
      handleDeleteMessage(messageId, {
        content: "message deleted",
        isDeletedBySender: true,
      });
    });

    socket.on("deleteReceivedMessage", ({ messageId }) => {
      handleDeleteMessage(messageId, {
        isDeletedByReceiver: true,
      });
    });

    socket.on("editMessage", async ({ updatedMessage }) => {
      console.log("updatedMessage", updatedMessage);
      const { _id, content, senderId, receiverId } = updatedMessage;
      const resp = await Message.findByIdAndUpdate(
        _id,
        {
          content,
          isEdited: true,
        },
        {
          new: true,
        }
      );

      if (resp) {
        const receiverId = resp.receiverId;
        const receiverSocketId = userSockets[receiverId];
        const senderSocketId = userSockets[resp.senderId];

        if (receiverSocketId) {
          io.to(receiverSocketId).emit("editMessageResponse", resp);
        }
        if (senderSocketId) {
          io.to(senderSocketId).emit("editMessageResponse", resp);
        }
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of Object.entries(userSockets)) {
        if (socketId === socket.id) {
          delete userSockets[userId];
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  app.get("/", (req, res) => {
    res.send("Socket.io Server");
  });
};

export { socketServer, io,userSockets };

