import React, { Component } from "react";
import Patient from "./Patient/Patient";
import { Button } from "semantic-ui-react";
import Register from "./Register/Register";
import PatientRecordCreator from "./PatientRecord/PatientRecordCreator/PatientRecordCreator";
import PatientRecord from "./PatientRecord/PatientRecord";
import { Route, Switch, NavLink } from "react-router-dom";
import { sendAuthenticatedRequest } from "../../utility/httpHelper";

class Patients extends Component {
  state = { patients: null, error: null };

  componentDidMount = async () => {
    sendAuthenticatedRequest(
      "http://localhost:8080/patients/get-all-patients/",
      "get",
      message =>
        this.setState({
          error: message
        }),
      info => this.setState({ patients: info.results, error: null })
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
            path="/pacientes/:id/ficha/:ficha_id"
            render={props => <PatientRecord {...props} />}
          />
          <Route
            exact
            path="/pacientes/:id"
            render={props => <Patient {...props} />}
          />
          <Route
            path="/pacientes"
            exact
            render={() => (
              <div>
                <Button
                  color="teal"
                  size="small"
                  onClick={() => this.props.history.push("/pacientes/register")}
                >
                  Registrar paciente
                </Button>
                <br />
                <ul>
                  {this.state.patients
                    ? this.state.patients.map(patient => (
                        <li key={patient.id}>
                          <NavLink to={"/pacientes/" + patient.id}>
                            {patient.name}
                          </NavLink>
                        </li>
                      ))
                    : null}
                </ul>
                {this.state.error && <p>{this.state.error}</p>}
              </div>
            )}
          />
        </Switch>
      </div>
    );
  }
}

export default Patients;
