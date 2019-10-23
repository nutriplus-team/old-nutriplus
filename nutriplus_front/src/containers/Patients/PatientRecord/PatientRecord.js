import React, { Component } from "react";

class PatientRecord extends Component {
  state = { record: null, error: null, patient: null };

  componentDidMount = async () => {
    const params = this.props.match.params;
    const recordInfoRes = await fetch(
      "http://localhost:8080/patients/get-single-record/" +
        params["ficha_id"] +
        "/",
      {
        method: "get",
        headers: new Headers({
          Authorization: "Port " + localStorage.getItem("stored_token")
        })
      }
    );
    const recordInfo = await recordInfoRes.json();
    if (recordInfoRes.status === 400) {
      this.setState({
        error: "Houve algum problema ao tentar carregar a ficha do paciente!"
      });
      //console.log(recordInfoRes);
      //console.log(recordInfo);
    } else if (recordInfoRes.status === 200) {
      this.setState({ record: recordInfo });
      //console.log(recordInfo);
    } else if (recordInfoRes.status === 401) {
      //console.log(recordInfoRes);
      this.setState({
        error: "A sua sessão expirou! Por favor dê logout e login de novo."
      });
    }
    const patientInfoRes = await fetch(
      "http://localhost:8080/patients/get-info/" + params["id"] + "/",
      {
        method: "get",
        headers: new Headers({
          Authorization: "Port " + localStorage.getItem("stored_token")
        })
      }
    );
    const info = await patientInfoRes.json();
    if (patientInfoRes.status === 400) {
      this.setState({
        error: "Houve algum problema ao tentar acessar a ficha do paciente!"
      });
      //console.log(patientInfoRes);
      //console.log(info);
    } else if (patientInfoRes.status === 200) {
      this.setState({ patient: info, error: null });
      //console.log(info);
    } else if (patientInfoRes.status === 401) {
      this.setState({
        error: "A sua sessão expirou! Por favor dê logout e login de novo."
      });
    }
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

  render() {
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
      </div>
    );
  }
}

export default PatientRecord;
