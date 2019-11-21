import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import EndCardapio from "./EndCardapio";
import PrincipalCardapio from "./PrincipalCardapio";
import { sendAuthenticatedRequest } from "../../utility/httpHelper";
//preciso apagar isso

const mapa_traducao = {
  calories: "Calorias",
  proteins: "Proteínas",
  carbohydrates: "Carboidratos",
  lipids: "Lipídeos",
  fiber: "Fibra Alimentar"
};

class Cardapio extends Component {
  state = {
    atributos: null,
    global: null
  };

  componentDidMount = async () => {
    this.setState({
      mounted: 1
    });
    sendAuthenticatedRequest(
      "/foods/get-units/",
      "get",
      () => {},
      info => {
        //console.log(info);
        let atributos = Object.keys(info).map(
          key => `${mapa_traducao[key]} (${info[key]})`
        );
        console.log(atributos);
        this.setState({
          atributos: atributos
        });
      }
    );
  };

  handleGlobal = global => {
    this.setState({ global: global });
  };

  render() {
    let routes;
    if (this.state.atributos) {
      routes = (
        <Switch>
          <Route
            path="/cardapio/:id/principal"
            render={props => (
              <PrincipalCardapio
                {...props}
                atributos={this.state.atributos}
                handleGlobal={this.handleGlobal}
              />
            )}
          />
          <Route
            path="/cardapio/:id/fim"
            render={props => (
              <EndCardapio
                {...props}
                atributos={this.state.atributos}
                global={this.state.global}
              />
            )}
          />

          <Redirect
            to={`/cardapio/${this.props.match.params["id"]}/principal`}
          />
        </Switch>
      );
    }

    if (this.state.mounted && this.state.atributos) {
      return <div>{routes}</div>;
    } else return "";
  }
}

export default Cardapio;
