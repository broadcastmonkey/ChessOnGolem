const { PerformGolemCalculations } = require("./chess");
const { Chess } = require("chess.js");
const express = require("express");

const ChessServerClass = require("./sockets/sockets");

const chess = new Chess();

const app = express();
const port = 3970; // ===> config
const server = app.listen(port, () =>
  console.log(`Listening on port ${port}...`)
);

const ChessServer = new ChessServerClass(app, server);

console.log("chess: \n" + chess.ascii());

const events = require("./event-emitter");
let subnet = "community.3";
//utils.changeLogLevel("debug");
console.log(`Using subnet: ${subnet}`);
var globalGameId = 130;
var globalStep = 1;
var globalTurn = "w";

var ListenerCalculationCompleted = async function ListenerCalculationCompleted(
  data
) {
  console.log(
    "calculation_completed executed. " + JSON.stringify(data, null, 4)
  );

  chess.move(data.bestmove.move, { sloppy: true });

  console.log(
    "--------------------- docker image calculation (depth:" +
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
    var success = await PerformGolemCalculations(
      { turnId: globalTurn, gameId: globalGameId, gameStep: globalStep, chess },
      subnet
    );
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
};

var ListenerAgreementConfirmed = function ListenerAgreementConfirmed(data) {
  false &&
    console.log(
      "agreement_confirmed executed. " + JSON.stringify(data, null, 4)
    );
  ChessServer.agreementConfirmed(data);
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

var workerFailed = function workerFailed(data) {
  //false &&
  console.log(
    "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!  worker failed. " +
      JSON.stringify(data, null, 4)
  );
  ChessServer.workerFailed(data);
};

events.addListener("computation_finished", ListenerComputationFinished);
events.addListener("agreement_created", ListenerAgreementCreated);
events.addListener("agreement_confirmed", ListenerAgreementConfirmed);
events.addListener("calculation_requested", ListenerCalculationRequested);
events.addListener("calculation_started", ListenerCalculationStarted);
events.addListener("calculation_completed", ListenerCalculationCompleted);
events.addListener("worker_failed", workerFailed);

events.on("", (data) => console.log("lalalalala" + data));

PerformGolemCalculations(
  { turnId: globalTurn, gameId: globalGameId, gameStep: globalStep, chess },
  subnet
);

/*

xxx = async () =>{  while(true)
    {
      var success = await 
      if(success)
      {
         console.log("*** PerformGolemCalculations succeeded")
         break;
      }else{
         console.log("*** PerformGolemCalculations failed... restarting")
      }
   }
}
xxx();*/

function myFunc(arg) {
  ChessServer.sendChessMove("test");
}

//setInterval(myFunc, 3500, "funky");
