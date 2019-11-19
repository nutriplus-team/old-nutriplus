import React, { Component } from "react";
import "./App.css";
import { Route, Switch, Redirect } from "react-router-dom";
import Login from "./containers/login_page/login_page";
import Toolbar from "./components/Navigation/Toolbar/Toolbar";
import Patients from "./containers/Patients/Patients";
import FoodSuggestions from "./components/FoodSuggestions/FoodSuggestions";
import Main from "./components/Main/Main";
import Logout from "./containers/Logout/Logout";
import Subscribe from "./containers/Subscribe/Subscribe";
import FoodDatabaseEditor from "./containers/FoodDatabaseEditor/FoodDatabaseEditor";

class App extends Component {
  state = { isAuthenticated: false };

  componentDidMount = async () => {
    let isAuthenticated = localStorage.getItem("stored_auth") || false;
    if (isAuthenticated === "1") {
      await new Promise(resolve => {
        this.setState({ isAuthenticated: true }, () => {
          resolve();
        });
      });
    }
    console.log(localStorage.getItem("stored_token"));
  };

  loginHandler = () => {
    this.setState({ isAuthenticated: true });
  };

  logoutHandler = async () => {
    await new Promise(resolve => {
      localStorage.setItem("stored_token", "");
      localStorage.setItem("stored_refresh", "");
      localStorage.setItem("stored_auth", false);
      this.setState({ isAuthenticated: false }, () => {
        resolve();
      });
    });
  };

  render() {
    let routes = (
      <Switch>
        <Route
          path="/auth"
          render={props => <Login {...props} updateLogin={this.loginHandler} />}
        />
        <Route
          path="/subscription"
          render={props => <Subscribe {...props} />}
        />
        <Route path="/" exact component={Main} />
        <Redirect to="/" />
      </Switch>
    );

    if (this.state.isAuthenticated) {
      routes = (
        <Switch>
          <Route path="/pacientes" render={props => <Patients {...props} />} />
          <Route
            path="/cardapio"
            render={props => <FoodSuggestions {...props} />}
          />
          <Route
            path="/alimentos"
            render={props => <FoodDatabaseEditor {...props} />}
          />
          <Route
            path="/logout"
            render={props => (
              <Logout {...props} updateLogout={this.logoutHandler} />
            )}
          />
          <Route path="/" exact component={Main} />
          <Redirect to="/" />
        </Switch>
      );
    }
    return (
      <div className="App">
        <Toolbar isAuth={this.state.isAuthenticated} />
        <br></br>
        <br></br>
        <br></br>
        {routes}
      </div>
    );
  }
}

export default App;
