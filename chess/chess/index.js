require("dotenv").config();

const httpServer = new (require("./sockets/http-server"))();
const chessServer = new (require("./sockets/sockets"))(httpServer.server);
const gamesManager = new (require("./games-manager/games-manager"))(chessServer);
require("./sockets/winsigint");
//setTimeout(() => {}, 3000);
gamesManager.startSampleGame();

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
