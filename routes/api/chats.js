import express from "express";
const app = express();
const chatRouter = express.Router();
import bodyParser from "body-parser";
import Chat from "../../schemas/Chat.js";
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
chatRouter.get("/", async (req, res, next) => {
  try {
    const foundChat = await Chat.find({
      users: { $elemMatch: { $eq: req.session.user._id } },
    })
      .sort({ updatedAt: -1 })
      .populate("users");
    res.status(200).send(foundChat);
  } catch (error) {
    throw new Error(error);
  }
});
chatRouter.get("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    const foundChat = await Chat.findOne({
      _id: id,
      users: { $elemMatch: { $eq: req.session.user._id } },
    }).populate("users");
    if (!foundChat) {
      throw new Error("You are not apart of this chat");
    }
    res.status(200).send(foundChat);
  } catch (error) {
    let payload = { errorMessage: error };
    res.render("errorPage", payload);
  }
});
chatRouter.post("/", async (req, res, next) => {
  try {
    let usersChat = req.body.users;
    let userLoggedIn = req.session.user;
    if (!usersChat) {
      throw new Error("Users param not sent with request");
    }
    usersChat = JSON.parse(usersChat);
    if (usersChat.length === 0) {
      throw new Error("Users array is empty");
    }
    usersChat.push(userLoggedIn);
    const chatData = {
      users: usersChat,
      isChatGroup: true,
    };
    const chat = await Chat.create(chatData);
    res.status(200).send(chat);
  } catch (error) {
    let payload = { errorMessage: error };
    res.render("errorPage", payload);
  }
});
chatRouter.put("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;
    if (!id) {
      throw new Error("invalid id or no id ");
    }
    await Chat.findByIdAndUpdate(id, req.body);
    res.sendStatus(204);
  } catch (error) {
    let payload = { errorMessage: error };
    res.sendStatus(400);
  }
});

export default chatRouter;
