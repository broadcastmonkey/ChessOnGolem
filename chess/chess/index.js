require("dotenv").config();

const httpServer = new (require("./sockets/http-server"))();
const chessServer = new (require("./sockets/chess-server"))(httpServer.server);
const gamesManager = new (require("./games-manager/games-manager"))(chessServer);
gamesManager.loadGamesFromDisk();
require("./sockets/winsigint");
//setTimeout(() => {}, 3000);
if (gamesManager.getGamesInProgressCount() === 0) {
    console.log("none games in progress detected - starting new game!");
    gamesManager.startSampleGame();
}

process.on("SIGINT", () => {
    console.log("Caught interrupt signal... closing socket");
    httpServer.close();
    gamesManager.close();

    console.log("giving providers 20 sec to finish their jobs");
    // if (i_should_exit)
    setTimeout(() => {
        process.exit();
    }, 20 * 1000);
    //
});
