import React, { Component } from "react";
import { Redirect } from "react-router-dom";
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
    hasPrevious: false,
    redirect: false
  };

  componentDidUpdate = async () => {
    if (this.props.location.search.length > 0) {
      const params = this.props.match.params;
      const query = new URLSearchParams(this.props.location.search);
      if (query.get("refresh")) {
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
              hasNext: recordInfo.next !== null,
              redirect: true
            })
        );
      }
    }
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
            <Button
              style={{ margin: "10px" }}
              color="teal"
              size="small"
              onClick={() =>
                this.props.history.push("/pacientes/" + params["id"] + "/edit")
              }
            >
              Editar dados do paciente
            </Button>
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
          style={{ margin: "10px" }}
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
        <Button
          className={classes.backButton}
          color="teal"
          size="medium"
          onClick={() => this.props.history.push("/pacientes")}
        >
          Voltar à página de pacientes
        </Button>
        {this.state.redirect && <Redirect to={"/pacientes/" + params["id"]} />}
      </div>
    );
  }
}

export default Patient;
