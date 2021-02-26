require("dotenv").config();

const httpServer = new (require("./sockets/http-server"))();
const chessServer = new (require("./sockets/sockets"))(httpServer.server);
const gamesManager = new (require("./games-manager/games-manager"))(chessServer);

setTimeout(() => {
    gamesManager.startSampleGame();
}, 3000);

//sends move and statistics to clients

// starts the game with offset so all gui clients have time to reconnect

/*
    PerformGolemCalculationsWrapper({
        turnId: globalTurn,
        gameId: globalGameId,
        gameStep: globalStep,
        chess,
    });
}, 5000);
*/
