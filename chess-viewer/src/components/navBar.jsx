import React, { Component } from "react";
import socket from "./../services/socketService";
import SignalStrengthIcon from "./common/socketsio/signalStrengthIcon";
import { withRouter } from "react-router-dom";

class NavBar extends Component {
  state = {
    collapsed: true,
    signalValue: 0,
    connectionAdditionalText: "",
    forceSignalVisible: false,
    intervalId: undefined,
    currentCount: 10,
    intervalEnabled: false,
    reconnectSeconds: 10,
    navBarVisible: true,
  };
  toastId = null;
  unmounting = false;

  user = null;
  jwt = null;
  componentDidMount() {
    socket.on("disconnect", this.handleDisconnect);
    socket.on("moveEvent", this.handleMoveEvent);
    socket.on("connect", this.handleConnect);
    socket.on("reconnect", this.handleConnect);
  }

  handleMoveEvent = (params) => {
    const { move } = params;
    console.log("move: " + move);
  };
  handleEvent = (params) => {};

  handleConnect = (param) => {
    socket.sendBuffer = [];
    if (this.unmounting) return;

    socket.emit(
      "join",
      { login: "default", room: "chess", jwt: "default" },
      (param) => {
        console.log("entered room..." + param);
        console.log(param);
      }
    );
    this.setState({ signalValue: 1, connectionAdditionalText: "" });
    this.clearInterval();
  };
  handleDisconnect = (param) => {
    if (this.unmounting) return;
    this.setState({ signalValue: 0 });

    if (!this.unmounting) {
      var intervalId = setInterval(this.timer, 1000);
      this.setState({
        signalValue: 0,
        intervalId,
        currentCount: this.state.reconnectSeconds,
        intervalEnabled: true,
      });
    }
  };
  closeSocketConnection() {
    socket.removeListener("sendEvent", this.handleEvent);
    socket.removeListener("connect", this.handleConnect());
    socket.removeListener("reconnect", this.handleConnect());
    socket.removeListener("disconnect", this.handleDisconnect);
    socket.emit("disconnect");
    this.setState({ signalValue: 0 });
    socket.disconnect();
    this.clearInterval();
  }
  componentWillUnmount() {
    this.unmounting = true;
    this.closeSocketConnection();
  }

  clearInterval = () => {
    if (this.state.intervalId) clearInterval(this.state.intervalId);
    this.setState({ intervalEnabled: false, currentCount: 10 });
  };

  timer = () => {
    let { currentCount, intervalEnabled, reconnectSeconds } = this.state;

    if (!intervalEnabled) return this.clearInterval();

    if (--currentCount < -3) currentCount = reconnectSeconds;

    if (currentCount <= 0) socket.open();

    this.setState({
      currentCount,
      connectionAdditionalText:
        currentCount > 0
          ? `Trying to connect in ${currentCount} seconds...`
          : "Trying to connect to server...",
    });
  };

  toggleNavbar = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  Menus = [{}];

  render() {
    return (
      this.state.navBarVisible && (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark w-100">
          <SignalStrengthIcon
            label=""
            signalValue={this.state.signalValue}
            additionalText={this.state.connectionAdditionalText}
          />{" "}
          <h4 style={{ margin: 0, marginLeft: 20, color: "white" }}>
            Chess on Golem
          </h4>
        </nav>
      )
    );
  }
}

export default withRouter(NavBar);
