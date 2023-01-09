import mongoose, { Schema } from "mongoose";
const schema = mongoose.Schema;
const notificationSchema = new schema(
  {
    userTo: { type: Schema.Types.ObjectId, ref: "User" },
    userForm: { type: Schema.Types.ObjectId, ref: "User" },
    notificationType: String,
    opened: { type: Boolean, default: false },
    entityId: Schema.Types.ObjectId,
  },
  { timestamps: true }
);
notificationSchema.statics.insertNotification = async (
  userTo,
  userForm,
  notificationType,
  entityId
) => {
  const data = {
    userTo,
    userForm,
    notificationType,
    entityId,
  };
  await Notification.deleteOne(data).catch((err) => console.log(err));
  return Notification.create(data);
};
const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
