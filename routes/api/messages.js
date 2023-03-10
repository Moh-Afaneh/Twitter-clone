import express from "express";
const app = express();
const messageApiRouter = express.Router();
import bodyParser from "body-parser";
import Message from "../../schemas/Message.js";
import Chat from "../../schemas/Chat.js";
import User from "../../schemas/User.js";
import userRouter from "./users.js";
import Notification from "../../schemas/Notifications.js";
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
messageApiRouter.post("/", async (req, res, next) => {
  try {
    if (!req.body.content || !req.body.chatId) {
      res.sendStatus(400);
    }
    const newMessage = {
      sender: req.session.user._id,
      content: req.body.content,
      chat: req.body.chatId,
    };
    let messageCreated = await Message.create(newMessage);
    messageCreated = await Message.populate(messageCreated, { path: "sender" });
    messageCreated = await Message.populate(messageCreated, { path: "chat" });
    messageCreated = await User.populate(messageCreated, {
      path: "chat.users",
    });
    let chat = await Chat.findByIdAndUpdate(req.body.chatId, {
      lastestMessage: messageCreated,
    });
    res.status(201).send(messageCreated);
  } catch (error) {
    console.log(error);
  }
});
function insertNotification(chat, message) {
  chat.users.forEach((userId) => {
    if (userId == message.sender._id.toString()) return;
    Notification.insertNotification(
      userId,
      message.sender._id,
      "New message",
      message.chat._id
    );
  });
}
export default messageApiRouter;
