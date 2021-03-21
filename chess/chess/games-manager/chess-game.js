const { performGolemCalculations } = require("../chess");
const { Chess } = require("chess.js");
const Crypto = require("crypto");
const { isUuid } = require("uuidv4");
const ChessTempPathHelper = require("../helpers/chess-temp-path-helper");
const toBool = require("to-bool");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const {
    GameType,
    PlayerType,
    TurnType,
    StatusType,
    MoveStatus,
    WinnerType,
    Authorization,
} = require("./enums");
const { ComposedStorageProvider } = require("yajsapi/dist/storage");
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function checkLocalTokenForConstraints(token) {
    return token !== undefined && isUuid(token);
}

class ChessGame {
    constructor(id, chessServer, gameType, options) {
        this.active = true;
        this.chessServer = chessServer;
        this.chess = new Chess();
        this.paths = new ChessTempPathHelper(id, 0);
        this.calculated = false;
        this.moves = [];
        this.gameId = id;
        this.stepId = 0;
        this.globalTurn = PlayerType.WHITE;
        this.isGameFinished = false;
        this.gameType = gameType;
        this.gameStatus = StatusType.INITIATED;
        this.winner = "";
        this.winnerType = "";
        this.playerColor = PlayerType.WHITE;
        this.gameStartedTime = Date.now();
        this.gameFinishedTime = null;
        this.lastMoveTime = null;

        this.depthWhite = getRandomInt(17) + 1;
        if (this.gameType === GameType.PLAYER_VS_GOLEM) this.depthWhite = 0;

        this.depthBlack = getRandomInt(17) + 1;
        if (options !== undefined && options.depth !== undefined) this.depthBlack = options.depth;
        //assumes player always starts game
        this.turnType = gameType === GameType.GOLEM_VS_GOLEM ? TurnType.GOLEM : TurnType.PLAYER;

        this.playerLogin = "";
        this.authorizationMethod = Authorization.NONE;
        this.playerJWT = null;
        this.playerLocalToken = null;
        this.playerId = 0;

        // sets authorization
        if (options !== undefined && options.token !== undefined) {
            switch (options.token.auth_type) {
                case "local":
                    this.authorizationMethod = Authorization.LOCAL;
                    if (checkLocalTokenForConstraints(options.token.token)) {
                        this.playerLocalToken = options.token.token;
                        this.playerLogin = "anonymous";
                    } else this.fatalError = true;
                    break;
                case "server":
                    this.authorizationMethod = Authorization.SERVER;
                    try {
                        const decodedToken = jwt.verify(
                            options.token.token,
                            process.env.JWT_PRIVATE_KEY,
                        );
                        this.playerLogin = decodedToken.login;
                        this.playerId = decodedToken.id;
                        this.playerJWT = options.token.token;
                    } catch {
                        this.fatalError = true;
                    }
                    break;
            }
        }
    }
    start = () => {
        if (this.isGameFinished) {
            console.log(`loaded game with id: ${this.gameId} already finished...`);
            return;
        }
        if (this.stepId > 0) console.log("resuming game : " + this.gameId);
        else console.log("starting game : " + this.gameId);

        this.gameStatus = StatusType.STARTED;
        if (
            this.gameType === GameType.GOLEM_VS_GOLEM ||
            (this.gameType === GameType.PLAYER_VS_GOLEM && this.turnType === TurnType.GOLEM)
        ) {
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
        console.log("calc");

        this.gameStatus = StatusType.WAITING_FOR_GOLEM_CALCULATION;
        data.depth = data.turnId == PlayerType.WHITE ? this.depthWhite : this.depthBlack;
        const { chess, ...dataForGui } = data;

        this.debugLog("performGolemCalculationsWrapper", dataForGui);
        const { gameId, stepId, turnId, depth } = data;
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
                    this.displayGolemCalculationStatus(success);
                    if (success) break;
                }
            }
        }
    };
    displayGolemCalculationStatus = (success) => {
        if (!toBool(process.env.LOG_ENABLED_CHESS_GAME_COMPLETED_CALCULATION_WAS_SUCCESSFUL))
            return;
        if (success) console.log("*** PerformGolemCalculations succeeded");
        else console.log("*** PerformGolemCalculations failed... restarting");
    };
    isAuthorized = (token) => {
        switch (this.authorizationMethod) {
            case Authorization.NONE:
                return true;
            case Authorization.SERVER: {
                try {
                    // console.log(`authorizing...` + token.token);
                    const decodedToken = jwt.verify(token.token, process.env.JWT_PRIVATE_KEY);

                    return (
                        decodedToken.login === this.playerLogin &&
                        this.playerId === decodedToken.id &&
                        this.playerJWT === token.token
                    );
                } catch {
                    //     console.log(`veirification failed!`);
                    return false;
                }
            }
            case Authorization.LOCAL:
                return token.token === this.playerLocalToken;
        }
        return false;
    };
    newMoveRequest = (data) => {
        const { move, token } = data;

        if (!this.isAuthorized(token)) return { status: 401 };

        //  console.log("here");
        this.moves[this.stepId] = {};
        this.moves[this.stepId].gameId = this.gameId;
        this.moves[this.stepId].stepId = this.stepId;
        this.moves[this.stepId].depth = 0;
        this.moves[this.stepId].turn = this.globalTurn;
        this.moves[this.stepId].playerType = TurnType.PLAYER;

        this.startNewGolemCalculation(move, TurnType.PLAYER);
        return { status: 200 };
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
    displayCurrentChessBoard = () => {
        if (toBool(process.env.LOG_ENABLED_CHESS_GAME_ASCII_BOARD))
            console.log(
                `\nGameId: ${this.gameId} / step: ${this.stepId}\n${this.chess.ascii()} \n\n`,
            );
    };
    PerformMoveAndCheckForGameOver = (move) => {
        console.log("turn type: " + this.turnType);
        this.debugLog("PerformMoveAndCheckForGameOver", move);
        const result = this.chess.move(move, { sloppy: true });

        if (result === null) {
            console.log("!!! ERROR ! ");
            return MoveStatus.ERROR;
        }
        this.lastMoveTime = Date.now();

        if (this.turnType === TurnType.GOLEM) this.moves[this.stepId].move = move;
        else this.moves[this.stepId].move = move.from + ":" + move.to;
        this.moves[this.stepId].calculated = true;
        this.moves[this.stepId].time = Date.now();
        this.moves[this.stepId].fen = this.chess.fen();

        this.refreshMoves();
        this.chessServer.sendChessPosition({
            gameId: this.gameId,
            stepId: this.stepId,
            position: this.moves[this.stepId].fen,
        });
        this.chessServer.sendChessMove({
            gameId: this.gameId,
            stepId: this.stepId,
            move: this.moves[this.stepId].move,
        });

        this.displayCurrentChessBoard();
        if (this.chess.game_over()) {
            this.gameStatus = StatusType.FINISHED;
            this.isGameFinished = true;

            this.moves[this.stepId].isGameFinished = true;
            if (this.chess.in_checkmate()) {
                this.moves[this.stepId].winnerType = WinnerType.CHECKMATE;
                this.moves[this.stepId].winner = this.globalTurn;
            } else {
                this.moves[this.stepId].winnerType = WinnerType.DRAW;
                this.moves[this.stepId].winner = "";
            }
            console.log("!!!! game over !!!!! / " + this.moves[this.stepId].winnerType);
            console.log(this.chess.ascii());
            this.chessServer.gameFinished({
                gameId: this.gameId,
                stepId: this.stepId,
                winner: this.moves[this.stepId].winner,
                winnerType: this.moves[this.stepId].winnerType,
            });
            this.winner = this.moves[this.stepId].winner;
            this.winnerType = this.moves[this.stepId].winnerType;

            this.gameFinishedTime = Date.now();
            this.saveToFile();
            return MoveStatus.GAME_FINISHED;
        }
        this.saveToFile();
        return MoveStatus.GAME_CONTINUES;
    };
    calculationCompleted = async (data) => {
        if (!this.active) {
            console.log(`Game ${this.gameId} is ready for shutdown`);
            return;
        }
        const { bestmove, stepId } = data;
        const { move, time, depth } = bestmove;
        this.debugLog("calculationCompleted", data);
        this.moves[stepId].vm_time = time;
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
        if (this.stepId > 1) this.saveToFile();
    };

    getGameObject = (isSecure) => {
        let object = {
            gameId: this.gameId,
            stepId: this.stepId,
            globalTurn: this.globalTurn,
            isGameFinished: this.isGameFinished,
            gameType: this.gameType,
            gameStatus: this.gameStatus,
            moves: this.moves,
            winner: this.winner,
            winnerType: this.winnerType,
            turnType: this.turnType,
            calculated: this.calculated,
            playerColor: this.playerColor,
            gameStartedTime: this.gameStartedTime,
            gameFinishedTime: this.gameFinishedTime,
            lastMoveTime: this.lastMoveTime,
            depthBlack: this.depthBlack,
            depthWhite: this.depthWhite,
            fen: this.chess.fen(),
            playerLogin: this.playerLogin,
            authorizationMethod: this.authorizationMethod,
        };
        if (this.authorizationMethod === Authorization.LOCAL) {
            object = {
                ...object,
                secret: Crypto.createHash("sha256").update(this.playerLocalToken).digest("hex"),
            };
        }

        if (isSecure === true) {
            object = {
                ...object,

                playerJWT: this.playerJWT,
                playerLocalToken: this.playerLocalToken,
                playerId: this.playerId,
            };
        }

        return object;
    };
    saveToFile = () => {
        var gameFilePath = this.paths.GameFile;
        if (!fs.existsSync(this.paths.GamesFolder)) {
            fs.mkdirSync(this.paths.GamesFolder, { recursive: true });
        }
        let data = JSON.stringify(this.getGameObject(true));
        fs.writeFileSync(gameFilePath, data);
        console.log(`game ${this.gameId} saved.`);
    };

    loadFromObject = (data) => {
        this.gameId = data.gameId;
        this.stepId = data.stepId;
        this.globalTurn = data.globalTurn;
        this.isGameFinished = data.isGameFinished;
        this.gameType = data.gameType;
        this.gameStatus = data.gameStatus;
        this.moves = data.moves;
        this.calculated = data.calculated;
        this.winner = data.winner;
        this.winnerType = data.winnerType;
        this.turnType = data.turnType;
        this.playerColor = data.playerColor;
        this.gameStartedTime = data.gameStartedTime;
        this.gameFinishedTime = data.gameFinishedTime;
        this.lastMoveTime = data.lastMoveTime;
        this.depthWhite = data.depthWhite === undefined ? 10 : data.depthWhite;
        this.depthBlack = data.depthBlack === undefined ? 10 : data.depthBlack;
        this.chess.load(data.fen);
        this.playerLogin = data.playerLogin;
        this.authorizationMethod = data.authorizationMethod;
        this.playerJWT = data.playerJWT;
        this.playerLocalToken = data.playerLocalToken;
        this.playerId = data.playerId;
    };

    loadFromFile = () => {
        if (fs.existsSync(this.paths.GameFile)) {
            let rawdata = fs.readFileSync(this.paths.GameFile);
            const data = JSON.parse(rawdata);
            this.loadFromObject(data);
            if (this.moves === undefined || this.moves.length == 0) {
                return false;
            }
            let lastMove = this.moves[this.moves.length - 1];
            if (lastMove && lastMove.calculated === true) {
                console.log(` game : ${this.gameId} last step calculated, starting new step`);
                this.turnId =
                    lastMove.turnId === PlayerType.WHITE ? PlayerType.BLACK : PlayerType.WHITE;
                this.turnType =
                    lastMove.playerType === TurnType.PLAYER ? TurnType.GOLEM : TurnType.PLAYER;

                this.globalTurn =
                    lastMove.turn === PlayerType.WHITE ? PlayerType.BLACK : PlayerType.WHITE;
                this.stepId = lastMove.stepId + 1;
            }
            console.log(`game ${this.gameId} loaded from file.`);
        } else {
            console.log("file doesn't exist");
        }
    };
}

module.exports = ChessGame;
