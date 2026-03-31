const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");

// Create or get chat between two users
exports.accessChat = async (req, res) => {
  const { senderId, receiverId } = req.body;

  let chat = await Chat.findOne({ members: { $all: [senderId, receiverId] } });
  if (!chat) {
    chat = await Chat.create({ members: [senderId, receiverId] });
  }
  chat = await chat.populate("members", "-password");
  res.status(200).json(chat);
};

// Fetch user chats
exports.getUserChats = async (req, res) => {
  const userId = req.params.userId;
  const chats = await Chat.find({ members: userId })
    .populate("members", "-password")
    .populate({ path: "lastMessage", populate: { path: "sender", select: "name email" } })
    .sort({ updatedAt: -1 });
  res.status(200).json(chats);
};

// Send message
exports.sendMessage = async (req, res) => {
  const { chatId, senderId, text, attachments } = req.body;
  const message = await Message.create({ chat: chatId, sender: senderId, text, attachments });
  
  await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });
  const populatedMsg = await message.populate("sender", "name email");
  
  res.status(201).json(populatedMsg);
};

// Fetch messages of a chat
exports.getMessages = async (req, res) => {
  const chatId = req.params.chatId;
  const messages = await Message.find({ chat: chatId }).populate("sender", "name email avatar").sort({ createdAt: 1 });
  res.status(200).json(messages);
};
