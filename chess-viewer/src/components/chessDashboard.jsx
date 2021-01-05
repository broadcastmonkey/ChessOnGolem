import React, { Component } from "react";
import Chessboard from "chessboardjsx";
import socket from "./../services/socketService";
import { toast } from "react-toastify";
/*import { getMockMoves } from "../services/mockMovesService";*/
import MovesTable from "./movesTable";
import "./chessDashboard.css";
import { Card } from "react-bootstrap";

class ChessDashboard extends Component {
  state = {
    fen: "start",
    statusBar: "",
    turn: "white",
    statusColor: "info",
    moveNumber: 1,
    depth: 1,
    status: "...",
    statusStats: "...",
    taskId: "",
    gameId: "",
    intervalEnabled: false,
    secondsComputing: 0,
    intervalId: 0,
    moves: [] /*getMockMoves(22),*/,

    white_stats: {
      total_moves: 0,
      avg_depth: 0,
      total_vm_time: 0,
      avg_vm_time: 0,
      avg_golem_time: 0,
      best_golem_time: 0,
      total_time: 0,
      total_cost: 0,
    },
    black_stats: {
      total_moves: 0,
      avg_depth: 0,
      total_vm_time: 0,
      total_time: 0,
      total_cost: 0,
      avg_vm_time: 0,
      avg_golem_time: 0,
      best_golem_time: 0,
    },
  };
  PlayerEnum = Object.freeze({
    white: 1,
    black: 2,
  });
  StatusEnum = Object.freeze({
    none: 1,
    searching: 2,
    provider_confirmed: 3,
    finished: 4,
    game_end: 5,
    wednesday: 6,
  });
  status = this.StatusEnum.none;

  confirmedWorkers = 0;
  resetTimer = () => {
    this.setState({ secondsComputing: 0 });
  };

  startTimer = () => {
    if (this.intervalId !== 0) {
      this.stopTimer();
    }
    var intervalId = setInterval(this.timer, 1000);
    this.setState({
      intervalId,
      intervalEnabled: true,
    });
  };

  stopTimer = () => {
    if (this.state.intervalId) clearInterval(this.state.intervalId);
    this.setState({ intervalEnabled: false });
  };

  timer = () => {
    let { secondsComputing, intervalEnabled } = this.state;

    if (!intervalEnabled) return this.stopTimer();
    secondsComputing++;
    this.setState({
      secondsComputing,
    });
  };

  componentDidMount() {
    socket.on("currentTurnEvent", this.handleCurrentTurnEvent);
    socket.on("gameFinished", this.handleGameFinished);
    socket.on("positionEvent", this.handlePositionEvent);
    socket.on("moveEvent", this.handleMoveEvent);
    socket.on("providerFailed", this.handleProviderFailed);
    socket.on("agreementCreated", this.handleAgreementCreated);
    socket.on("agreementConfirmed", this.handleAgreementConfirmed);
    socket.on("computationStarted", this.handleComputationStarted);
    socket.on("computationFinished", this.handleComputationFinished);
    socket.on("offersReceived", this.handleOffersReceived);
    socket.on("movesRefreshed", this.handleMovesRefreshed);
  }
  handleGameFinished = (params) => {
    const { winner, type } = params;
    this.status = this.StatusEnum.game_end;
    this.setState({
      status: "Game Finished!",
      statusStats: type === "draw" ? "DRAW" : winner + " PLAYER WINS",
    });
  };

  defaultStatsObject = () => {
    return {
      total_moves: 0,
      avg_depth: 0,
      total_vm_time: 0,
      total_time: 0,
      total_cost: 0,
      avg_vm_time: 0,
      avg_golem_time: 0,
      best_golem_time: 0,
    };
  };

  getStats = (moves, turn) => {
    if (
      moves.length === 0 ||
      moves.filter((x) => x.turn === turn && x.move !== undefined).length === 0
    ) {
      return this.defaultStatsObject();
    }

    let stats = {};
    stats.total_moves = moves.filter(
      (x) => x.turn === turn && x.move !== undefined
    ).length;
    stats.avg_depth =
      moves
        .filter((x) => x.turn === turn && x.move !== undefined)
        .map((x) => x.depth)
        .reduce((a, c) => a + c) / stats.total_moves;
    stats.total_vm_time = moves
      .filter((x) => x.turn === turn && x.move !== undefined)
      .map((x) => parseFloat(x.vm_time) / 1000)
      .reduce((a, c) => a + c)
      .toFixed(3);
    stats.total_time = moves
      .filter((x) => x.turn === turn && x.move !== undefined)
      .map((x) =>
        x.total_time === undefined ? 0.0 : parseFloat(x.total_time) / 1000
      )
      .reduce((a, c) => a + c)
      .toFixed(3);

    stats.avg_vm_time = (stats.total_vm_time / stats.total_moves).toFixed(3);
    stats.avg_golem_time = (stats.total_time / stats.total_moves).toFixed(3);
    stats.best_golem_time = Math.min(
      ...moves
        .filter((x) => x.turn === turn && x.move !== undefined)
        .map((x) =>
          x.total_time === undefined ? 9999.0 : parseFloat(x.total_time) / 1000
        )
    ).toFixed(3);
    if (stats.best_golem_time == 9999.0) stats.best_golem_time = "-";

    stats.total_cost = moves
      .filter((x) => x.turn === turn && x.move !== undefined)
      .map((x) => (x.cost === undefined ? 0.0 : parseFloat(x.cost)))
      .reduce((a, c) => a + c);
    return stats;
  };

  handleMovesRefreshed = (incoming) => {
    let moves = [];
    for (const [key, value] of Object.entries(incoming)) {
      moves.push(value);
    }

    console.log("moves");
    console.log(moves);

    this.setState({
      moves,
      black_stats: this.getStats(moves, "black"),
      white_stats: this.getStats(moves, "white"),
    });
  };

  handleOffersReceived = (params) => {
    const { offersCount, taskId } = params;
    if (this.state.taskId !== taskId) return;
    if (this.status === this.StatusEnum.searching) {
      this.setState({
        statusStats: `${offersCount} proposals received...`,
      });
    }
  };

  handleCurrentTurnEvent = (params) => {
    const { taskId, gameStep: moveNumber, turnId, depth } = params;
    this.setState({
      taskId,
      moveNumber,
      turn: turnId === "w" ? "white" : "black",
      depth,
    });
    console.log("current turn event");
    console.log(params);
    this.resetTimer();
    this.startTimer();
  };
  handleComputationStarted = (params) => {
    console.log("started started started");
    const { taskId } = params;
    if (this.state.taskId !== taskId) return;
    this.status = this.StatusEnum.searching;
    this.setState({
      status: "searching for best offer...",
      statusStats: "offer is in the market...",
    });
  };
  handleComputationFinished = (params) => {
    console.log("computation finished !! ");
    console.log(params);
    const { taskId, time } = params;
    //if (this.state.taskId !== taskId) return;
    let timeInSec = Math.round(time / 1000);
    toast.info(
      `computation with task_id: ${taskId} \nfinished in : ${time} + ms  \n(~ ${timeInSec}s )`
    );
  };
  handleAgreementConfirmed = (params) => {
    const { taskId, providerName } = params;
    this.confirmedWorkers++;
    console.log("confirmed workers: " + this.confirmedWorkers);
    if (this.state.taskId !== taskId) return;
    this.status = this.StatusEnum.provider_confirmed;
    console.log("agreement confirmed...");
    console.log(params);
    this.setState({
      status: "provider: " + providerName,
      statusStats: "computing best move on provider's VM",
    });
  };
  handleAgreementCreated = (params) => {
    const { taskId, providerName } = params;
    if (this.state.taskId !== taskId) return;
    console.log("agreement created...");
    console.log(params);
    this.setState({
      statusStats: "agreement created with provider: " + providerName,
    });
  };
  handlePositionEvent = (params) => {
    console.log("position event...");
    console.log(params);
    const { fen } = params;
    console.log("chess pos", fen);
    this.setState({ fen });
  };
  handleMoveEvent = (bestmove) => {
    const { move, depth, time } = bestmove;
    console.log("move event...");
    console.log(move);
    if (move !== "test")
      toast.info("move : " + move + "\ndepth : " + depth + "\ntime: " + time);
  };
  handleProviderFailed = (provider) => {
    const { taskId, providerName } = provider;
    if (this.state.taskId !== taskId) return;
    console.log("provider failed...");
    console.log(provider);
    if (provider !== "test") toast.error("provider failed : " + providerName);
  };

  renderTable = () => {
    let moves = this.state.moves;

    return <MovesTable users={moves} />;
  };
  renderChessBoard = () => {
    return (
      <Chessboard
        width={512}
        id="random"
        position={this.state.fen}
        transitionDuration={300}
        boardStyle={{
          borderRadius: "5px",
          boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`,
        }}
      />
    );
  };
  getTextColor() {
    let variant = this.state.statusColor;
    if (variant === "light" || variant === "warning") return "dark";
    return "light";
  }
  renderHeader = () => {
    let variant = this.state.statusColor;
    return (
      <Card
        bg={variant.toLowerCase()}
        text={this.getTextColor()}
        style={{ width: "512" }}
        className="mb-2 mt-2"
      >
        <Card.Header>
          <b>Turn: {this.state.turn.toUpperCase()}</b>
          <b className="ml-5">Move number: {this.state.moveNumber}</b>
          <b className="ml-5">Algorithm Depth: {this.state.depth}</b>

          <b className="ml-5"> {this.state.secondsComputing}s</b>
          <b className="ml-5"> task id: {this.state.taskId}</b>
        </Card.Header>
        <Card.Body>
          <Card.Title>
            <h3>{this.state.status} </h3>
          </Card.Title>
          <Card.Text>
            <h3>{this.state.statusStats}</h3>
          </Card.Text>
        </Card.Body>
      </Card>
    );
  };

  renderPlayerCard(player) {
    const stats =
      player === this.PlayerEnum.white
        ? this.state.white_stats
        : this.state.black_stats;

    return (
      <Card
        bg={player === this.PlayerEnum.white ? "light" : "dark"}
        text={player === this.PlayerEnum.white ? "dark" : "light"}
        style={{ width: "512" }}
        className="mb-2 mt-2"
      >
        <Card.Header>
          <center>
            <b>{player === this.PlayerEnum.white ? "WHITE" : "BLACK"}</b>{" "}
          </center>
        </Card.Header>
        <Card.Body>
          <Card.Title>Statistics: </Card.Title>
          <Card.Text>
            <i>total moves:</i> <b>{stats.total_moves}</b>
            <br />
            <i>avg depth:</i> <b>{stats.avg_depth}</b>
            <br />
            <i>total vm time:</i> <b>{stats.total_vm_time}s</b>
            <br />
            <i>avg vm time:</i> <b>{stats.avg_vm_time}s</b>
            <br />
            <i>total golem time:</i> <b>{stats.total_time}s</b>
            <br />
            <i>avg golem time:</i> <b>{stats.avg_golem_time}s</b>
            <br />
            <i>best golem time:</i> <b>{stats.best_golem_time}s</b>
            <br />
            <i>total golem cost:</i> <b>{stats.total_cost}</b>
            <br />
          </Card.Text>
        </Card.Body>
      </Card>
    );
  }

  renderPlayerCards = () => {
    return (
      <div>
        <div className="card-left">
          {this.renderPlayerCard(this.PlayerEnum.white)}
        </div>
        <div className="card-right">
          {" "}
          {this.renderPlayerCard(this.PlayerEnum.black)}
        </div>
      </div>
    );
  };

  render() {
    return (
      <div>
        <div>{this.renderHeader()}</div>
        <div className="chess-wrapper">
          <div className="chess-board">
            <div>{this.renderChessBoard()}</div>
            <div>{this.renderPlayerCards()}</div>
          </div>
          <div className="chess-table">
            <div>{this.renderTable()}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default ChessDashboard;
