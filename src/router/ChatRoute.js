const router = require("express").Router();
const chatController = require("../controller/ChatController.js");

router.post("/access", chatController.accessChat);
router.get("/:userId", chatController.getUserChats);
router.get("/messages/:chatId", chatController.getMessages);
router.post("/message", chatController.sendMessage);

module.exports = router;
