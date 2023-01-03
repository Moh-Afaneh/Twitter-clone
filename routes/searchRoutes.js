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
  let payload = createPayload(req.session.user);
  res.status(200).render("searchPage", payload);
});
router.get("/:selectedTab", (req, res, next) => {
  let payload = createPayload(req.session.user);
  payload.selectedTab = req.params.selectedTab;
  res.status(200).render("searchPage", payload);
});
function createPayload(userLoggedIn) {
  return {
    pageTitle: "search",
    userLoggedIn: userLoggedIn,
    userLoggedInClient: JSON.stringify(userLoggedIn),
  };
}
export default router;
