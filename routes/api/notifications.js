import express from "express";
const app = express();
const chatRouter = express.Router();
import bodyParser from "body-parser";
import Chat from "../../schemas/Chat.js";
import User from "../../schemas/User.js";
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
chatRouter.get("/", async (req, res, next) => {
  Chat.find({
    users: { $elemMatch: { $eq: req.session.user._id } },
  })
    .populate("users")
    .populate("lastestMessage")
    .sort({ updatedAt: -1 })
    .then(async (results) => {
      results = await User.populate(results, { path: "lastestMessage.sender" });
      res.status(200).send(results);
    })
    .catch((err) => {
      console.log(err);
    });
});

export default chatRouter;
