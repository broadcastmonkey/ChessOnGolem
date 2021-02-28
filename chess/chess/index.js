require("dotenv").config();

const httpServer = new (require("./sockets/http-server"))();
const chessServer = new (require("./sockets/sockets"))(httpServer.server);
const gamesManager = new (require("./games-manager/games-manager"))(chessServer);

setTimeout(() => {}, 3000);
gamesManager.startSampleGame();
