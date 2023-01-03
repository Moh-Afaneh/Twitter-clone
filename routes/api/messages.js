import express from "express";
const app = express();
const messageApiRouter = express.Router();
import bodyParser from "body-parser";
import Message from "../../schemas/Message.js";
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
messageApiRouter.post("/", async (req, res, next) => {
  try {
    if (!req.body.content || !req.body.chatId) {
      console.log("invalid data passed to request");
      res.sendStatus(400);
    }
    const newMessage = {
      sender: req.session.user._id,
      content: req.body.content,
      chat: req.body.chatId,
    };
    const messageCreated = await Message.create(newMessage);
    res.status(201).send(messageCreated);
  } catch (error) {
    throw new Error(error);
  }
});

export default messageApiRouter;
