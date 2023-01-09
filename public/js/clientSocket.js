let connected = false;
let socket = io("http://localhost:3000");
socket.emit("setup", user);
socket.on("connected", () => {
  connected = true;
});
socket.on("messageReceived", (message) => {
  console.log(message);
  messageReceived(message);
});
