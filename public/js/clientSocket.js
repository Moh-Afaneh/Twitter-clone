let connected = false;
let socket = io("http://localhost:3000");
socket.emit("setup", user);
