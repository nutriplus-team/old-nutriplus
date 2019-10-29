import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { sendAuthenticatedRequest } from "../../../../utility/httpHelper";
import {
  Button,
  Form,
  Grid,
  Header,
  Segment,
  TextArea
} from "semantic-ui-react";

class PatientRecordCreator extends Component {
  state = {
    patient: null,
    weight: "",
    height: "",
    obs: "",
    message: null,
    editing: false,
    redirectUrl: null
  };

  componentDidMount = async () => {
    const params = this.props.match.params;
    sendAuthenticatedRequest(
      "http://localhost:8080/patients/get-info/" + params["id"] + "/",
      "get",
      message =>
        this.setState({
          message: message
        }),
      info => this.setState({ patient: info, message: null })
    );
    if (params["ficha_id"]) {
      sendAuthenticatedRequest(
        "http://localhost:8080/patients/get-single-record/" +
          params["ficha_id"] +
          "/",
        "get",
        message => this.setState({ message: message }),
        info => {
          this.setState({
            weight: info.corporal_mass,
            height: info.height,
            obs: info.observations
          });
        }
      );
      this.setState({ editing: true });
    }
  };

  sendForm = async () => {
    const params = this.props.match.params;
    const BMI = +this.state.weight / (+this.state.height * +this.state.height);
    if (
      +this.state.weight > 0.1 &&
      +this.state.height > 0.1 &&
      +this.state.weight < 1000 &&
      +this.state.height < 3
    ) {
      if (!this.state.editing) {
        sendAuthenticatedRequest(
          "http://localhost:8080/patients/add-record/" + params["id"] + "/",
          "post",
          message =>
            this.setState({
              message: message
            }),
          () =>
            this.setState({
              message: "Ficha salva com sucesso!",
              weight: "",
              height: "",
              obs: "",
              redirectUrl: "/pacientes/" + params["id"]
            }),
          JSON.stringify({
            corporal_mass: (+this.state.weight).toFixed(2),
            height: (+this.state.height).toFixed(2),
            BMI: BMI.toFixed(2),
            observations: this.state.obs
          })
        );
      } else {
        sendAuthenticatedRequest(
          "http://localhost:8080/patients/edit-record/" +
            params["ficha_id"] +
            "/",
          "post",
          message =>
            this.setState({
              message: message
            }),
          () =>
            this.setState({
              message: "Ficha editada com sucesso!",
              weight: "",
              height: "",
              obs: "",
              redirectUrl:
                "/pacientes/" + params["id"] + "/ficha/" + params["ficha_id"]
            }),
          JSON.stringify({
            corporal_mass: (+this.state.weight).toFixed(2),
            height: (+this.state.height).toFixed(2),
            BMI: BMI.toFixed(2),
            observations: this.state.obs
          })
        );
      }
    } else {
      this.setState({
        message: "Valores de altura ou peso inválidos!"
      });
    }
  };

  render() {
    return (
      <div>
        <h4>Paciente: {this.state.patient ? this.state.patient.name : null}</h4>
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
                  placeholder="Peso (em kg). Ex: 51.53"
                  onChange={event => {
                    const weightRegex = /^\d{0,3}\.\d{0,2}$|^\d{0,3}$/;
                    if (!weightRegex.test(event.target.value)) return;
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
                    const heightRegex = /^\d{0,1}\.\d{0,2}$|^\d{0,1}$/;
                    if (!heightRegex.test(event.target.value)) return;
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
                  {this.state.editing ? "Editar ficha" : "Adicionar ficha"}
                </Button>
                {this.state.message && <p>{this.state.message}</p>}
              </Segment>
            </Form>
          </Grid.Column>
        </Grid>
        {this.state.redirectUrl && (
          <Redirect to={this.state.redirectUrl + "?refresh=true"} />
        )}
      </div>
    );
  }
}

export default PatientRecordCreator;
