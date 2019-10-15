import React, { Component } from "react";
import { Button } from "semantic-ui-react";
import { NavLink } from "react-router-dom";

class Patient extends Component {
  state = { records: null, info: null, error: null };

  componentDidMount = async () => {
    const params = this.props.match.params;
    const res = await fetch(
      "http://localhost:8080/patients/get-info/" + params["id"] + "/",
      {
        method: "get",
        headers: new Headers({
          Authorization: "Port " + localStorage.getItem("stored_token")
        })
      }
    );
    const info = await res.json();
    if (res.status === 400) {
      this.setState({
        error: "Houve algum problema ao tentar carregar os dados do paciente!"
      });
      console.log(res);
      console.log(info);
    } else if (res.status === 200) {
      this.setState({ info: info });
      console.log(info);
    } else if (res.status === 401) {
      console.log(res);
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
                : this.state.info.food_restrictions}
            </p>
            <p>Preferências alimentares: {this.state.info.food_choices}</p>
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
          <ul>
            {this.state.records.map(record => (
              <li key={record.id}>
                <NavLink
                  to={"/pacientes/" + params["id"] + "/ficha/" + record.id}
                >
                  {record.id}
                </NavLink>
              </li>
            ))}
          </ul>
        ) : (
          <p>Não há fichas para esse paciente!</p>
        )}
      </div>
    );
  }
}

export default Patient;
