import express from "express";
const app = express();
const notificationsRouter = express.Router();
import bodyParser from "body-parser";
import Notification from "../../schemas/Notifications.js";
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
notificationsRouter.get("/", async (req, res, next) => {
  try {
    const foundNotification = await Notification.find({
      userTo: req.session.user._id,
      notificationType: { $ne: "New message" },
    })
      .populate("userTo")
      .populate("userForm")
      .sort({ createdAt: -1 });
    res.status(200).send(foundNotification);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});
notificationsRouter.put("/:id/markAsOpened", async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log(id);
    await Notification.findByIdAndUpdate(id, { opened: true });
    res.status(204).send("updated");
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

notificationsRouter.put("/markAsOpened", async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log(id);
    await Notification.updateMany(
      { userTo: req.session.user._id },
      { opened: true }
    );
    res.status(204).send("updated");
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

export default notificationsRouter;
