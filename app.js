import database from "./database.js";
import express from "express";
import * as dotenv from "dotenv";
import requireLogin from "./middleware/middleware.js";
import loginRouter from "./routes/loginRoutes.js";
import logoutRouter from "./routes/logoutRoutes.js";
import postApiRouter from "./routes/api/posts.js";
import postRouter from "./routes/postRoutes.js";
import profileRouter from "./routes/profileRoutes.js";
import uploadRouter from "./routes/uploadRoutes.js";
import messagesRouter from "./routes/messageRoutes.js";
import registerRouter from "./routes/registerRoutes.js";
import searchRouter from "./routes/searchRoutes.js";
import bodyParser from "body-parser";
import session from "express-session";
import favicon from "serve-favicon";
import path from "path";
import userRouter from "./routes/api/users.js";
import chatRouter from "./routes/api/chats.js";
import messageApiRouter from "./routes/api/messages.js";
import { Server } from "socket.io";

dotenv.config();
const app = express();
app.set("view engine", "pug");
app.set("views", "views");
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "n#J6@4ONfo.k|<A$Td)Z_Bn)0Z:;}_",
    resave: true,
    saveUninitialized: false,
  })
);
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`listening to ${port} right now`);
});
app.use(favicon(__dirname + "/public/images/twitter.png"));
//api
app.use("/api/messages", messageApiRouter);
app.use("/api/users", userRouter);
app.use("/api/chats", chatRouter);
app.use("/api/posts", postApiRouter);
//api
app.use("/search", requireLogin, searchRouter);
app.use("/uploads", uploadRouter);
app.use("/messages", requireLogin, messagesRouter);
app.use("/profile", requireLogin, profileRouter);
app.use("/posts", requireLogin, postRouter);
app.use("/logout", logoutRouter);
app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.get("/", requireLogin, (req, res, next) => {
  let payload = {
    pageTitle: "Home",
    userLoggedIn: req.session.user,
    userLoggedInClient: JSON.stringify(req.session.user),
    posts: req.body.content,
  };
  res.status(200).render("home", payload);
});
//last 404 page
app.get("*", (req, res) => res.render("errorPage"));
const io = new Server(server);
io.on("connection", (socket) => {
  socket.on("setup", (userdata) => {
    socket.join(userdata._id);
    socket.emit("connected");
  });
  socket.on("join room", (chatId) => socket.join(chatId));
  socket.on("typing", (chatId) => socket.in(chatId).emit("typing"));
  socket.on("stop typing", (chatId) => socket.in(chatId).emit("stop typing"));

  // Real time messages
  socket.on("send message", (message) => {
    const chat = message.chat;
    if (!chat.users) return console.log("Chat.users is undefined");
    chat.users.forEach((user) => {
      if (user._id === message.sender._id) return;
      console.log(user._id);
      socket.in(user._id).emit("messageReceived", message);
    });
  });
});
