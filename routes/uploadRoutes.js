import express from "express";
const app = express();
const router = express.Router();
import path from "path";
import bodyParser from "body-parser";
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
router.get("/images/:path", (req, res, next) => {
  const __dirname = path.resolve();
  const file = path.join(__dirname, `./uploads/images/${req.params.path}`);
  res.sendFile(file);
});
export default router;
