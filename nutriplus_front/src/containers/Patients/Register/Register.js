import React, { Component } from "react";
import { Button, Form, Grid, Header, Segment, Icon } from "semantic-ui-react";
import classes from "./Register.module.css";

class Register extends Component {
  state = {
    name: "",
    dob: "",
    restrictions: [],
    restrictionQuery: "",
    queryResults: null,
    message: "",
    hasNext: false,
    hasPrevious: false
  };

  register = async () => {
    const day = +this.state.dob.slice(0, 2);
    const month = +this.state.dob.slice(3, 5);
    const year = +this.state.dob.slice(6);
    if (day === 0 || month === 0 || month > 12) {
      this.setState({ message: "Data inválida" });
      return;
    } else if (
      (month < 8 && month % 2 === 1) ||
      (month >= 8 && month % 2 === 0)
    ) {
      if (day > 31) {
        this.setState({ message: "Data inválida" });
        return;
      }
    } else if (month === 2) {
      if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        if (day > 29) {
          this.setState({ message: "Data inválida" });
          return;
        }
      } else {
        if (day > 28) {
          this.setState({ message: "Data inválida" });
          return;
        }
      }
    } else if (day > 30) {
      this.setState({ message: "Data inválida" });
      return;
    }
    if (this.state.name.length === 0) {
      this.setState({ message: "Não há nome!" });
      return;
    }
    console.log(
      JSON.stringify({
        patient: this.state.name,
        date_of_birth: this.state.dob,
        food_restrictions: this.state.restrictions.reduce(
          (total, actual, index, arr) =>
            total + actual.id + (index === arr.length - 1 ? "" : "&"),
          ""
        )
      })
    );
    const res = await fetch("http://localhost:8080/patients/add-new/", {
      method: "post",
      body: JSON.stringify({
        patient: this.state.name,
        date_of_birth: this.state.dob,
        food_restrictions: this.state.restrictions.reduce(
          (total, actual, index, arr) =>
            total + actual.id + (index === arr.length - 1 ? "" : "&"),
          ""
        )
      }),
      headers: new Headers({
        Authorization: "Port " + localStorage.getItem("stored_token"),
        "Content-Type": "application/json"
      })
    });
    console.log(res);
    const info = await res.json();
    if (res.status === 400) {
      this.setState({ message: "Houve um erro no cadastro." });
      console.log(info);
    } else if (res.status === 200) {
      this.setState({
        message: "Cadastro realizado com sucesso!",
        name: "",
        dob: "",
        restrictionQuery: "",
        restrictions: [],
        likedFoods: "",
        queryResults: null
      });
      console.log(info);
    } else if (res.status === 401) {
      this.setState({
        message: "A sua sessão expirou! Por favor dê logout e login de novo."
      });
      //   const res2 = await fetch("http://localhost:8080/user/token/refresh/", {
      //     method: "post",
      //     body: JSON.stringify({
      //       refresh: localStorage.getItem("stored_refresh")
      //     }),
      //     headers: new Headers({
      //       "Content-Type": "application/json"
      //     })
      //   });
      //   const info2 = await res2.json();
      //   console.log(info2);
      //   localStorage.setItem("stored_token", info2.access);
      //   this.setState({ message: "Sessão restaurada!" });
    }
  };

  // use as handleChangePage("next") or handleChangePage("previous")
  handleChangePage = async str => {
    const res = await fetch(this.state.queryResults[str], {
      method: "get",
      headers: new Headers({
        Authorization: "Port " + localStorage.getItem("stored_token")
      })
    });
    console.log(res);
    const info = await res.json();
    if (res.status === 400) {
      this.setState({ message: "Houve um erro no cadastro." });
      console.log(info);
    } else if (res.status === 200) {
      this.setState({
        queryResults: info
      });
      if (info.previous) {
        this.setState({ hasPrevious: true });
      } else {
        this.setState({ hasPrevious: false });
      }
      if (info.next) {
        this.setState({ hasNext: true });
      } else {
        this.setState({ hasNext: false });
      }
      console.log(info);
    } else if (res.status === 401) {
      this.setState({
        message: "A sua sessão expirou! Por favor dê logout e login de novo."
      });
    }
  };

  handlefoodClick = food => {
    this.setState(prevState => ({
      restrictions: [...prevState.restrictions, food],
      restrictionQuery: "",
      queryResults: null
    }));
  };

  render() {
    return (
      <Grid
        textAlign="center"
        style={{ height: "10vh" }}
        verticalAlign="middle"
      >
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h2" color="teal" textAlign="center">
            Insira as informações do paciente abaixo
          </Header>
          <Form size="large">
            <Segment stacked>
              <Form.Input
                icon="id card outline"
                iconPosition="left"
                placeholder="Nome do paciente"
                onChange={event => {
                  this.setState({ name: event.target.value, message: "" });
                }}
                value={this.state.name}
              />
              <Form.Input
                icon="calendar"
                iconPosition="left"
                placeholder="DD/MM/YYYY"
                value={this.state.dob}
                // TODO: make this update function foolproof
                onChange={event => {
                  const inputDob = event.target.value;
                  const actualIndex = this.state.dob.length;
                  if (inputDob.length > actualIndex) {
                    const lastChar = inputDob[actualIndex];
                    if (lastChar < "0" || lastChar > "9") {
                      return;
                    }
                    if (actualIndex === 2 || actualIndex === 5) {
                      // First month digit or year digit was just filled
                      this.setState({
                        dob: inputDob.slice(0, -1) + "/" + inputDob.slice(-1)
                      });
                      return;
                    }
                    if (actualIndex === 10) {
                      // Date should be finished
                      return;
                    }
                  }
                  // If I didn't return up until now, I should just set state to the input
                  this.setState({ dob: inputDob, message: "" });
                }}
              />
              <Form.Input
                icon="search"
                iconPosition="left"
                placeholder="Restrições alimentares (opcional)"
                onChange={async event => {
                  this.setState({
                    restrictionQuery: event.target.value,
                    message: ""
                  });
                  if (event.target.value !== "") {
                    const res = await fetch(
                      "http://localhost:8080/foods/search/" +
                        event.target.value +
                        "/",
                      {
                        method: "get",
                        headers: new Headers({
                          Authorization:
                            "Port " + localStorage.getItem("stored_token")
                        })
                      }
                    );
                    console.log(res);
                    const info = await res.json();
                    if (res.status === 400) {
                      this.setState({ message: "Houve um erro no cadastro." });
                      console.log(info);
                    } else if (res.status === 200) {
                      this.setState({
                        queryResults: info
                      });
                      if (info.next) {
                        this.setState({ hasNext: true });
                      } else {
                        this.setState({ hasNext: false });
                      }
                      this.setState({ hasPrevious: false });
                      console.log(info);
                    } else if (res.status === 401) {
                      this.setState({
                        message:
                          "A sua sessão expirou! Por favor dê logout e login de novo."
                      });
                    }
                  } else {
                    this.setState({ queryResults: null });
                  }
                }}
                value={this.state.restrictionQuery}
              />
              {this.state.restrictions.length === 0 ? null : (
                <ul>
                  {this.state.restrictions.map(food => (
                    <li key={food.id}>{food.food_name}</li>
                  ))}
                </ul>
              )}
              {this.state.queryResults ? (
                <React.Fragment>
                  <hr />
                  {this.state.queryResults.results
                    .filter(
                      food =>
                        !this.state.restrictions.some(
                          state_food => state_food.food_name == food.food_name
                        )
                    )
                    .map(obj => (
                      <p
                        key={obj.id}
                        className={classes.Food}
                        onClick={() => this.handlefoodClick(obj)}
                      >
                        {obj.food_name}
                      </p>
                    ))}
                  <Button
                    onClick={() => this.handleChangePage("previous")}
                    icon
                    floated="left"
                    size="mini"
                    disabled={!this.state.hasPrevious}
                  >
                    <Icon name="angle double left" />
                  </Button>

                  <Button
                    onClick={() => this.handleChangePage("next")}
                    disabled={!this.state.hasNext}
                    icon
                    floated="right"
                    size="mini"
                  >
                    <Icon name="angle double right" />
                  </Button>
                </React.Fragment>
              ) : null}
              <Button color="teal" fluid size="large" onClick={this.register}>
                Registrar paciente
              </Button>
              <p>{this.state.message}</p>
            </Segment>
          </Form>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Register;
