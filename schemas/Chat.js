import mongoose, { Schema } from "mongoose";
const schema = mongoose.Schema;
const chatSchema = new schema(
  {
    chatName: { type: String, trim: true },
    isChatGroup: { type: Boolean, default: false },
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    lastestMessage: [{ type: Schema.Types.ObjectId, ref: "Message" }],
  },
  { timestamps: true }
);
const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
