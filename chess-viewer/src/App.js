import React, { Component } from "react";
import { ToastContainer } from "react-toastify";
import { Route, Redirect, Switch } from "react-router-dom";
import NavBar from "./components/navBar";

// import logo from "./logo.svg";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import NotFound from "./components/notFound";

import ChessDashboard from "./components/chessDashboard";

class App extends Component {
  state = {};

  componentDidMount() {}
  render() {
    let speedway = "container-fluid";
    //speedway += document.location.pathname.includes("speedway") ? "2" : "";

    return (
      <React.Fragment>
        <ToastContainer />

        <main className={speedway}>
          <NavBar />{" "}
          <Switch>
            {/* <Route path="/register" component={RegisterForm} /> */}

            <Route path="/chess" component={ChessDashboard} />

            <Route path="/not-found" component={NotFound} />
            <Route path="/" exact component={ChessDashboard} />
            <Redirect to="/not-found" />
          </Switch>
        </main>
      </React.Fragment>
    );
  }
}

export default App;
