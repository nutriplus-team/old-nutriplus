import React, { Component } from "react";
import {
  Button,
  Form,
  Grid,
  Header,
  Segment,
  TextArea
} from "semantic-ui-react";

class PatientRecordCreator extends Component {
  state = { patient: null, weight: "", height: "", obs: "", error: null };

  componentDidMount = async () => {
    const params = this.props.match.params;
    const res = await fetch(
      "http://localhost:8080/patients/get-info/" + params["id"] + "/",
      {
        method: "get",
        headers: new Headers({
          Authorization: "Port " + localStorage.getItem("stored_token")
        })
      }
    );
    const answ = await res;
    const info = await answ.json();
    if (answ.status === 400) {
      this.setState({
        error: "Houve algum problema ao tentar acessar a ficha do paciente!"
      });
      //console.log(answ);
      //console.log(info);
    } else if (answ.status === 200) {
      this.setState({ patient: info, error: null });
      //console.log(info);
    } else if (answ.status === 401) {
      this.setState({
        error: "A sua sessão expirou! Por favor dê logout e login de novo."
      });
    }
  };

  sendForm = async () => {
    const params = this.props.match.params;
    const BMI = +this.state.weight / (+this.state.height * +this.state.height);
    const res = await fetch(
      "http://localhost:8080/patients/add-record/" + params["id"] + "/",
      {
        method: "post",
        body: JSON.stringify({
          corporal_mass: (+this.state.weight).toFixed(2),
          height: (+this.state.height).toFixed(2),
          BMI: BMI.toFixed(2),
          observations: this.state.obs
        }),
        headers: new Headers({
          Authorization: "Port " + localStorage.getItem("stored_token"),
          "Content-Type": "application/json"
        })
      }
    );
    //console.log(res);
    const answ = await res;
    //const info = await answ.json();
    if (answ.status === 400) {
      this.setState({ message: "Houve um erro ao salvar a ficha." });
      //console.log(info);
    } else if (answ.status === 200) {
      this.setState({
        message: "Ficha salva com sucesso!",
        weight: "",
        height: "",
        obs: ""
      });
      //console.log(info);
    } else if (answ.status === 401) {
      this.setState({
        message: "A sua sessão expirou! Por favor dê logout e login de novo."
      });
    }
  };

  render() {
    return (
      <div>
        <h4>Paciente: {this.state.patient ? this.state.patient.name : null}</h4>
        {this.state.error ? <p>{this.state.error}</p> : null}
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
                  icon="weight"
                  iconPosition="left"
                  placeholder="Peso (em kg). Ex: 51.5"
                  onChange={event => {
                    for (const char of event.target.value) {
                      if ((char < "0" || char > "9") && char !== ".") return;
                    }
                    this.setState({ weight: event.target.value, message: "" });
                  }}
                  value={this.state.weight}
                />
                <Form.Input
                  icon="long arrow alternate up"
                  iconPosition="left"
                  placeholder="Altura(em m). Ex: 1.81"
                  value={this.state.height}
                  onChange={event => {
                    for (const char of event.target.value)
                      if ((char < "0" || char > "9") && char !== ".") return;
                    this.setState({ height: event.target.value, message: "" });
                  }}
                />
                <TextArea
                  placeholder="Observações"
                  onChange={event => {
                    this.setState({
                      obs: event.target.value,
                      message: ""
                    });
                  }}
                  value={this.state.obs}
                />
                <Button color="teal" fluid size="large" onClick={this.sendForm}>
                  Adicionar ficha
                </Button>
                <p>{this.state.message}</p>
              </Segment>
            </Form>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default PatientRecordCreator;
