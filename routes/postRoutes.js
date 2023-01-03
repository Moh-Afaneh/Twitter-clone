import express from "express";
const app = express();
const router = express.Router();
import bodyParser from "body-parser";
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
router.get("/:id", (req, res, next) => {
  let payload = {
    pageTitle: "View post",
    userLoggedIn: req.session.user,
    userLoggedInClient: JSON.stringify(req.session.user),
    posts: req.body.content,
    postId: req.params.id,
  };
  res.status(200).render("postPage", payload);
});

export default router;
