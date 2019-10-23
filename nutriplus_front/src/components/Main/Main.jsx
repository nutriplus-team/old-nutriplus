import React, { Component } from "react";

class Main extends Component {
  state = {};

  componentDidMount = async () => {};
  render() {
    let res = this.state.res;
    if (res)
      return (
        <div>
          <p>Placeholder for main</p>
          <p>{res}</p>
        </div>
      );
    else return "";
  }
}

export default Main;
