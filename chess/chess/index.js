const { PerformGolemCalculations } = require("./chess");
const { Chess } = require("chess.js");
const express = require("express");

const ChessServerClass = require("./sockets/sockets");

const chess = new Chess();

Moves = {};

const app = express();
const port = 3970; // ===> config
const server = app.listen(port, () =>
  console.log(`Listening on port ${port}...`)
);

const ChessServer = new ChessServerClass(app, server);

console.log("chess: \n" + chess.ascii());

const events = require("./event-emitter");
events.setMaxListeners(100);
let subnet = "community.3";
//utils.changeLogLevel("debug");
console.log(`Using subnet: ${subnet}`);
var globalGameId = 131;
var globalStep = 1;
var globalTurn = "w";

RefreshMoves = () => {
  ChessServer.sendMovesList(Moves);
};

PerformGolemCalculationsWrapper = async function (moveData) {
  moveData.depth = moveData.turnId == "w" ? 17 : 5;
  moveData.taskId =
    "hash_" +
    moveData.gameId.toString().padStart(8, "0") +
    "_" +
    moveData.gameStep.toString().padStart(4, "0");

  ChessServer.currentTurn(moveData);
  Moves[moveData.taskId] = {};
  Moves[moveData.taskId].gameId = moveData.gameId;
  Moves[moveData.taskId].nr = moveData.gameStep;
  Moves[moveData.taskId].taskId = moveData.taskId;
  Moves[moveData.taskId].depth = moveData.depth;
  Moves[moveData.taskId].turn = moveData.turnId == "w" ? "white" : "black";

  return await PerformGolemCalculations(moveData, subnet);
};

var ListenerCalculationCompleted = async function ListenerCalculationCompleted(
  data
) {
  console.log(
    "calculation_completed executed. " + JSON.stringify(data, null, 4)
  );
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
      data.bestmove.time
  );

  ChessServer.sendChessPosition(chess.fen());

  ChessServer.sendChessMove(data.bestmove);
  globalStep++;
  globalTurn = globalTurn === "w" ? "b" : "w";

  console.log(
    "====================\n\n" + chess.ascii() + "\n\n==================="
  );

  if (chess.in_stalemate()) {
    console.log("!!!! stalemate !!!!!");
    console.log(chess.ascii());

    //chess.reset();

    return;
  }

  if (chess.game_over()) {
    console.log("!!!! game over !!!!!");
    console.log(chess.ascii());

    //chess.reset();
    return;
  }
  while (true) {
    var success = await PerformGolemCalculationsWrapper({
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

var ListenerAgreementCreated = function ListenerAgreementCreated(data) {
  false &&
    console.log("agreement_created executed. " + JSON.stringify(data, null, 4));
  ChessServer.agreementCreated(data);
};

var ListenerComputationFinished = function ListenerComputationFinished(data) {
  false &&
    console.log(
      "computation_finished executed. " + JSON.stringify(data, null, 4)
    );
  ChessServer.computationFinished(data);
  Moves[data.taskId].total_time = data.time;
  // console.log("computation_finished . " + JSON.stringify(Moves, null, 4));
  RefreshMoves();
};

var ListenerAgreementConfirmed = function ListenerAgreementConfirmed(data) {
  false &&
    console.log(
      "agreement_confirmed executed. " + JSON.stringify(data, null, 4)
    );
  ChessServer.agreementConfirmed(data);
  Moves[data.taskId].worker = data.providerName;
};

var ListenerCalculationStarted = function ListenerCalculationStarted(data) {
  false &&
    console.log(
      "calculation_started executed. " + JSON.stringify(data, null, 4)
    );
};

var ListenerCalculationRequested = function ListenerCalculationRequested(data) {
  false &&
    console.log(
      "calculation_requested executed. " + JSON.stringify(data, null, 4)
    );
};

var providerFailed = function providerFailed(data) {
  //false &&
  false &&
    console.log(
      "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!  worker failed. " +
        JSON.stringify(data, null, 4)
    );
  ChessServer.workerFailed(data);
  if (Moves[data.taskId].failed === undefined) {
    Moves[data.taskId].failed = data.failed;
    Moves[data.taskId].failed_times = 1;
  } else {
    Moves[data.taskId].failed += "..**.." + data.failed;
    Moves[data.taskId].failed_times++;
  }
};
var ListenerInvoiceReceived = function ListenerInvoiceReceived(data) {
  // false &&
  console.log("invoic_received executed. " + JSON.stringify(data, null, 4));
  ChessServer.invoiceReceived(data);

  Moves[data.taskId].cost = data.totalCost;
  // console.log("computation_finished . " + JSON.stringify(Moves, null, 4));

  RefreshMoves();
};
var ListenerComputationStarted = function ListenerComputationStarted(data) {
  // false &&
  // console.log("computation_started executed. " + JSON.stringify(data, null, 4));
  ChessServer.computationStarted(data);
};
var ListenerOffersReceived = function ListenerOffersReceived(data) {
  // console.log("data offers. " + JSON.stringify(data, null, 4));
  ChessServer.offersReceived(data);
  Moves[data.taskId].offers_count = data.offersCount;
};
events.addListener("invoice_received", ListenerInvoiceReceived);
events.addListener("computation_finished", ListenerComputationFinished);
events.addListener("agreement_created", ListenerAgreementCreated);
events.addListener("agreement_confirmed", ListenerAgreementConfirmed);
events.addListener("calculation_requested", ListenerCalculationRequested);
events.addListener("calculation_started", ListenerCalculationStarted);
events.addListener("calculation_completed", ListenerCalculationCompleted);
events.addListener("provider_failed", providerFailed);
events.addListener("computation_started", ListenerComputationStarted);
events.addListener("offers_received", ListenerOffersReceived);

events.on("", (data) => console.log("lalalalala" + data));

setTimeout(() => {
  PerformGolemCalculationsWrapper({
    turnId: globalTurn,
    gameId: globalGameId,
    gameStep: globalStep,
    chess,
  });
}, 5000);
