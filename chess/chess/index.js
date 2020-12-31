const {PerformGolemCalculations} = require("./chess");
const { Chess } = require('chess.js')
const chess = new Chess();





console.log("chess: \n"+chess.ascii());



const events = require("./event-emitter");
const { eventNames } = require("./event-emitter");
const fs = require('fs'); 

let subnet="community.3";
//utils.changeLogLevel("debug");
console.log(`Using subnet: ${subnet}`);
var globalGameId=127;
var globalStep=1;
var globalTurn="w"




var ListenerCalculationCompleted = async function ListenerCalculationCompleted(data) {
    console.log('calculation_completed executed. ' + JSON.stringify(data, null, 4));

    chess.move(data.bestmove,{sloppy:true});

    globalStep++;
    globalTurn = globalTurn==="w"?"b":"w";


    console.log("====================\n\n"+chess.ascii()+"\n\n===================");

    if(chess.in_stalemate())
    {
       console.log("!!!! stalemate !!!!!");
       return;
    }

    if(chess.game_over())
    {
       console.log("!!!! game over !!!!!");
       return;
    }
    while(true)
    {
      var success = await PerformGolemCalculations({turnId:globalTurn,gameId:globalGameId,gameStep:globalStep,chess}, subnet);
      if(success)
      {
         console.log("*** PerformGolemCalculations succeeded")
         break;
      }else{
         console.log("*** PerformGolemCalculations failed... restarting")
      }
   }

 }

 var ListenerCalculationStarted = function ListenerCalculationStarted(data) {
    console.log('calculation_started executed. ' + JSON.stringify(data, null, 4));
 }

 var ListenerCalculationRequested = function ListenerCalculationRequested(data) {
    console.log('calculation_requested executed. ' + JSON.stringify(data, null, 4));
 }

events.addListener('calculation_requested', ListenerCalculationRequested);
events.addListener('calculation_started', ListenerCalculationStarted);
events.addListener('calculation_completed', ListenerCalculationCompleted);


events.on("",(data)=>console.log("lalalalala" + data));

 
PerformGolemCalculations({turnId:globalTurn,gameId:globalGameId,gameStep:globalStep,chess}, subnet);

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