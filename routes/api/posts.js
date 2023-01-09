import express from "express";
import bodyParser from "body-parser";
import Post from "../../schemas/Posts.js";
import User from "../../schemas/User.js";
import Notification from "../../schemas/Notifications.js";
const app = express();
const router = express.Router();
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.set("view engine", "pug");
app.set("views", "views");
router.get("/", async (req, res, next) => {
  const searchObject = req.query;
  if (searchObject.isReply !== undefined) {
    const isReply = searchObject.isReply == "true";
    searchObject.replyTo = { $exists: isReply };
    delete searchObject.isReply;
  }
  if (searchObject.search !== undefined) {
    searchObject.content = { $regex: searchObject.search, $options: "i" };

    delete searchObject.search;
  }
  if (searchObject.followingOnly !== undefined) {
    const isFollowing = searchObject.followingOnly == "true";
    if (isFollowing) {
      const objectIds = [];
      if (!req.session.user.following) {
        req.session.user.following = [];
      }
      req.session.user.following.forEach((user) => {
        objectIds.push(user);
      });
      objectIds.push(req.session.user._id);
      searchObject.postedBy = { $in: objectIds };
    }
    delete searchObject.isFollowing;
  }
  const results = await getPosts(searchObject);
  res.status(200).send(results);
});
router.put("/:id", async (req, res, next) => {
  const id = req.params.id;
  if (req.body.pinned !== undefined) {
    await Post.updateMany(
      { postedBy: req.session.user },
      { pinned: false }
    ).catch((err) => {
      res.sendStatus(400).send(err);
    });
  }
  Post.findByIdAndUpdate(id, req.body)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      res.sendStatus(400);
    });
});
router.delete("/:id", async (req, res, next) => {
  const id = req.params.id;
  Post.findByIdAndDelete(id)
    .then(() => {
      res.sendStatus(202);
    })
    .catch((err) => {
      res.sendStatus(400);
    });
});
router.get("/:id", async (req, res, next) => {
  try {
    const postId = req.params.id;
    let postData = await getPosts({ _id: postId });
    postData = postData[0];
    const results = {
      postData: postData,
    };
    if (postData.replyTo !== undefined) {
      results.replyTo = postData.replyTo;
    }
    results.replies = await getPosts({ replyTo: postId });
    res.status(200).send(results);
  } catch (error) {}
});
router.post("/", async (req, res, next) => {
  if (!req.body.content) {
    return res.sendStatus(401);
  }
  const postData = {
    content: req.body.content,
    postedBy: req.session.user,
  };
  if (req.body.replyTo) {
    postData.replyTo = req.body.replyTo;
  }
  Post.create(postData)
    .then(async (data) => {
      data = await User.populate(data, { path: "postedBy" });
      data = await Post.populate(data, { path: "replyTo" });
      if (data.replyTo !== undefined) {
        await Notification.insertNotification(
          data.replyTo.postedBy,
          req.session.user._id,
          "reply",
          data._id
        );
      }
      res.status(201).send(data);
    })
    .catch((err) => {});
});
router.put("/:id/like", async (req, res, next) => {
  const PostId = req.params.id;
  const userId = req.session.user._id;
  const isLiked =
    req.session.user.likes && req.session.user.likes.includes(PostId);
  const option = isLiked ? "$pull" : "$addToSet";
  req.session.user = await User.findByIdAndUpdate(
    userId,
    {
      [option]: { likes: PostId },
    },
    { new: true }
  ).catch((err) => {
    res.sendStatus(400);
  });
  const post = await Post.findByIdAndUpdate(
    PostId,
    {
      [option]: { likes: userId },
    },
    { new: true }
  ).catch((err) => {
    res.sendStatus(400);
  });
  if (!isLiked) {
    await Notification.insertNotification(
      post.postedBy,
      userId,
      "like",
      post._id
    );
  }
  res.status(200).send(post);
});
router.post("/:id/retweet", async (req, res, next) => {
  const PostId = req.params.id;
  const userId = req.session?.user?._id;
  // try and delete retweet
  const deletedPost = await Post.findOneAndDelete({
    postedBy: userId,
    retweetsData: PostId,
  }).catch((err) => {
    res.sendStatus(400);
  });
  const option = deletedPost !== null ? "$pull" : "$addToSet";
  let repost = deletedPost;
  if (repost == null) {
    repost = await Post.create({ postedBy: userId, retweetsData: PostId });
  }
  req.session.user = await User.findByIdAndUpdate(
    userId,
    {
      [option]: { retweets: repost?._id },
    },
    { new: true }
  ).catch((err) => {
    res.sendStatus(400);
  });
  const post = await Post.findByIdAndUpdate(
    PostId,
    {
      [option]: { retweetsUsers: userId },
    },
    { new: true }
  ).catch((err) => {
    res.sendStatus(400);
  });
  if (!deletedPost) {
    await Notification.insertNotification(
      post.postedBy,
      userId,
      "retweet",
      post._id
    );
  }
  res.status(200).send(post);
});
async function getPosts(fitler) {
  let results = await Post.find(fitler)
    .populate("postedBy")
    .populate("retweetsData")
    .populate("replyTo")
    .sort({ createdAt: -1 })
    .catch((err) => console.log(err));
  results = User.populate(results, { path: "replyTo.postedBy" });
  return User.populate(results, { path: "retweetsData.postedBy" });
}

export default router;
