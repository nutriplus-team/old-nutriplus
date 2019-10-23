import React, { Component } from "react";
import Refeicao from "./Refeicao";
import TabelaRefeicoes from "./TabelaRefeicoes";
import Infos from "./Infos";
import { Grid, Button } from "semantic-ui-react";

const atributos = [
  "Valor Energético (kCal)",
  "Carboidratos",
  "Proteínas",
  "Lipídios"
];

class Cardapio extends Component {
  state = {};

  componentDidMount = async () => {
    let token = localStorage.getItem("stored_token");
    const res = await fetch("http://localhost:8080/foods/list-foods/", {
      method: "get",
      headers: new Headers({
        Authorization: "Port " + token,
        "Content-Type": "application/json"
      })
    });
    const info = await res.json();
    console.log(info);
    //if (info[0]) this.setState({ res: info[0].food_name });
    await new Promise(resolve => {
      this.setState({ COMIDAS: info }, () => {
        resolve();
      });
    });
    await new Promise(resolve => {
      this.setState(
        {
          refeicao: 0,
          valorNutricional: [
            [atributos[0], 0],
            [atributos[1], 0],
            [atributos[2], 0],
            [atributos[3], 0]
          ],
          cardapios: [[], [], [], [], [], []],
          factors: [
            this.initializeFactors(),
            this.initializeFactors(),
            this.initializeFactors(),
            this.initializeFactors(),
            this.initializeFactors(),
            this.initializeFactors()
          ]
        },
        () => {
          resolve();
        }
      );
    });
    this.setState({
      mounted: 1
    });
  };

  initializeFactors = () => {
    let factors = {};
    const COMIDAS = this.state.COMIDAS;
    COMIDAS.map(comida => {
      factors[comida.food_name] = 1;
    });
    return factors;
  };

  handleTransicaoRefeicao = (e, { name, value }) => {
    if (name === "Next")
      this.setState(prevState => ({ refeicao: prevState.refeicao + 1 }));
    else if (name === "Prev")
      this.setState(prevState => {
        if (prevState.refeicao > 0) return { refeicao: prevState.refeicao - 1 };
        else return { refeicao: 0 };
      });
    else if (name === "Infos") {
      this.setState({
        refeicao: value
      });
    }
  };

  handleCardapios = (refeicao, cardapio) => {
    this.setState(prevState => {
      const cardapios = prevState.cardapios.map((item, j) => {
        if (j === refeicao) {
          return cardapio;
        } else {
          return item;
        }
      });
      return { cardapios: cardapios };
    });
  };

  handleFactors = (refeicao, factors_local) => {
    this.setState(prevState => {
      const factors = prevState.factors.map((item, j) => {
        if (j === refeicao) {
          return factors_local;
        } else {
          return item;
        }
      });
      return { factors: factors };
    });
  };

  handleInfos = valorNutricional => {
    this.setState({ valorNutricional: valorNutricional });
  };

  render() {
    const {
      refeicao,
      valorNutricional,
      cardapios,
      factors,
      COMIDAS
    } = this.state;

    if (refeicao >= 6) {
      return <div> fim </div>;
    }
    if (this.state.mounted)
      return (
        <div>
          <Grid>
            <Grid.Column width={2}>
              <TabelaRefeicoes
                handleRefeicao={this.handleTransicaoRefeicao}
                refeicao={refeicao}
              ></TabelaRefeicoes>
            </Grid.Column>
            <Grid.Column width={3}>
              <h4>
                <Infos valorNutricional={valorNutricional}></Infos>
              </h4>
            </Grid.Column>
            <Grid.Column width={8}>
              <Refeicao
                refeicao={refeicao}
                COMIDAS={COMIDAS.slice(1, 5)}
                cardapios={cardapios}
                handleCardapios={this.handleCardapios}
                atributos={atributos}
                handleInfos={this.handleInfos}
                factors={factors}
                handleFactors={this.handleFactors}
              ></Refeicao>
              <br></br>
              <br></br>
              <Grid>
                <Grid.Column floated="left">
                  <Button name={"Prev"} onClick={this.handleTransicaoRefeicao}>
                    Prev
                  </Button>
                </Grid.Column>
                <Grid.Column floated="right">
                  <Button name={"Next"} onClick={this.handleTransicaoRefeicao}>
                    Next
                  </Button>
                </Grid.Column>
              </Grid>
            </Grid.Column>
          </Grid>
        </div>
      );
    else return "";
  }
}

export default Cardapio;
