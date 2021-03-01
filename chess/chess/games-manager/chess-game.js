const { performGolemCalculations } = require("../chess");
const { Chess } = require("chess.js");
const ChessTempPathHelper = require("../helpers/chess-temp-path-helper");
const toBool = require("to-bool");
const fs = require("fs");
class ChessGame {
    constructor(id, chessServer) {
        this.active = true;
        this.chessServer = chessServer;
        this.moves = [];
        this.chess = new Chess();
        this.gameId = id;
        this.stepId = 0;
        this.globalTurn = "white";
        this.paths = new ChessTempPathHelper(this.gameId, 0);
        this.isGameFinished = false;
        this.open(this.gameId);
    }
    start = () => {
        console.log("starting pos: \n" + this.chess.ascii());
        this.performGolemCalculationsWrapper({
            turnId: this.globalTurn,
            gameId: this.gameId,
            stepId: this.stepId,
            player: "golem",
            chess: this.chess,
        });
    };
    performGolemCalculationsWrapper = async (data) => {
        data.depth = data.turnId == "white" ? 10 : 10;
        const { chess, ...dataForGui } = data;

        this.debugLog("performGolemCalculationsWrapper", dataForGui);
        const { gameId, stepId, turnId, depth } = data;

        //

        this.moves[stepId] = {};
        this.moves[stepId].gameId = gameId;
        this.moves[stepId].stepId = stepId;
        this.moves[stepId].depth = depth;
        this.moves[stepId].turn = turnId;

        this.chessServer.currentTurn(dataForGui);

        return await performGolemCalculations(data);
    };

    refreshMoves = () => {
        this.debugLog("refreshMoves", "");
        this.chessServer.sendMovesList(this.moves);
    };
    calculationStarted = (data) => {
        this.debugLog("calculationStarted", data);
    };
    agreementCreated = (data) => {
        this.debugLog("agreementCreated", data);
        this.chessServer.agreementCreated(data);
    };
    calculationRequested = (data) => {
        this.debugLog("calculationRequested", data);
        this.chessServer.calculationRequested(data);
    };
    computationStarted = (data) => {
        this.chessServer.computationStarted(data);
        this.debugLog("computationStarted", data);
    };
    calculationCompleted = async (data) => {
        if (!this.active) {
            console.log(`Game ${this.gameId} is ready for shutdown`);
            return;
        }
        const { bestmove, stepId } = data;
        const { move, time, depth } = bestmove;
        this.debugLog("calculationCompleted", data);
        if (this.moves[stepId].move !== undefined) return;
        this.chess.move(move, { sloppy: true });

        this.moves[stepId].move = move;
        this.moves[stepId].vm_time = time;

        this.refreshMoves();

        if (toBool(process.env.LOG_ENABLED_CHESS_GAME_COMPLETED_CALCULATION_DETAILS))
            console.log(
                "--------------------- // " +
                    stepId +
                    "  // docker image calculation (depth:" +
                    depth +
                    ") time: " +
                    time,
            );

        this.chessServer.sendChessPosition(this.chess.fen());

        this.chessServer.sendChessMove(bestmove);

        if (toBool(process.env.LOG_ENABLED_CHESS_GAME_ASCII_BOARD))
            console.log(
                `====================\nGAME ${this.gameId} / step: ${
                    this.stepId
                }\n${this.chess.ascii()} \n\n===================`,
            );

        if (this.chess.game_over()) {
            console.log("!!!! game over !!!!!");
            console.log(this.chess.ascii());
            this.moves[stepId].isGameFinished = true;
            if (this.chess.in_checkmate()) {
                this.moves[stepId].winner_type = "checkmate";
                this.moves[stepId].winner = this.globalTurn;
                this.chessServer.gameFinished({
                    winner: this.globalTurn,
                    type: "winner",
                });
            } else {
                this.moves[stepId].winner = "";
                this.moves[stepId].winner_type = "draw";
                //chess.reset();
                this.chessServer.gameFinished({ winner: "", type: "draw" });
            }

            return;
        }

        // next move
        this.stepId++;
        this.globalTurn = this.globalTurn === "white" ? "black" : "white";

        while (true) {
            var success = await this.performGolemCalculationsWrapper({
                turnId: this.globalTurn,
                gameId: this.gameId,
                stepId: this.stepId,
                chess: this.chess,
            });
            if (success) {
                if (toBool(process.env.LOG_ENABLED_CHESS_GAME_COMPLETED_CALCULATION_WAS_SUCCESSFUL))
                    console.log("*** PerformGolemCalculations succeeded");
                break;
            } else {
                if (toBool(process.env.LOG_ENABLED_CHESS_GAME_COMPLETED_CALCULATION_WAS_SUCCESSFUL))
                    console.log("*** PerformGolemCalculations failed... restarting");
            }
        }
    };
    computationFinished = (data) => {
        this.debugLog("computationFinished", data);
        const { stepId, time } = data;
        this.moves[stepId].total_time = time;
        this.chessServer.computationFinished(data);
        this.refreshMoves();
    };
    agreementConfirmed = (data) => {
        this.debugLog("agreementConfirmed", data);
        const { stepId, providerName } = data;
        this.moves[stepId].worker = providerName;
        this.chessServer.agreementConfirmed(data);
    };
    subscriptionCreated = (data) => {
        this.debugLog("subscriptionCreated", data);
        this.chessServer.subscriptionCreated(data);
    };
    scriptSent = (data) => {
        this.debugLog("scriptSent", data);
        this.chessServer.scriptSent(data);
    };
    invoiceReceived = (data) => {
        this.debugLog("invoiceReceived", data);
        const { stepId } = data;
        this.moves[stepId].cost = data.totalCost;
        this.chessServer.invoiceReceived(data);
    };
    offersReceived = (data) => {
        this.debugLog("offersReceived", data);
        const { stepId, offersCount } = data;
        this.moves[stepId].offers_count = offersCount;
        this.chessServer.offersReceived(data);
    };
    proposalsReceived = (data) => {
        this.debugLog("proposalsReceived", data);
        const { stepId, proposalsCount } = data;
        this.moves[stepId].proposals_count = proposalsCount;
        this.chessServer.proposalsReceived(data);
    };
    providerFailed = (data) => {
        this.debugLog("providerFailed", data);
        const { stepId, providerName } = data;
        if (this.moves[stepId].failed === undefined) {
            this.moves[stepId].failed = providerName;
            this.moves[stepId].failed_times = 1;
        } else {
            this.moves[stepId].failed += "..**.." + providerName;
            this.moves[stepId].failed_times++;
        }
        this.chessServer.providerFailed(data);
    };

    debugLog = (functionName, data) => {
        if (toBool(process.env.LOG_ENABLED_CHESS_GAME_FUNCTION_HEADER))
            console.log(`>>>ChessGame::${functionName} ` + JSON.stringify(data, null, 4));
    };
    close = () => {
        this.active = false;
        this.save();
    };
    save = () => {
        var gameFilePath = this.paths.GameFile;
        if (!fs.existsSync(this.paths.GamesFolder)) {
            fs.mkdirSync(this.paths.GamesFolder, { recursive: true });
        }
        let data = JSON.stringify({ moves: this.moves, fen: this.chess.fen() });
        fs.writeFileSync(gameFilePath, data);
        console.log(`game ${this.gameId} saved.`);
    };
    open = () => {
        if (fs.existsSync(this.paths.GameFile)) {
            let rawdata = fs.readFileSync(this.paths.GameFile);
            const data = JSON.parse(rawdata);
            this.moves = data.moves;
            this.chess.load(data.fen);
            let lastMove = this.moves[this.moves.length - 1];
            if (lastMove.isGameFinished === true) {
                this.isGameFinished = true;
                this.winner = lastMove.winner;
                this.winner_type = lastMove.winner_type;
            } else {
                this.turnId = lastMove.turnId === "white" ? "black" : "white";
                this.stepId = lastMove.stepId + 1;
            }
            console.log(`game ${this.gameId} loaded from file.`);
        }
    };
}

module.exports = ChessGame;
