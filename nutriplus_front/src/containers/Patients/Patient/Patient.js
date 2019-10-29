import React, { Component } from "react";
import { Button } from "semantic-ui-react";
import { sendAuthenticatedRequest } from "../../../utility/httpHelper";
import Paginator from "../../../utility/paginator";
import classes from "./Patient.module.css";

class Patient extends Component {
  state = {
    recordQueryInfo: null,
    info: null,
    error: null,
    hasNext: false,
    hasPrevious: false
  };

  componentDidMount = async () => {
    const params = this.props.match.params;
    sendAuthenticatedRequest(
      "http://localhost:8080/patients/get-info/" + params["id"] + "/",
      "get",
      message =>
        this.setState({
          error: message
        }),
      info => this.setState({ info: info })
    );
    sendAuthenticatedRequest(
      "http://localhost:8080/patients/get-records/" + params["id"] + "/",
      "get",
      message => {
        this.setState({
          error: message
        });
      },
      recordInfo =>
        this.setState({
          recordQueryInfo: recordInfo,
          hasPrevious: false,
          hasNext: recordInfo.next !== null
        })
    );
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
        {this.state.recordQueryInfo ? (
          <div className={classes.records}>
            <Paginator
              queryResults={this.state.recordQueryInfo}
              filter={() => true}
              listElementMap={record => (
                <div
                  key={record.id}
                  onClick={() =>
                    this.props.history.push(
                      "/pacientes/" + params["id"] + "/ficha/" + record.id
                    )
                  }
                  className={classes.record}
                >
                  <p>
                    <span>Modificado em: {record.date_modified}</span>
                    <span>Peso: {record.corporal_mass}</span>
                    <span>Altura: {record.height}</span>
                    <span>IMC: {record.BMI}</span>
                  </p>
                </div>
              )}
              setResults={recordInfo =>
                this.setState({ recordQueryInfo: recordInfo })
              }
              setHasNext={value => this.setState({ hasNext: value })}
              setHasPrevious={value => this.setState({ hasPrevious: value })}
              setMessage={message =>
                this.setState({
                  error: message
                })
              }
              hasPrevious={this.state.hasPrevious}
              hasNext={this.state.hasNext}
              buttonSize="large"
            />
          </div>
        ) : (
          <p>Ainda não há uma ficha para esse paciente!</p>
        )}
      </div>
    );
  }
}

export default Patient;
