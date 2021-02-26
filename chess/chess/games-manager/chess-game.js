const express = require("express");
const https = require("https");
const fs = require("fs");
const { PerformGolemCalculations } = require("../chess");
const { Chess } = require("chess.js");
const { gethTaskIdHash } = require("../helpers/get-task-hash-id");
class ChessGame {
    constructor(id, chessServer) {
        this.chessServer = chessServer;
        this.moves = [];
        this.chess = new Chess();
        this.gameId = id;
        this.globalStep = 1;
        this.globalTurn = "w";
    }
    start = () => {
        console.log("starting pos: \n" + this.chess.ascii());
        this.performGolemCalculationsWrapper({
            turnId: this.globalTurn,
            gameId: this.gameId,
            gameStep: this.globalStep,
            chess: this.chess,
        });
    };
    performGolemCalculationsWrapper = async (data) => {
        const { gameId } = data;
        data.depth = data.turnId == "w" ? 3 : 6;

        data.taskId = gethTaskIdHash(data.gameId, data.gameStep);

        this.chessServer.currentTurn(data);

        this.moves[data.taskId] = {};
        this.moves[data.taskId].gameId = data.gameId;
        this.moves[data.taskId].nr = data.gameStep;
        this.moves[data.taskId].taskId = data.taskId;
        this.moves[data.taskId].depth = data.depth;
        this.moves[data.taskId].turn = data.turnId == "w" ? "white" : "black";

        return await PerformGolemCalculations(data);
    };

    refreshMoves = () => {
        this.debugLog("refreshMoves", "");
        chessServer.sendMovesList(this.moves);
    };
    calculationStarted = (data) => {
        this.debugLog("calculationStarted", data);
    };
    agreementCreated = (data) => {
        this.debugLog("agreementCreated", data);
        ChessServer.agreementCreated(data);
    };
    calculationRequested = (data) => {
        this.debugLog("calculationRequested", data);
    };
    computationStarted = () => {
        this.debugLog("computationStarted", data);
    };
    calculationCompleted = async (data) => {
        this.debugLog("calculationCompleted", data);
        if (this.moves[data.bestmove.hash].move !== undefined) return;
        this.chess.move(data.bestmove.move, { sloppy: true });

        this.moves[data.bestmove.hash].move = data.bestmove.move;
        this.moves[data.bestmove.hash].vm_time = data.bestmove.time;

        RefreshMoves();

        console.log(
            "--------------------- // " +
                data.bestmove.hash +
                "  // docker image calculation (depth:" +
                data.bestmove.depth +
                ") time: " +
                data.bestmove.time,
        );

        this.chessServer.sendChessPosition(chess.fen());

        this.chessServer.sendChessMove(data.bestmove);

        console.log("====================\n\n" + chess.ascii() + "\n\n===================");

        if (this.chess.game_over()) {
            console.log("!!!! game over !!!!!");
            console.log(chess.ascii());

            if (this.chess.in_checkmate()) {
                this.chessServer.gameFinished({
                    winner: globalTurn === "w" ? "WHITE" : "BLACK",
                    type: "winner",
                });
            } else {
                //chess.reset();
                this.chessServer.gameFinished({ winner: "", type: "draw" });
            }

            return;
        }

        // next move
        this.globalStep++;
        this.globalTurn = globalTurn === "w" ? "b" : "w";

        while (true) {
            var success = await this.performGolemCalculationsWrapper({
                turnId: globalTurn,
                gameId: globalGameId,
                gameStep: globalStep,
                chess,
            });
            if (success) {
                console.log("*** PerformGolemCalculations succeeded");
                break;
            } else {
                console.log("*** PerformGolemCalculations failed... restarting");
            }
        }
    };
    computationFinished = (data) => {
        this.debugLog("computationFinished", data);
        this.chessServer.computationFinished(data);
        this.moves[data.taskId].total_time = data.time;

        RefreshMoves();
    };
    agreementConfirmed = (data) => {
        this.debugLog("agreementConfirmed", data);
        this.chessServer.agreementConfirmed(data);
        this.moves[data.taskId].worker = data.providerName;
    };
    invoiceReceived = (data) => {
        this.debugLog("invoiceReceived", data);
        this.moves[data.taskId].cost = data.totalCost;
    };
    offersReceived = (data) => {
        this.debugLog("offersReceived", data);
        this.moves[data.taskId].offers_count = data.offersCount;
        this.chessServer.offersReceived(data);
    };
    providerFailed = (data) => {
        this.debugLog("providerFailed", data);
        if (this.moves[data.taskId].failed === undefined) {
            this.moves[data.taskId].failed = data.providerName;
            this.moves[data.taskId].failed_times = 1;
        } else {
            this.moves[data.taskId].failed += "..**.." + data.providerName;
            this.moves[data.taskId].failed_times++;
        }
    };

    debugLog = (functionName, data) => {
        console.log(`>>>ChessGame::${functionName} ` + JSON.stringify(data, null, 4));
    };
}

module.exports = ChessGame;
