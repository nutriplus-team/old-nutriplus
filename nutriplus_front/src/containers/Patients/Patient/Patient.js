import React, { Component } from "react";
import { Button } from "semantic-ui-react";
import classes from "./Patient.module.css";

class Patient extends Component {
  state = { records: null, info: null, error: null };

  componentDidMount = async () => {
    const params = this.props.match.params;
    const patientInfoRes = await fetch(
      "http://localhost:8080/patients/get-info/" + params["id"] + "/",
      {
        method: "get",
        headers: new Headers({
          Authorization: "Port " + localStorage.getItem("stored_token")
        })
      }
    );
    const patientInfo = await patientInfoRes.json();
    if (patientInfoRes.status === 400) {
      this.setState({
        error: "Houve algum problema ao tentar carregar os dados do paciente!"
      });
      //console.log(patientInfoRes);
      //console.log(patientInfo);
    } else if (patientInfoRes.status === 200) {
      this.setState({ info: patientInfo });
      //console.log(patientInfo);
    } else if (patientInfoRes.status === 401) {
      //console.log(patientInfoRes);
      this.setState({
        error: "A sua sessão expirou! Por favor dê logout e login de novo."
      });
    }
    const recordInfoRes = await fetch(
      "http://localhost:8080/patients/get-records/" + params["id"] + "/",
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
        error: "Houve algum problema ao tentar carregar as fichas do paciente!"
      });
      //console.log(recordInfoRes);
      //console.log(recordInfo);
    } else if (recordInfoRes.status === 200) {
      this.setState({ records: recordInfo.results });
      //console.log(recordInfo);
    } else if (recordInfoRes.status === 401) {
      //console.log(recordInfoRes);
      this.setState({
        error: "A sua sessão expirou! Por favor dê logout e login de novo."
      });
    }
  };

  render() {
    const params = this.props.match.params;
    return (
      <div>
        {this.state.error ? <p>{this.state.error}</p> : null}
        {this.state.info ? (
          <div>
            <h3>{this.state.info.name}</h3>
            <p>Data de nascimento: {this.state.info.date_of_birth}</p>
            <p>
              Restrições alimentares:{" "}
              {this.state.info.food_restrictions.length === 0
                ? "Não há"
                : this.state.info.food_restrictions.reduce(
                    (bigString, elem, index, arr) =>
                      bigString +
                      elem.food_name +
                      (index === arr.length - 1 ? "" : ", "),
                    ""
                  )}
            </p>
          </div>
        ) : null}
        <Button
          color="teal"
          size="small"
          onClick={() =>
            this.props.history.push(
              "/pacientes/" + params["id"] + "/criar-ficha"
            )
          }
        >
          Criar ficha para o paciente
        </Button>
        {this.state.records ? (
          <div>
            {this.state.records.map(record => (
              <div
                key={record.id}
                onClick={() =>
                  this.props.history.push(
                    "/pacientes/" + params["id"] + "/ficha/" + record.id
                  )
                }
              >
                <p className={classes.record}>
                  <span>Modificado em: {record.date_modified}</span>
                  <span>Peso: {record.corporal_mass}</span>
                  <span>Altura: {record.height}</span>
                  <span>IMC: {record.BMI}</span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>Ainda não há uma ficha para esse paciente!</p>
        )}
      </div>
    );
  }
}

export default Patient;
