import React, { Component } from "react";
import "./App.css";
import Login from "./components/login_page/login_page";

class App extends Component {
  state = {};

  componentDidMount = () => {};

  render() {
    return (
      <div className="App">
          <Login></Login>
      </div>
    );
  }
}

export default App;
