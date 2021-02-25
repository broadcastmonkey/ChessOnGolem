const socketIO = require("socket.io"); // sock

var commonEmitter = require("../event-emitter");

class ChessSocketServer {
    users = [];

    lastPosition = "start";
    lastMoveData = null;
    lastMoves = {};

    gameFinishedWinner = "";
    gameFinishedType = "";

    getUserBySocketId = (socketId) => {
        return this.users.find((user) => user.id === socketId);
    };
    addUser = ({ id }) => {
        const existingUser = this.users.find((user) => user.id === id);
        if (existingUser) {
            console.log("user already exists...");
            console.log(existingUser);
            return { error: `socket ${id} is already connected` };
        }
        const user = { id, lastPing: 0 };
        this.users.push(user);
        return { user };
    };
    usersCount = () => this.users.length;
    removeUser = (id) => {
        const userIndex = this.users.findIndex((user) => user.id === id);
        if (userIndex !== -1) {
            return this.users.splice(userIndex, 1)[0];
        }
    };

    constructor(server) {
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
            socket.on("adminEvent", (message, callback) => {
                this.handleAdminEventMessage(socket, message, callback);
            });
        });
    }

    currentTurn = (turnData) => {
        this.lastMoveData = turnData;
        // console.log(">>>>>>>>>>>> sending current turn data ... " + turnData);
        this.io.to("chess").emit("currentTurnEvent", turnData);
    };

    providerFailed = (provider) => {
        // console.log(">>>>>>>>>>>> sending provider failed ... " + provider);
        this.io.to("chess").emit("providerFailed", provider);
    };

    computationStarted = (taskId) => {
        //console.log(">>>>>>>>>>>> sending computation started ... " + taskId);
        this.io.to("chess").emit("computationStarted", taskId);
    };
    sendMovesList = (moves) => {
        //console.log(">>>>>>>>>>>> sending computation started ... " + taskId);
        this.io.to("chess").emit("movesRefreshed", moves);
        this.lastMoves = moves;
    };
    gameFinished = (game) => {
        this.gameFinishedWinner = game.winner;
        this.gameFinishedType = game.type;
        //console.log(">>>>>>>>>>>> sending game finished ... " + taskId);
        this.io.to("chess").emit("gameFinished", game);
    };
    offersReceived = (data) => {
        console.log(
            ">>>>>>>>>>>> taskId: " + data.taskId + "sending offers received  " + data.offersCount,
        );
        //true && console.log(JSON.stringify(data, null, 4));
        this.io.to("chess").emit("offersReceived", data);
    };

    agreementCreated = (agreement) => {
        // console.log(">>>>>>>>>>>> sending agreement created ... " + agreement);
        this.io.to("chess").emit("agreementCreated", agreement);
    };
    agreementConfirmed = (agreement) => {
        // console.log(">>>>>>>>>>>> sending agreement confirmed ... " + agreement);
        this.io.to("chess").emit("agreementConfirmed", agreement);
    };
    computationFinished = (computation) => {
        console.log(">>>>>>>>>>>> sending computation finished ... " + computation);
        this.io.to("chess").emit("computationFinished", computation);
    };
    invoiceReceived = (invoice) => {
        // console.log(">>>>>>>>>>>> sending computation finished ... " + computation);
        this.io.to("chess").emit("invoiceReceived", invoice);
    };

    sendChessMove = (move) => {
        // console.log(">>>>>>>>>>>> sending move... " + move);
        this.io.to("chess").emit("moveEvent", move);
    };

    sendChessPosition = (fen) => {
        this.lastPosition = fen;
        // console.log(">>>>>>>>>>>> sending position... " + fen);
        this.io.to("chess").emit("positionEvent", { fen });
    };
    handleAdminEventMessage = (socket, message, callback) => {
        console.log("adminEvent", message);

        if (message.eventName == "killServer") {
            process.exit(0);
        }

        if (callback) callback(); // obj: successfuly joined ?
    };

    handleJoin = async (socket, param, callback) => {
        const isLogged = this.getUserBySocketId(socket.id);
        if (isLogged) {
            console.log("handleJoin", "user withc socket id: " + socket.id + " already exists...");
        }

        console.log("adding user : ", socket.id);

        const { error, user } = this.addUser({ id: socket.id });

        if (error) return callback ? callback({ error: "error 2" }) : null;

        console.log("user added", user);
        socket.join("chess");
        this.io.to("chess").emit("positionEvent", { fen: this.lastPosition });
        if (this.lastMoveData !== null)
            this.io.to("chess").emit("currentTurnEvent", this.lastMoveData);
        this.io.to("chess").emit("movesRefreshed", this.lastMoves);

        if (this.gameFinishedWinner !== "") {
            this.io.to("chess").emit("gameFinished", {
                winner: this.gameFinishedWinner,
                type: this.gameFinishedType,
            });
        }
        if (callback) callback("chess"); // obj: successfuly joined ?
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
