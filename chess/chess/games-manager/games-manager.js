const ChessGame = require("./chess-game");
const events = require("../sockets/event-emitter");
const toBool = require("to-bool");
const { GameType } = require("./enums");
const fs = require("fs");
const ChessTempPathHelper = require("../helpers/chess-temp-path-helper");
events.setMaxListeners(100);
class GamesManager {
    constructor(chessServer) {
        this.currentGameId = 0;
        this.games = [];
        this.chessServer = chessServer;
        this.total = 0;
        this.active = true;

        events.addListener("calculation_requested", this.calculationRequested);
        events.addListener("subscription_created", this.subscriptionCreated);
        events.addListener("proposals_received", this.proposalsReceived);
        events.addListener("offers_received", this.offersReceived);
        events.addListener("agreement_created", this.agreementCreated);
        events.addListener("agreement_confirmed", this.agreementConfirmed);
        events.addListener("computation_started", this.computationStarted);
        events.addListener("calculation_started", this.calculationStarted);
        events.addListener("calculation_completed", this.calculationCompleted);
        events.addListener("computation_finished", this.computationFinished);
        events.addListener("invoice_received", this.invoiceReceived);
        events.addListener("provider_failed", this.providerFailed);
        events.addListener("script_sent", this.scriptSent);
        events.addListener("new_game_request", this.newGameRequest);
        events.addListener("new_move_request", this.newMoveRequest);
    }
    getGamesInProgressCount = () => {
        return this.games.filter((x) => x.isGameFinished === false).length;
    };
    loadGamesFromDisk = () => {
        console.log("loading games from disk...");
        const paths = new ChessTempPathHelper(0, 0);
        if (fs.existsSync(paths.GamesFolder)) {
            const filenames = fs.readdirSync(paths.GamesFolder);
            console.log("filenames");
            console.log(filenames);
            filenames
                .filter((x) => x.includes("game_") && x.includes(".json"))
                .forEach((x) => {
                    let id = parseInt(
                        x.substring(x.lastIndexOf("game_") + 5, x.lastIndexOf(".json")),
                    );
                    console.log("loading file : " + x);
                    console.log("id: " + id);
                    let game = this.addGame(GameType.UNKNOWN, { id });
                    game.loadFromFile();
                    game.start();
                    this.currentGameId = Math.max(this.currentGameId, id + 1);
                });
        }
    };
    getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
    startSampleGame = () => {
        console.log("[i] starting new game ... ");

        //this.currentGameId = this.getRandomInt(1000);
        this.addGame(GameType.GOLEM_VS_GOLEM)?.start();
    };

    addGame = (gameType, options) => {
        let id = 0;
        if (options === undefined || options.id === undefined) {
            id = this.currentGameId++;
        } else {
            id = options.id;
        }
        if (this.getGame(id) !== undefined) {
            console.log(`!!! game with id: ${id} already exists`);
            return undefined;
        }
        const game = new ChessGame(id, this.chessServer, gameType);
        this.games.push(game);

        return game;
    };
    getGame = (id) => {
        return this.games.find((x) => x.gameId === id);
    };
    newMoveRequest = (data) => {
        const { gameId } = data;
        this.debugLog("newMoveRequest", data);
        this.games
            .find((x) => x.gameId === gameId && x.gameType === GameType.PLAYER_VS_GOLEM)
            ?.newMoveRequest(data);
    };
    newGameRequest = (data) => {
        this.debugLog("newGameRequest", {});
        const game = this.addGame(GameType.PLAYER_VS_GOLEM);
        this.chessServer.newGameCreated(data.socket, game.gameId);
        game.start();
    };

    calculationCompleted = async (data) => {
        this.total++;
        const { gameId } = data;
        this.debugLog("calculationCompleted", data);
        this.games.find((x) => x.gameId === gameId)?.calculationCompleted(data);
    };

    agreementCreated = (data) => {
        const { gameId } = data;
        this.debugLog("agreementCreated", data);
        this.games.find((x) => x.gameId === gameId)?.agreementCreated(data);
    };

    computationFinished = (data) => {
        const { gameId } = data;
        this.debugLog("computationFinished", data);
        this.games.find((x) => x.gameId === gameId)?.computationFinished(data);
    };

    agreementConfirmed = (data) => {
        const { gameId } = data;
        this.debugLog("agreementConfirmed", data);
        this.games.find((x) => x.gameId === gameId)?.agreementConfirmed(data);
    };

    calculationStarted = (data) => {
        const { gameId } = data;
        this.debugLog("calculationStarted", data);
        this.games.find((x) => x.gameId === gameId)?.calculationStarted(data);
    };

    calculationRequested = (data) => {
        const { gameId } = data;
        this.debugLog("calculationRequested", data);
        this.games.find((x) => x.gameId === gameId)?.calculationRequested(data);
    };
    scriptSent = (data) => {
        const { gameId } = data;
        this.debugLog("scriptSent", data);
        this.games.find((x) => x.gameId === gameId)?.scriptSent(data);
    };
    providerFailed = (data) => {
        const { gameId } = data;
        this.debugLog("providerFailed", data);
        this.games.find((x) => x.gameId === gameId)?.providerFailed(data);
    };
    subscriptionCreated = (data) => {
        const { gameId } = data;
        this.debugLog("subscriptionCreated", data);
        this.games.find((x) => x.gameId === gameId)?.subscriptionCreated(data);
    };
    invoiceReceived = (data) => {
        const { gameId } = data;
        this.debugLog("invoiceReceived", data);
        this.games.find((x) => x.gameId === gameId)?.invoiceReceived(data);
    };
    computationStarted = (data) => {
        const { gameId } = data;
        this.debugLog("computationStarted", data);
        this.games.find((x) => x.gameId === gameId)?.computationStarted(data);
    };
    offersReceived = (data) => {
        const { gameId } = data;
        this.debugLog("offersReceived", data);
        this.games.find((x) => x.gameId === gameId)?.offersReceived(data);
    };
    proposalsReceived = (data) => {
        const { gameId } = data;
        this.debugLog("proposalsReceived", data);
        this.games.find((x) => x.gameId === gameId)?.proposalsReceived(data);
    };

    debugLog = (functionName, data) => {
        if (toBool(process.env.LOG_ENABLED_GAMES_MANAGER))
            console.log(`>>GamesManager::${functionName} ` + JSON.stringify(data, null, 4));
    };
    close = () => {
        console.log("shutting down games manager ...");
        this.active = false;
        this.games.forEach((x) => x.close());
    };
}

module.exports = GamesManager;
