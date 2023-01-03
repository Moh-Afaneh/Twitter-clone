import express from "express";
const app = express();
const router = express.Router();
import bodyParser from "body-parser";
import User from "../schemas/User.js";
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
router.get("/", (req, res, next) => {
  let payload = {
    pageTitle: req.session.user.username,
    userLoggedIn: req.session.user,
    userLoggedInClient: JSON.stringify(req.session.user),
    profileUser: req.session.user,
  };
  res.status(200).render("profilePage", payload);
});
router.get("/:username", async (req, res, next) => {
  try {
    const payload = await getPayload(req.params.username, req.session.user);
    res.status(200).render("profilePage", payload);
  } catch (err) {
    let payload = {
      message: "No user was found",
    };
    res.status(404).render("errorPage", payload);
  }
});
router.get("/:username/replies", async (req, res, next) => {
  try {
    const payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = "replies";
    res.status(200).render("profilePage", payload);
  } catch (err) {
    let payload = {
      message: "No user was found",
    };
    res.status(404).render("errorPage", payload);
  }
});
router.get("/:username/following", async (req, res, next) => {
  try {
    const payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = "following";
    res.status(200).render("followers&following", payload);
  } catch (err) {
    let payload = {
      message: "No user was found",
    };
    res.status(404).render("errorPage", payload);
  }
});
router.get("/:username/followers", async (req, res, next) => {
  try {
    const payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = "followers";
    res.status(200).render("followers&following", payload);
  } catch (err) {
    let payload = {
      message: "No user was found",
    };
    res.status(404).render("errorPage", payload);
  }
});
async function getPayload(username, userLoggedIn) {
  try {
    let user = await User.findOne({ username: username });
    if (!user) {
      user = await User.findById(username);
      if (!user) throw new Error(err);
    }
    return {
      pageTitle: user.username,
      userLoggedIn: userLoggedIn,
      userLoggedInClient: JSON.stringify(userLoggedIn),
      profileUser: user,
    };
  } catch (err) {
    throw new Error(err);
  }
}
export default router;
