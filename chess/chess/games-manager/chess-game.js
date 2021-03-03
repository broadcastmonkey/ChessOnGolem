const { performGolemCalculations } = require("../chess");
const { Chess } = require("chess.js");
const ChessTempPathHelper = require("../helpers/chess-temp-path-helper");
const toBool = require("to-bool");
const fs = require("fs");
const { GameType, PlayerType, TurnType, StatusType, MoveStatus } = require("./enums");

class ChessGame {
    constructor(id, chessServer, gameType) {
        this.active = true;
        this.chessServer = chessServer;
        this.moves = [];
        this.chess = new Chess();
        this.gameId = id;
        this.stepId = 0;
        this.globalTurn = PlayerType.WHITE;
        this.paths = new ChessTempPathHelper(this.gameId, 0);
        this.isGameFinished = false;
        //this.open(this.gameId);
        this.gameType = gameType;
        this.gameStatus = StatusType.INITIATED;
        //assumes player always starts game
        this.turnType = gameType === GameType.GOLEM_VS_GOLEM ? TurnType.GOLEM : TurnType.PLAYER;
    }
    start = () => {
        this.gameStatus = StatusType.STARTED;
        console.log("starting pos: \n" + this.chess.ascii());

        if (this.gameType == GameType.GOLEM_VS_GOLEM) {
            this.performGolemCalculationsWrapper({
                turnId: this.globalTurn,
                gameId: this.gameId,
                stepId: this.stepId,
                player: "golem",
                chess: this.chess,
            });
        } else {
            this.gameStatus = StatusType.WAITING_FOR_HUMAN_MOVE;
        }
    };
    performGolemCalculationsWrapper = async (data) => {
        this.gameStatus = StatusType.WAITING_FOR_GOLEM_CALCULATION;
        data.depth = data.turnId == PlayerType.WHITE ? 10 : 1;
        const { chess, ...dataForGui } = data;

        this.debugLog("performGolemCalculationsWrapper", dataForGui);
        const { gameId, stepId, turnId, depth } = data;

        //

        this.moves[stepId] = {};
        this.moves[stepId].gameId = gameId;
        this.moves[stepId].stepId = stepId;
        this.moves[stepId].depth = depth;
        this.moves[stepId].turn = turnId;
        this.moves[stepId].playerType = TurnType.GOLEM;

        this.chessServer.currentTurn(dataForGui);

        return await performGolemCalculations(data);
    };
    startNewGolemCalculation = async (move, playerType) => {
        const status = this.PerformMoveAndCheckForGameOver(move);
        console.log("Status: " + status);
        if (status === MoveStatus.GAME_CONTINUES) {
            this.stepId++;
            this.globalTurn =
                this.globalTurn === PlayerType.WHITE ? PlayerType.BLACK : PlayerType.WHITE;
            console.log(this.gameType);

            if (this.gameType === GameType.PLAYER_VS_GOLEM)
                this.turnType =
                    this.turnType === TurnType.PLAYER ? TurnType.GOLEM : TurnType.PLAYER;

            if (playerType === TurnType.GOLEM && this.gameType === GameType.PLAYER_VS_GOLEM) {
                console.log("updating turn data ... ");
                this.chessServer.currentTurn({
                    gameId: this.gameId,
                    stepId: this.stepId,
                    turnId: this.globalTurn,
                    depth: 0,
                });
            }
            if (this.gameType === GameType.GOLEM_VS_GOLEM || playerType === TurnType.PLAYER) {
                while (true) {
                    var success = await this.performGolemCalculationsWrapper({
                        turnId: this.globalTurn,
                        gameId: this.gameId,
                        stepId: this.stepId,
                        chess: this.chess,
                    });
                    if (success) {
                        if (
                            toBool(
                                process.env
                                    .LOG_ENABLED_CHESS_GAME_COMPLETED_CALCULATION_WAS_SUCCESSFUL,
                            )
                        )
                            console.log("*** PerformGolemCalculations succeeded");
                        break;
                    } else {
                        if (
                            toBool(
                                process.env
                                    .LOG_ENABLED_CHESS_GAME_COMPLETED_CALCULATION_WAS_SUCCESSFUL,
                            )
                        )
                            console.log("*** PerformGolemCalculations failed... restarting");
                    }
                }
            }
        }
    };
    newMoveRequest = (data) => {
        console.log("here");
        this.moves[this.stepId] = {};
        this.moves[this.stepId].gameId = this.gameId;
        this.moves[this.stepId].stepId = this.stepId;
        this.moves[this.stepId].depth = 0;
        this.moves[this.stepId].turn = this.globalTurn;
        this.moves[this.stepId].playerType = TurnType.GOLEM;

        this.startNewGolemCalculation(data.move, TurnType.PLAYER);
    };
    refreshMoves = () => {
        this.debugLog("refreshMoves", "");
        this.chessServer.sendMovesList({
            movesData: this.moves,
            gameId: this.gameId,
            stepId: this.stepId,
        });
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
    PerformMoveAndCheckForGameOver = (move) => {
        console.log("turn type: " + this.turnType);
        this.debugLog("PerformMoveAndCheckForGameOver", move);
        let result = null;
        if (this.turnType === TurnType.GOLEM) {
            result = this.chess.move(move, { sloppy: true });
            this.moves[this.stepId].move = move;
        } else {
            result = this.chess.move(move, { sloppy: true });
            this.moves[this.stepId].move = move.from + ":" + move.to;
        }
        if (result === null) {
            return MoveStatus.ERROR;
            console.log("!!! ERROR ! ");
        }
        this.refreshMoves();
        this.chessServer.sendChessPosition({
            gameId: this.gameId,
            stepId: this.stepId,
            position: this.chess.fen(),
        });
        this.chessServer.sendChessMove({
            gameId: this.gameId,
            stepId: this.stepId,
            move: this.moves[this.stepId].move,
        });

        if (toBool(process.env.LOG_ENABLED_CHESS_GAME_ASCII_BOARD))
            console.log(
                `\nGameId: ${this.gameId} / step: ${this.stepId}\n${this.chess.ascii()} \n\n`,
            );

        if (this.chess.game_over()) {
            this.gameStatus = StatusType.FINISHED;
            console.log("!!!! game over !!!!!");
            console.log(this.chess.ascii());
            this.moves[this.stepId].isGameFinished = true;
            if (this.chess.in_checkmate()) {
                this.moves[this.stepId].winner_type = "checkmate";
                this.moves[this.stepId].winner = this.globalTurn;
                this.chessServer.gameFinished({
                    winner: this.globalTurn,
                    type: "winner",
                });
            } else {
                this.moves[this.stepId].winner = "";
                this.moves[this.stepId].winner_type = "draw";
                //chess.reset();
                this.chessServer.gameFinished({ winner: "", type: "draw" });
            }
            return MoveStatus.GAME_FINISHED;
        } else {
            return MoveStatus.GAME_CONTINUES;
        }
    };
    calculationCompleted = async (data) => {
        if (!this.active) {
            console.log(`Game ${this.gameId} is ready for shutdown`);
            return;
        }
        const { bestmove, stepId } = data;
        const { move, time, depth } = bestmove;
        this.debugLog("calculationCompleted", data);
        //if (this.moves[stepId].move !== undefined) return;

        this.moves[stepId].vm_time = time;

        /*if (toBool(process.env.LOG_ENABLED_CHESS_GAME_COMPLETED_CALCULATION_DETAILS))
            console.log(
                `GameId:${this.gameID} StepId: ${this.stepId} depth: ${depth} time: ${time}`,
            );*/

        // next move
        this.startNewGolemCalculation(move, TurnType.GOLEM);
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
            if (this.moves === undefined || this.moves.length == 0) {
                return;
            }
            let lastMove = this.moves[this.moves.length - 1];
            if (lastMove.isGameFinished === true) {
                this.isGameFinished = true;
                this.winner = lastMove.winner;
                this.winner_type = lastMove.winner_type;
            } else {
                this.turnId =
                    lastMove.turnId === PlayerType.WHITE ? PlayerType.BLACK : PlayerType.WHITE;
                this.stepId = lastMove.stepId + 1;
            }
            console.log(`game ${this.gameId} loaded from file.`);
        }
    };
}

module.exports = ChessGame;
