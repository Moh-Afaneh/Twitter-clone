import express from "express";
const app = express();
const router = express.Router();
import bodyParser from "body-parser";
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.set("view engine", "pug");
app.set("views", "views");
router.get("/", (req, res, next) => {
  if (req.session) {
    req.session.destroy(() => {
      res.redirect("/login");
    });
  }
});

export default router;
