import express from "express";
const app = express();
const userRouter = express.Router();
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import User from "../../schemas/User.js";
import fs from "fs";
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
const __dirname = path.resolve();
const upload = multer({ dest: "uploads/" });
userRouter.get("/", async (req, res, next) => {
  try {
    let searchObj = req.query;
    if (req.query.search !== undefined) {
      searchObj = {
        $or: [
          { firstname: { $regex: req.query.search, $options: "i" } },
          { lastname: { $regex: req.query.search, $options: "i" } },
          { username: { $regex: req.query.search, $options: "i" } },
        ],
      };
    }
    const results = await User.find(searchObj);
    if (results == null) {
      throw new Error("No user was found");
    }
    res.status(200).send(results);
  } catch (error) {
    throw new Error(error);
  }
});
userRouter.post(
  "/coverPhoto",
  upload.single("croppedImage"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        throw new Error("No files.");
      }
      const filePath = `/uploads/images/${req.file.filename}.png`;
      const tempFile = req.file.path;
      const targetPath = path.join(__dirname, `./${filePath}`);
      fs.rename(tempFile, targetPath, (error) => {
        if (!error) {
          res.status(400);
        }
      });
      req.session.user = await User.findByIdAndUpdate(
        req.session.user._id,
        { CoverPic: filePath },
        { new: true }
      );
      res.status(204).send("uploaded");
    } catch (error) {
      throw new Error(error);
    }
  }
);
userRouter.post(
  "/profilePicture",
  upload.single("croppedImage"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        throw new Error("No files.");
      }
      const filePath = `/uploads/images/${req.file.filename}.png`;
      const tempFile = req.file.path;
      const targetPath = path.join(__dirname, `./${filePath}`);
      fs.rename(tempFile, targetPath, (error) => {
        if (!error) {
          res.status(400);
        }
      });
      req.session.user = await User.findByIdAndUpdate(
        req.session.user._id,
        { profilePic: filePath },
        { new: true }
      );
      res.status(204).send("uploaded");
    } catch (error) {
      throw new Error(error);
    }
  }
);
userRouter.get("/:userId/followers", async (req, res, next) => {
  try {
    const id = req.params.userId;
    const userFound = await User.findById(id).populate("followers");
    if (userFound == null) {
      throw new Error("No user was found");
    }
    res.status(200).send(userFound);
  } catch (error) {
    throw new Error(error);
  }
});
userRouter.get("/:userId/following", async (req, res, next) => {
  try {
    const id = req.params.userId;
    const userFound = await User.findById(id).populate("following");
    if (userFound == null) {
      throw new Error("No user was found");
    }
    res.status(200).send(userFound);
  } catch (error) {
    throw new Error(error);
  }
});
userRouter.put("/:userId/follow", async (req, res, next) => {
  try {
    const id = req.params.userId;
    const user = await User.findById(id);
    if (user == null) {
      throw new Error("No user was found");
    }
    const isFollowing =
      user.followers && user.followers.includes(req.session.user._id);
    const option = isFollowing ? "$pull" : "$addToSet";
    req.session.user = await User.findByIdAndUpdate(
      req.session.user._id,
      {
        [option]: { following: id },
      },
      { new: true }
    );
    await User.findByIdAndUpdate(id, {
      [option]: { followers: req.session.user._id },
    });
    res.status(200).send(req.session.user);
  } catch (error) {
    throw new Error(error);
  }
});
export default userRouter;
