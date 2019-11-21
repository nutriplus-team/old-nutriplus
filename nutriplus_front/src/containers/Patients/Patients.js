import React, { Component } from "react";
import Patient from "./Patient/Patient";
import { Button } from "semantic-ui-react";
import Register from "./Register/Register";
import PatientRecordCreator from "./PatientRecord/PatientRecordCreator/PatientRecordCreator";
import PatientRecord from "./PatientRecord/PatientRecord";
import { Route, Switch, NavLink, Redirect } from "react-router-dom";
import { sendAuthenticatedRequest } from "../../utility/httpHelper";
import Paginator from "../../utility/paginator";
import classes from "./Patients.module.css";

class Patients extends Component {
  state = {
    patientsQueryInfo: null,
    error: null,
    hasNext: false,
    hasPrevious: false,
    redirect: false
  };

  componentDidUpdate = async () => {
    if (this.props.location.search.length > 0) {
      const query = new URLSearchParams(this.props.location.search);
      if (query.get("refresh")) {
        sendAuthenticatedRequest(
          "/patients/get-all-patients/",
          "get",
          message =>
            this.setState({
              error: message
            }),
          info =>
            this.setState({
              patientsQueryInfo: info,
              error: null,
              hasPrevious: false,
              hasNext: info.next !== null,
              redirect: true
            })
        );
      }
    }
  };

  componentDidMount = async () => {
    sendAuthenticatedRequest(
      "/patients/get-all-patients/",
      "get",
      message =>
        this.setState({
          error: message
        }),
      info =>
        this.setState({
          patientsQueryInfo: info,
          error: null,
          hasPrevious: false,
          hasNext: info.next !== null
        })
    );
  };

  render() {
    return (
      <div>
        <Switch>
          <Route
            path="/pacientes/register"
            render={props => <Register {...props} />}
          />
          <Route
            exact
            path="/pacientes/:id/criar-ficha"
            render={props => <PatientRecordCreator {...props} />}
          />
          <Route
            exact
            path="/pacientes/:id/ficha/:ficha_id"
            render={props => <PatientRecord {...props} />}
          />
          <Route
            path="/pacientes/:id/ficha/:ficha_id/edit"
            render={props => <PatientRecordCreator {...props} />}
          />
          <Route
            exact
            path="/pacientes/:id"
            render={props => <Patient {...props} />}
          />
          <Route
            exact
            path="/pacientes/:id/edit"
            render={props => <Register {...props} />}
          />
          <Route
            path="/pacientes"
            exact
            render={() => (
              <div className={classes.patients}>
                <Button
                  color="teal"
                  size="small"
                  onClick={() => this.props.history.push("/pacientes/register")}
                >
                  Registrar paciente
                </Button>
                <br />
                {this.state.patientsQueryInfo && (
                  <Paginator
                    queryResults={this.state.patientsQueryInfo}
                    filter={() => true}
                    listElementMap={patient => (
                      <li key={patient.id}>
                        <NavLink to={"/pacientes/" + patient.id}>
                          {patient.name}
                        </NavLink>
                      </li>
                    )}
                    setResults={patientInfo =>
                      this.setState({ patientsQueryInfo: patientInfo })
                    }
                    setHasNext={value => this.setState({ hasNext: value })}
                    setHasPrevious={value =>
                      this.setState({ hasPrevious: value })
                    }
                    setMessage={message =>
                      this.setState({
                        error: message
                      })
                    }
                    hasPrevious={this.state.hasPrevious}
                    hasNext={this.state.hasNext}
                    isList
                  />
                )}
                {this.state.error && <p>{this.state.error}</p>}
                {this.state.redirect && <Redirect to="/pacientes" />}
              </div>
            )}
          />
        </Switch>
      </div>
    );
  }
}

export default Patients;
