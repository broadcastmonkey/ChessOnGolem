const socketIO = require("socket.io"); // sock

var commonEmitter = require("./commonEvents").commonEmitter;

class ChessSocketServer {
  users = [];

  getUserBySocketId = (socketId) => {
    return this.users.find((user) => user.id === socketId);
  };
  addUser = ({ id }) => {
    const existingUser = this.users.find((user) => user.id === user.id);
    if (existingUser) {
      return { error: `socket ${id} is already connected` };
    }
    const user = { id, lastPing: 0 };
    this.users.push(user);
    return { user };
  };
  usersCount = () => uthis.sers.length;
  removeUser = (id) => {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex !== -1) {
      return this.users.splice(userIndex, 1)[0];
    }
  };

  constructor(app, server) {
    this.io = socketIO(server);

    this.io.on("connection", (socket) => {
      console.log("[n]   new client...");

      socket.on("join", (param, callback) => {
        this.handleJoin(socket, param, callback);
      });

      socket.on("sendEvent", (message, callback) => {
        handleEventMessage(socket, message, callback);
      });
      socket.on("disconnect", () => {
        this.handleDisconnect(socket);
      });
    });
  }

  sendChessMove = (move) => {
    console.log("sending move... " + move);
    this.io.to("chess").emit("moveEvent", { move });
  };

  handleJoin = async (socket, param, callback) => {
    const isLogged = this.getUserBySocketId(socket.id);
    if (isLogged) {
      console.log(
        "handleJoin",
        "user withc socket id: " + socket.id + " already exists..."
      );
    }

    console.log("adding user : ", socket.id);

    const { error, user } = this.addUser({ id: socket.id });

    if (error) return callback ? callback({ error: "error 2" }) : null;

    console.log("user added", user);
    socket.join("chess");
    // if (callback) callback(room); // obj: successfuly joined ?
  };

  handleDisconnect = (socket) => {
    console.log("disconnected socket... trying to remove user fom Users Array");
    const user = this.removeUser(socket.id);
    if (user) {
      console.log("login of disconnected user", user.id);
    } else {
      console.log("disconnected socket was not registered in Users Array");
    }
  };
}

module.exports = ChessSocketServer;
