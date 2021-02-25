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
        this.globalGameId = id;
        this.globalStep = 1;
        this.globalTurn = "w";
    }
    start = () => {
        console.log("starting pos: \n" + this.chess.ascii());
        this.performGolemCalculationsWrapper({
            turnId: this.globalTurn,
            gameId: this.globalGameId,
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
        chessServer.sendMovesList(this.moves);
    };
    calculationStarted = () => {};
    agreementCreated = (data) => {
        ChessServer.agreementCreated(data);
    };
    calculationRequested = () => {};
    computationStarted = () => {};
    calculationCompleted = async (data) => {
        if (Moves[data.bestmove.hash].move !== undefined) return;
        chess.move(data.bestmove.move, { sloppy: true });

        Moves[data.bestmove.hash].move = data.bestmove.move;
        Moves[data.bestmove.hash].vm_time = data.bestmove.time;

        RefreshMoves();

        console.log(
            "--------------------- // " +
                data.bestmove.hash +
                "  // docker image calculation (depth:" +
                data.bestmove.depth +
                ") time: " +
                data.bestmove.time,
        );

        ChessServer.sendChessPosition(chess.fen());

        ChessServer.sendChessMove(data.bestmove);

        console.log("====================\n\n" + chess.ascii() + "\n\n===================");

        if (chess.game_over()) {
            console.log("!!!! game over !!!!!");
            console.log(chess.ascii());

            if (chess.in_checkmate()) {
                ChessServer.gameFinished({
                    winner: globalTurn === "w" ? "WHITE" : "BLACK",
                    type: "winner",
                });
            } else {
                //chess.reset();
                ChessServer.gameFinished({ winner: "", type: "draw" });
            }

            return;
        }

        // next move
        globalStep++;
        globalTurn = globalTurn === "w" ? "b" : "w";

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
        ChessServer.computationFinished(data);
        Moves[data.taskId].total_time = data.time;

        RefreshMoves();
    };
    agreementConfirmed = (data) => {
        ChessServer.agreementConfirmed(data);
        Moves[data.taskId].worker = data.providerName;
    };
    invoiceReceived = (data) => {
        Moves[data.taskId].cost = data.totalCost;
    };
    offersReceived = (data) => {
        Moves[data.taskId].offers_count = data.offersCount;
        ChessServer.offersReceived(data);
    };
    providerFailed = (data) => {
        if (Moves[data.taskId].failed === undefined) {
            Moves[data.taskId].failed = data.providerName;
            Moves[data.taskId].failed_times = 1;
        } else {
            Moves[data.taskId].failed += "..**.." + data.providerName;
            Moves[data.taskId].failed_times++;
        }
    };
}

module.exports = ChessGame;
