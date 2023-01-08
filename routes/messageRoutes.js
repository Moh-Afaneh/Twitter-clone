import express from "express";
const app = express();
const router = express.Router();
import Chat from "../schemas/Chat.js";
import User from "../schemas/User.js";
import bodyParser from "body-parser";
import mongoose from "mongoose";
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
router.get("/", (req, res, next) => {
  res.status(200).render("inboxPage", {
    pageTitle: "Inbox",
    userLoggedIn: req.session.user,
    userLoggedInClient: JSON.stringify(req.session.user),
  });
});
router.get("/new", (req, res, next) => {
  res.status(200).render("newMessage", {
    pageTitle: "New message",
    userLoggedIn: req.session.user,
    userLoggedInClient: JSON.stringify(req.session.user),
  });
});
router.get("/:chatId", async (req, res, next) => {
  try {
    let userId = req.session.user._id;
    let chatId = req.params.chatId;
    let isvalidId = mongoose.isValidObjectId(chatId);
    let payload = {
      pageTitle: "Chat",
      userLoggedIn: req.session.user,
      userLoggedInClient: JSON.stringify(req.session.user),
    };
    if (!isvalidId) {
      let error = "Chat Id is invalid";
      throw new Error(error);
    }
    let chat = await Chat.findOne({
      _id: chatId,
      users: { $elemMatch: { $eq: userId } },
    }).populate("users");

    if (chat === null) {
      const userFound = await User.findById(chatId);
      if (userFound !== null) {
        chat = await getChatByUserId(userFound._id, userId);
      }
    }
    if (chat === null) {
      payload.errorMessage =
        "Chat does not exist or you do not have permission to view it ";
      throw new Error(payload.errorMessage);
    } else {
      payload.chat = chat;
    }
    res.status(200).render("chatPage", payload);
  } catch (error) {
    let payload = { errorMessage: error };
    res.render("errorPage", payload);
  }
});
function getChatByUserId(userLoggedInID, OtheUserID) {
  return Chat.findOneAndUpdate(
    {
      isChatGroup: false,
      users: {
        $size: 2,
        $all: [
          { $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInID) } },
          { $elemMatch: { $eq: mongoose.Types.ObjectId(OtheUserID) } },
        ],
      },
    },
    {
      $setOnInsert: {
        users: [userLoggedInID, OtheUserID],
      },
    },
    {
      new: true,
      upsert: true,
    }
  ).populate("users");
}
export default router;
