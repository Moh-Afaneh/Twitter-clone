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
socket.on("notification received", (notification) => {
  console.log("Connected two");
  $.get("/api/notifications/lastest", (notificationData) => {
    refreshNotificationsBagde();
  });
});
function emitNotification(userId) {
  console.log(user);
  if (user._id !== userId) {
    return;
  }
  socket.emit("notification received", userId);
}
