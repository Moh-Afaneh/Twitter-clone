import express from "express";
const app = express();
const notificationsRoutes = express.Router();
import Chat from "../schemas/Chat.js";
import User from "../schemas/User.js";
import bodyParser from "body-parser";
import mongoose from "mongoose";
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
notificationsRoutes.get("/", (req, res, next) => {
  res.status(200).render("notificationsPage", {
    pageTitle: "Notifications",
    userLoggedIn: req.session.user,
    userLoggedInClient: JSON.stringify(req.session.user),
  });
});

export default notificationsRoutes;
