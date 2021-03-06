import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import {
  Button,
  Form,
  Grid,
  Header,
  Message,
  Segment
} from "semantic-ui-react";

class Login extends Component {
  state = {};

  login = async () => {
    const res = await fetch("http://localhost:8080/user/login/", {
      method: "post",
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password
      }),
      headers: new Headers({ "Content-Type": "application/json" })
    });
    const answ = await res;
    const info = await answ.json();
    if (answ.status === 400) {
      this.setState({ wrong_input: "Usuário ou senha incorretos." });
    } else if (answ.status === 200) {
      this.setState({ wrong_input: "" });
      console.log(info);
      this.props.updateLogin();
      console.log(this.state.token);
      localStorage.setItem("stored_token", info.token);
      localStorage.setItem("stored_refresh", info.refresh);
      localStorage.setItem("stored_auth", 1);
    }
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
            Faça seu login abaixo
          </Header>
          <Form size="large">
            <Segment stacked>
              <Form.Input
                fluid
                icon="user"
                iconPosition="left"
                placeholder="Nome de usuário"
                onChange={event => {
                  this.setState({ username: event.target.value });
                }}
              />
              <Form.Input
                fluid
                icon="lock"
                iconPosition="left"
                placeholder="Senha"
                type="password"
                onChange={event => {
                  this.setState({ password: event.target.value });
                }}
              />

              <Button color="teal" fluid size="large" onClick={this.login}>
                Login
              </Button>
              <p>{this.state.wrong_input}</p>
            </Segment>
          </Form>
          <Message>
            Acabou de chegar? <NavLink to="/subscription">Inscreva-se!</NavLink>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Login;
