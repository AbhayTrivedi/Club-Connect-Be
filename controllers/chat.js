
export default (http) => {
   const io = require("socket.io")(http, {
      cors: {
         origin: ["http://localhost:3000"],
      },
   });

   io.on("connection", (socket) => {
      // console.log(socket.id);
      socket.on("send-message", (message) => {

         socket.broadcast.emit("receive-message", message);
      });
   });
};
