const express = require("express");
const https = require("https");
const fs = require("fs");
const ChessGame = require("./chess-game");
const events = require("../sockets/event-emitter");
const { runInThisContext } = require("vm");

events.setMaxListeners(100);
class GamesManager {
    constructor(chessServer) {
        this.currentGameId = 0;
        this.games = [];
        this.chessServer = chessServer;
        events.addListener("agreement_created", this.agreementCreated);
        events.addListener("offers_received", this.offersReceived);
        events.addListener("agreement_confirmed", this.agreementConfirmed);
        events.addListener("calculation_requested", this.calculationRequested);
        events.addListener("computation_started", this.computationStarted);
        events.addListener("calculation_started", this.calculationStarted);
        events.addListener("calculation_completed", this.calculationCompleted);
        events.addListener("computation_finished", this.computationFinished);
        events.addListener("invoice_received", this.invoiceReceived);
        events.addListener("provider_failed", this.providerFailed);
    }

    startSampleGame = () => {
        this.currentGameId++;
        this.addGame(this.currentGameId)?.start();
    };

    addGame = (id) => {
        if (this.getGame(id) !== undefined) return undefined;
        const game = new ChessGame(id, this.chessServer);
        this.games.push(game);
        return game;
    };
    getGame = (id) => {
        return this.games.find((x) => x.id === id);
    };

    calculationCompleted = async function ListenerCalculationCompleted(data) {
        const { gameId } = data;
        this.debugLog("calculationCompleted", data);
        this.Games.find((x) => x.id === gameId)?.calculationCompleted(data);
    };

    agreementCreated = (data) => {
        const { gameId } = data;
        this.debugLog("agreementCreated", data);
        this.games.find((x) => x.id === gameId)?.agreementCreated(data);
    };

    computationFinished = (data) => {
        const { gameId } = data;
        this.debugLog("computationFinished", data);
        this.games.find((x) => x.id === gameId)?.computationFinished(data);
    };

    agreementConfirmed = (data) => {
        const { gameId } = data;
        this.debugLog("agreementConfirmed", data);
        this.games.find((x) => x.id === gameId)?.agreementConfirmed(data);
    };

    calculationStarted = (data) => {
        const { gameId } = data;
        this.debugLog("calculationStarted", data);
        this.games.find((x) => x.id === gameId)?.calculationStarted(data);
    };

    calculationRequested = (data) => {
        const { gameId } = data;
        this.debugLog("calculationRequested", data);
        this.games.find((x) => x.id === gameId)?.calculationRequested(data);
    };

    providerFailed = (data) => {
        const { gameId } = data;
        this.debugLog("providerFailed", data);
        this.games.find((x) => x.id === gameId)?.providerFailed(data);
    };
    invoiceReceived = (data) => {
        const { gameId } = data;
        this.debugLog("invoiceReceived", data);
        this.games.find((x) => x.id === gameId)?.invoiceReceived(data);
    };
    computationStarted = (data) => {
        const { gameId } = data;
        this.debugLog("computationStarted", data);
        this.games.find((x) => x.id === gameId)?.computationStarted(data);
    };
    offersReceived = (data) => {
        const { gameId } = data;
        this.debugLog("offersReceived", data);
        this.games.find((x) => x.id === gameId)?.offersReceived(data);
    };

    debugLog = (functionName, data) => {
        console.log(` GamesManager::${functionName} ` + JSON.stringify(data, null, 4));
    };

    getFuncName = () => {
        return this.getFuncName.caller.name;
    };
}

module.exports = GamesManager;
