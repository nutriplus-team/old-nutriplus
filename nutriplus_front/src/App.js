import React, { Component } from "react";
import "./App.css";
import { Route, Switch, withRouter, Redirect } from "react-router-dom";
import Login from "./containers/login_page/login_page";
import Toolbar from "./components/Navigation/Toolbar/Toolbar";
import Patients from "./components/Patients/Patients";
import FoodSuggestions from "./components/FoodSuggestions/FoodSuggestions";
import Main from "./components/Main/Main";
import Logout from "./components/Logout/Logout";

class App extends Component {
  state = { isAuthenticated: false };

  componentDidMount = () => {};

  loginHandler = () => {
    this.setState({ isAuthenticated: true });
  };

  render() {
    let routes = (
      <Switch>
        <Route path="/auth" component={Login} />{" "}
        {/* FIXME: Change to real login page */}
        <Route path="/" exact component={Main} />
        <Redirect to="/" />
      </Switch>
    );

    if (this.state.isAuthenticated) {
      routes = (
        <Switch>
          <Route path="/pacientes" component={Patients} />
          <Route path="/cardapio" component={FoodSuggestions} />
          <Route path="/logout" component={Logout} />
          {/* FIXME: correct Logout component */}
          <Route path="/" exact component={Main} />
          <Redirect to="/" />
        </Switch>
      );
    }
    return (
      <div className="App">
        <Toolbar isAuth={this.state.isAuthenticated} />
        <Login loginSetter={this.loginHandler}></Login>
        {routes}
        {/* FIXME: put login in routes */}
      </div>
    );
  }
}

export default withRouter(App);
