import React, { Component } from "react";
import Patient from "./Patient/Patient";
import { Button } from "semantic-ui-react";
import Register from "./Register/Register";
import PatientRecord from "./PatientRecord/PatientRecord";
import { Route, Switch, NavLink } from "react-router-dom";

class Patients extends Component {
  state = { patients: null, error: null };

  componentDidMount = async () => {
    const res = await fetch(
      "http://localhost:8080/patients/get-all-patients/",
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
        error: "Houve algum problema ao tentar carregar os pacientes!"
      });
      console.log(answ);
      console.log(info);
    } else if (answ.status === 200) {
      this.setState({ patients: info.results, error: null });
      console.log(info);
    } else if (answ.status === 401) {
      this.setState({
        error: "A sua sessão expirou! Por favor dê logout e login de novo."
      });
    }
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
                {this.state.error ? <p>{this.state.error}</p> : null}
              </div>
            )}
          />
        </Switch>
      </div>
    );
  }
}

export default Patients;
