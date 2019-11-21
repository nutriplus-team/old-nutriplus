import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Button } from "semantic-ui-react";
import { sendAuthenticatedRequest } from "../../../utility/httpHelper";

class PatientRecord extends Component {
  state = { record: null, error: null, patient: null, redirectUrl: null };

  componentDidMount = async () => {
    const params = this.props.match.params;
    sendAuthenticatedRequest(
      "/patients/get-single-record/" + params["ficha_id"] + "/",
      "get",
      message =>
        this.setState({
          error: message
        }),
      results => this.setState({ record: results })
    );
    sendAuthenticatedRequest(
      "/patients/get-info/" + params["id"] + "/",
      "get",
      message =>
        this.setState({
          error: message
        }),
      results => this.setState({ patient: results, error: null })
    );
  };

  processObjectKey = key => {
    if (key === "patient") {
      return (
        "Paciente: " + (this.state.patient ? this.state.patient.name : null)
      );
    }
    if (key === "corporal_mass") {
      return "Peso: " + this.state.record[key] + " kg";
    }
    if (key === "height") {
      return "Altura: " + this.state.record[key] + " m";
    }
    if (key === "BMI") {
      return "IMC: " + this.state.record[key];
    }
    if (key === "observations") {
      return "Observações: " + this.state.record[key];
    }
    if (key === "date_modified") {
      return "Data de modificação: " + this.state.record[key];
    }
    return null;
  };

  deleteRecord = async () => {
    const params = this.props.match.params;
    sendAuthenticatedRequest(
      "/patients/remove-record/" + params["ficha_id"] + "/",
      "get",
      message => {
        this.setState({
          error: message
        });
      },
      () => {
        this.setState({
          redirectUrl: "/pacientes/" + params["id"] + "/?refresh=true"
        });
      }
    );
  };

  render() {
    const params = this.props.match.params;
    return (
      <div>
        {this.state.error ? <p>{this.state.error}</p> : null}
        {this.state.record ? (
          <div>
            {Object.keys(this.state.record).map(key => (
              <p key={key}>{this.processObjectKey(key)}</p>
            ))}
          </div>
        ) : null}
        <Button
          style={{ margin: "10px" }}
          color="teal"
          size="small"
          onClick={() =>
            this.props.history.push(
              "/pacientes/" +
                params["id"] +
                "/ficha/" +
                params["ficha_id"] +
                "/edit"
            )
          }
        >
          Editar ficha do paciente
        </Button>
        <Button
          style={{ margin: "200px auto" }}
          color="red"
          size="small"
          onClick={this.deleteRecord}
        >
          Excluir ficha
        </Button>
        <Button
          style={{ margin: "10px" }}
          color="teal"
          size="medium"
          onClick={() => this.props.history.push("/pacientes/" + params["id"])}
        >
          Voltar à página do paciente
        </Button>
        {this.state.redirectUrl && <Redirect to={this.state.redirectUrl} />}
      </div>
    );
  }
}

export default PatientRecord;
