import express from "express";
import bodyParser from "body-parser";
import { catchAsync } from "catch-async-express";
import bcrypt from "bcrypt";
import User from "../schemas/User.js";
const app = express();
const router = express.Router();
app.set("view engine", "pug");
app.set("views", "views");
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
router.get("/", (req, res, next) => {
  res.status(200).render("register");
});
router.post(
  "/",
  catchAsync(async (req, res, next) => {
    const firstname = req.body.firstname.trim();
    const lastname = req.body.lastname.trim();
    const username = req.body.username.trim();
    const email = req.body.email.trim();
    const password = req.body.password;
    const passwordConf = req.body.passwordConf;
    const payload = req.body;
    if (firstname && lastname && email && username) {
      const user = await User.findOne({
        $or: [{ username: username, email: email }],
      }).catch((err) => {
        payload.errorMessage = "Something went wrong.";
        res.status(200).render("register", payload);
      });
      if (!user) {
        //no user Found
        const data = req.body;
        data.password = await bcrypt.hash(password, 10);
        const user = await User.create(data);
        req.session.user = user;
        res.redirect("/");
      } else {
        if (email === user.email) {
          payload.errorMessage = "Email already exists";
        } else {
          payload.errorMessage = "User already exists";
        }
        res.status(200).render("register", payload);
      }
    } else {
      payload.errorMessage = "Make sure each field has a valid value.";
      res.status(200).render("register", payload);
    }
  })
);
export default router;
