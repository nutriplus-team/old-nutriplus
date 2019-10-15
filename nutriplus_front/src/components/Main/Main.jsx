import React, { Component } from "react";

class Main extends Component {
  state = {};

  componentDidMount = async () => {
    let token = localStorage.getItem("stored_token");
    const res = await fetch("http://localhost:8080/foods/list-foods/", {
      method: "get",
      headers: new Headers({
        Authorization: "Port " + token,
        "Content-Type": "application/json"
      })
    });
    console.log(res);
    const info = await res.json();
    console.log(info);
    if (info[0]) this.setState({ res: info[0].food_name });
  };
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
