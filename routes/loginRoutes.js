import express from "express";
const app = express();
const router = express.Router();
import User from "../schemas/User.js";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.set("view engine", "pug");
app.set("views", "views");
router.get("/", (req, res, next) => {
  res.status(200).render("login");
});
router.post("/", async (req, res, next) => {
  const payload = req.body;
  if (req.body.logUserName && req.body.logpassword) {
    const user = await User.findOne({
      username: req.body.logUserName,
    }).catch((err) => {
      payload.errorMessage = "Something went wrong.";
      res.status(200).render("login", payload);
    });
    if (user) {
      let result = await bcrypt.compare(req.body.logpassword, user.password);
      if (result) {
        req.session.user = user;
        return res.redirect("/");
      }
    }

    payload.errorMessage = "wrong credentials Try again";
    return res.status(200).render("login", payload);
  }
  payload.errorMessage = "make sure field has a correct value";
  res.status(200).render("login");
});
export default router;
