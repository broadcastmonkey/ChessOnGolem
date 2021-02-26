const socketIO = require("socket.io"); // sock
const toBool = require("to-bool");
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
        this.debugLog("currentTurn", turnData);
        this.lastMoveData = turnData;
        this.io.to("chess").emit("currentTurnEvent", turnData);
    };

    providerFailed = (provider) => {
        this.debugLog("providerFailed", provider);
        this.io.to("chess").emit("providerFailed", provider);
    };

    computationStarted = (taskId) => {
        this.debugLog("computationStarted", taskId);
        this.io.to("chess").emit("computationStarted", taskId);
    };
    sendMovesList = (moves) => {
        this.debugLog("sendMovesList", moves);
        this.io.to("chess").emit("movesRefreshed", moves);
        this.lastMoves = moves;
    };
    gameFinished = (game) => {
        this.debugLog("gameFinished", game);
        // error: remove it or move to chess-game or create a map here with gameIds
        this.gameFinishedWinner = game.winner;
        this.gameFinishedType = game.type;
        this.io.to("chess").emit("gameFinished", game);
    };
    offersReceived = (data) => {
        this.debugLog("offersReceived", data);
        this.io.to("chess").emit("offersReceived", data);
    };

    agreementCreated = (agreement) => {
        this.debugLog("agreementCreated", agreement);
        this.io.to("chess").emit("agreementCreated", agreement);
    };
    agreementConfirmed = (agreement) => {
        this.debugLog("agreementConfirmed", agreement);
        this.io.to("chess").emit("agreementConfirmed", agreement);
    };
    computationFinished = (computation) => {
        this.debugLog("computationFinished", computation);
        this.io.to("chess").emit("computationFinished", computation);
    };
    invoiceReceived = (invoice) => {
        this.debugLog("invoiceReceived", invoice);
        this.io.to("chess").emit("invoiceReceived", invoice);
    };

    sendChessMove = (move) => {
        this.debugLog("sendChessMove", move);
        this.io.to("chess").emit("moveEvent", move);
    };

    sendChessPosition = (fen) => {
        this.debugLog("sendChessPosition", fen);
        this.lastPosition = fen;
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
    debugLog = (functionName, data) => {
        if (toBool(process.env.LOG_ENABLED_SOCKETS_FUNCTION_HEADER))
            console.log(`>>>> Sockets::${functionName} ` + JSON.stringify(data, null, 4));
    };
}

module.exports = ChessSocketServer;
