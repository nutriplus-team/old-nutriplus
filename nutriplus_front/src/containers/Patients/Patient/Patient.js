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
    redirectUrl: null
  };

  componentDidUpdate = async () => {
    if (this.props.location.search.length > 0) {
      const params = this.props.match.params;
      const query = new URLSearchParams(this.props.location.search);
      if (query.get("refresh")) {
        sendAuthenticatedRequest(
          "/patients/get-records/" + params["id"] + "/",
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
              redirectUrl: "/pacientes/" + params["id"]
            })
        );
      }
    }
  };

  componentDidMount = async () => {
    const params = this.props.match.params;
    sendAuthenticatedRequest(
      "/patients/get-info/" + params["id"] + "/",
      "get",
      message =>
        this.setState({
          error: message
        }),
      info => this.setState({ info: info })
    );
    sendAuthenticatedRequest(
      "/patients/get-records/" + params["id"] + "/",
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

  deletePacient = async () => {
    const params = this.props.match.params;
    sendAuthenticatedRequest(
      "/patients/remove-patient/" + params["id"] + "/",
      "get",
      message => {
        this.setState({
          error: message
        });
      },
      () => {
        this.setState({ redirectUrl: "/pacientes?refresh=true" });
      }
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
              Sexo:{" "}
              {this.state.info.biological_sex === 0 ? "Feminino" : "Masculino"}
            </p>
            <p>
              Etnia:{" "}
              {this.state.info.ethnic_group === 0
                ? "Branco/Hispânico"
                : "Afroamericano"}
            </p>
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
        <Button
          style={{ margin: "10px" }}
          color="teal"
          size="small"
          onClick={() => this.props.history.push("/cardapio/" + params["id"])}
        >
          Criar cardápio para o paciente
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
        <Button
          style={{ margin: "200px auto" }}
          color="red"
          size="small"
          onClick={this.deletePacient}
        >
          Excluir paciente
        </Button>
        {this.state.redirectUrl && <Redirect to={this.state.redirectUrl} />}
      </div>
    );
  }
}

export default Patient;
