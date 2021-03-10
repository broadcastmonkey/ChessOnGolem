require("dotenv").config();

const toBool = require("to-bool");
const { GameType } = require("./games-manager/enums");
const users = new (require("./users-manager/users-manager"))();
const httpServer = new (require("./sockets/http-server"))();
const chessServer = new (require("./sockets/chess-server"))(httpServer.server);
const gamesManager = new (require("./games-manager/games-manager"))(chessServer, users);
gamesManager.loadGamesFromDisk();
require("./sockets/winsigint");
if (toBool(process.env.CREATE_NEW_GAME_ON_STARTUP)) {
    if (gamesManager.getGamesInProgressCount({ gameType: GameType.GOLEM_VS_GOLEM }) === 0) {
        console.log("none games in progress detected - starting new game!");
        gamesManager.startSampleGame();
    }
}

process.on("SIGINT", () => {
    console.log("Caught interrupt signal... closing socket");
    httpServer.close();
    gamesManager.close();

    console.log("giving providers 20 sec to finish their jobs");

    setTimeout(() => {
        process.exit();
    }, 1 * 1000);
});
