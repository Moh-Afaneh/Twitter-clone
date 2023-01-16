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
    const searchObj = {
      userTo: req.session.user._id,
      notificationType: { $ne: "New message" },
      userForm: { $ne: req.session.user._id },
    };
    if (req.query.unreadOnly !== undefined && req.query.unreadOnly === "true") {
      searchObj.opened = false;
    }

    const foundNotification = await Notification.find(searchObj)
      .populate("userTo")
      .populate("userForm")
      .sort({ createdAt: -1 });
    res.status(200).send(foundNotification);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});
notificationsRouter.get("/lastest", async (req, res, next) => {
  try {
    const foundNotification = await Notification.findOne({
      userTo: req.session.user._id,
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
    await Notification.findByIdAndUpdate(id, { opened: true });
    res.status(204).send("updated");
  } catch (error) {
    res.sendStatus(400);
  }
});

notificationsRouter.put("/markAsOpened", async (req, res, next) => {
  try {
    const id = req.params.id;
    await Notification.updateMany(
      { userTo: req.session.user._id },
      { opened: true }
    );
    res.status(204).send("updated");
  } catch (error) {
    res.sendStatus(400);
  }
});

export default notificationsRouter;
