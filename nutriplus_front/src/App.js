import React, { Component } from "react";
import "./App.css";
import { Route, Switch, withRouter, Redirect } from "react-router-dom";
import Login from "./containers/login_page/login_page";
import Toolbar from "./components/Navigation/Toolbar/Toolbar";
import Patients from "./components/Patients/Patients";
import FoodSuggestions from "./components/FoodSuggestions/FoodSuggestions";
import Main from "./components/Main/Main";
import Logout from "./containers/Logout/Logout";

class App extends Component {
  state = { isAuthenticated: false };

  componentDidMount = () => {};

  loginHandler = () => {
    this.setState({ isAuthenticated: true });
  };

  logoutHandler = () => {
    this.setState({ isAuthenticated: false });
  };

  render() {
    let routes = (
      <Switch>
        <Route
          path="/auth"
          render={props => <Login {...props} updateLogin={this.loginHandler} />}
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
        <div style={{ position: "absolute", top: "56px" }}>{routes}</div>
      </div>
    );
  }
}

export default withRouter(App);
