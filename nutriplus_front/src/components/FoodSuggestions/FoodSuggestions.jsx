import React, { Component } from "react";
import Refeicao from "./Refeicao";
import TabelaRefeicoes from "./TabelaRefeicoes";
import Infos from "./Infos";
import {
  Menu,
  Label,
  Segment,
  Grid,
  GridColumn,
  Dropdown,
  GridRow,
  Ref,
  Button
} from "semantic-ui-react";

const COMIDAS = {
  DISPONIVEIS: ["sushi", "abacaxi", "pimentao"]
};

const foodmap = {
  sushi: {
    proteinas: 10,
    gorduras: 50
  },
  abacaxi: {
    proteinas: 1,
    gorduras: 5
  },
  pimentao: {
    proteinas: 0,
    gorduras: 40
  }
};

class Cardapio extends Component {
  state = {
    refeicao: "1",
    valorNutricional: [["proteinas", 0], ["gorduras", 0]]
  };

  handleRefeicao = (e, { name }) => {
    this.setState({
      refeicao: name
    });
  };

  handleCardapio = cardapio => {
    var proteinas = 0;
    var gorduras = 0;
    cardapio.map(food => {
      proteinas = proteinas + foodmap[food].proteinas;
      gorduras = gorduras + foodmap[food].gorduras;
    });
    let valorNutricional = [["proteinas", proteinas], ["gorduras", gorduras]];
    console.log(valorNutricional);
    this.setState({
      valorNutricional: valorNutricional
    });
  };

  render() {
    const { refeicao, valorNutricional, cardapio } = this.state;
    //console.log(foodmap["sushi"].proteinas);
    return (
      <div>
        <Grid>
          <Grid.Column width={2}>
            <TabelaRefeicoes
              handleRefeicao={this.handleRefeicao}
              refeicao={refeicao}
            ></TabelaRefeicoes>
          </Grid.Column>
          <Grid.Column width={3}>
            <h4>
              <Infos valorNutricional={valorNutricional}></Infos>
            </h4>
          </Grid.Column>
          <Grid.Column width={8}>
            {/*aqui fazer switch de qual refeicao aparecer*/}
            <Refeicao
              refeicao={refeicao}
              COMIDAS={COMIDAS}
              handleCardapio={this.handleCardapio}
            ></Refeicao>
            <br></br>
            <br></br>
            <Grid>
              <Grid.Column floated="left">
                <Button>Prev</Button>
              </Grid.Column>
              <Grid.Column floated="right">
                <Button>Next</Button>
              </Grid.Column>
            </Grid>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default Cardapio;
