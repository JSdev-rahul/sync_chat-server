import Message from '../models/messageModel.js';

export const saveMessage = async (message) => {
  const { senderId, receiverId, content, messageType = 'text' } = message;
  try {
    const newMessage = new Message({
      senderId,
      receiverId,
      messageType,
      content,
    });
    return await newMessage.save();
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

export const loadMessages = async (userId, receiverId) => {
  try {
    return await Message.find({
      $or: [
        { senderId: userId, receiverId: receiverId },
        { senderId: receiverId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });
  } catch (error) {
    console.error('Error loading messages:', error);
    throw error;
  }
};

export const deleteMessage = async (messageId) => {
  try {
    return await Message.findByIdAndUpdate(
      messageId,
      {
        content: 'Message deleted by user',
        isDeleted: true,
      },
      { new: true }
    );
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

export const deleteMessageById = async (messageId) => {
  try {
    return await Message.findByIdAndDelete(messageId);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};
