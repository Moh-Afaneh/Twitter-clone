let connected = false;
let socket = io("http://localhost:3000");
socket.emit("setup", user);
socket.on("connected", () => {
  console.log("Connected");
  connected = true;
});
socket.on("messageReceived", (message) => {
  console.log(message);
  messageReceived(message);
});
socket.on("notificationReceived", () => {
  $.get("/api/notifications/lastest", (notificationData) => {
    toastNotification(notificationData);
    refreshNotificationsBagde();
  });
});
function emitNotification(userId) {
  if (user._id == userId) {
    return;
  }
  socket.emit("notificationReceived", userId);
}
