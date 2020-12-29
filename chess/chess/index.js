const {PerformGolemCalculations} = require("./chess");





const events = require("./event-emitter");
const { eventNames } = require("./event-emitter");


let subnet="community.3";
//utils.changeLogLevel("debug");
console.log(`Using subnet: ${subnet}`);
var globalGameId=123;
var globalStep=1;
var globalTurn="w"




var ListenerCalculationCompleted = function ListenerCalculationCompleted(data) {
    console.log('calculation_completed executed. ' + JSON.stringify(data, null, 4));

    globalStep++;
    globalTurn = globalTurn==="w"?"b":"w";
    PerformGolemCalculations({turnId:globalTurn,gameId:globalGameId,gameStep:globalStep}, subnet);

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

 PerformGolemCalculations({turnId:globalTurn,gameId:globalGameId,gameStep:globalStep}, subnet);