import mongoose, { Schema } from "mongoose";
const schema = mongoose.Schema;
const PostSchema = new schema(
  {
    content: { type: String, trim: true },
    postedBy: { type: Schema.Types.ObjectId, ref: "User" },
    pinned: Boolean,
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    retweetsUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    retweetsData: { type: Schema.Types.ObjectId, ref: "Post" },
    replyTo: { type: Schema.Types.ObjectId, ref: "Post" },
    Pinned: Boolean,
  },
  { timestamps: true }
);
const Post = mongoose.model("Post", PostSchema);
export default Post;
