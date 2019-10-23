import React, { Component } from "react";
import { Table, Segment, Button, Icon, Input } from "semantic-ui-react";

const refeicaoMap = {
  0: "Café da manhã",
  1: "Lanche da manhã",
  2: "Almoço",
  3: "Lanche da tarde",
  4: "Jantar",
  5: "Lanche da noite"
};

const atributos_map = {
  "Valor Energético (kCal)": "calories",
  Carboidratos: "carbohydrates",
  Proteínas: "proteins",
  Lipídios: "lipids"
};
/*
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
*/
class Refeicao extends Component {
  state = {
    Disponiveis: [],
    Cardapio: []
  };

  componentDidMount = () => {
    this.setState({
      Disponiveis: this.comidas_restantes(
        this.props.COMIDAS,
        this.props.cardapios[this.props.refeicao]
      ),
      Cardapio: this.props.cardapios[this.props.refeicao],
      valorNutricional: this.calcula_VN(
        this.props.cardapios[this.props.refeicao]
      ),
      factors: this.props.factors[this.props.refeicao]
    });
  };

  comidas_restantes = (comidas, cardapio) => {
    cardapio.map(comida => {
      var index = comidas.indexOf(comida);
      if (index > -1) {
        comidas.splice(index, 1);
      }
    });
    return comidas;
  };

  calcula_VN = cardapio => {
    let valorNutricional;
    let factors = this.props.factors[this.props.refeicao];
    let atributos = this.props.atributos;
    atributos.map(atributo => {
      let vn_val = 0;
      cardapio.map(comida => {
        vn_val =
          vn_val + comida[atributos_map[atributo]] * factors[comida.food_name];
      });
      let vn = [atributo, vn_val];
      if (valorNutricional) valorNutricional.push(vn);
      else valorNutricional = [vn];
    });
    return valorNutricional;
  };

  calcula_VNs_i = (cardapio, index) => {
    let valorNutricional;
    let factors = this.props.factors[index];
    let atributos = this.props.atributos;
    atributos.map(atributo => {
      let vn_val = 0;
      cardapio.map(comida => {
        vn_val =
          vn_val + comida[atributos_map[atributo]] * factors[comida.food_name];
      });
      let vn = [atributo, vn_val];
      if (valorNutricional) valorNutricional.push(vn);
      else valorNutricional = [vn];
    });
    return valorNutricional;
  };

  calcula_VNs = cardapios => {
    let valorNutricional;
    cardapios.map((cardapio, index) => {
      if (valorNutricional)
        valorNutricional = this.somaAtributos(
          valorNutricional,
          this.calcula_VNs_i(cardapio, index)
        );
      else valorNutricional = this.calcula_VNs_i(cardapio, index);
    });
    this.props.handleInfos(valorNutricional);
  };

  somaAtributos = (valorNutricional1, valorNutricional2) => {
    for (let i = 0; i < this.props.atributos.length; i++) {
      valorNutricional1[i][1] =
        valorNutricional1[i][1] + valorNutricional2[i][1];
    }
    return valorNutricional1;
  };

  componentDidUpdate = prevProps => {
    if (prevProps.refeicao !== this.props.refeicao) {
      this.setState({
        Disponiveis: this.comidas_restantes(
          this.props.COMIDAS,
          this.props.cardapios[this.props.refeicao]
        ),
        Cardapio: this.props.cardapios[this.props.refeicao],
        valorNutricional: this.calcula_VN(
          this.props.cardapios[this.props.refeicao]
        ),
        factors: this.props.factors[this.props.refeicao]
      });
    }
  };

  handleCardapio = cardapio => {
    this.setState({
      valorNutricional: this.calcula_VN(cardapio)
    });
  };

  generateTable = () => {
    let Disponiveis = this.state.Disponiveis;
    let Cardapio = this.state.Cardapio;
    if (Disponiveis || Cardapio) {
      let TableDisponiveis = Disponiveis.map(food => {
        return (
          <Segment.Group compact>
            <Segment inverted color="green">
              <center>{food.food_name}</center>
            </Segment>
            <Button.Group>
              <Button disabled icon>
                <Icon name="angle double left" />
              </Button>

              <Button
                food={food}
                type="Disponiveis"
                onClick={this.handleItemClick}
                icon
              >
                <Icon name="angle double right" />
              </Button>
            </Button.Group>
          </Segment.Group>
        );
      });
      let TableCardapio = Cardapio.map(food => {
        return (
          <Segment.Group compact>
            <Segment inverted color="blue">
              <center>{food.food_name}</center>
            </Segment>
            <Button.Group>
              <Button
                food={food}
                type="Cardapio"
                onClick={this.handleItemClick}
                icon
              >
                <Icon name="angle double left" />
              </Button>
              <Button disabled icon>
                <Icon name="angle double right" />
              </Button>
            </Button.Group>
          </Segment.Group>
        );
      });
      let tabela = (
        <div>
          {" "}
          <Table collapsing celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={6}>
                  <center>Alimentos disponíveis</center>
                </Table.HeaderCell>
                <Table.HeaderCell width={6}>
                  <center>Cardápio</center>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row textAlign="center">
                <Table.Cell>{TableDisponiveis}</Table.Cell>
                <Table.Cell>{TableCardapio}</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </div>
      );
      return tabela;
    } else return null;
  };

  handleItemClick = (e, { direction, food, type }) => {
    let Disponiveis = this.state.Disponiveis;
    let Cardapio = this.state.Cardapio;
    if (type === "Disponiveis") {
      Disponiveis.splice(Disponiveis.indexOf(food), 1);
      Cardapio.push(food);
      this.setState({ Disponiveis: Disponiveis, Cardapio: Cardapio });
    }
    if (type === "Cardapio") {
      Cardapio.splice(Cardapio.indexOf(food), 1);
      Disponiveis.push(food);
      this.setState({ Cardapio: Cardapio, Disponiveis: Disponiveis });
    }
    this.handleCardapio(Cardapio);
    this.props.handleCardapios(this.state.refeicao, Cardapio);
    this.calcula_VNs(this.props.cardapios);
  };

  generateChart = () => {
    let valorNutricional = this.state.valorNutricional;
    let content;
    if (valorNutricional) {
      console.log(valorNutricional);
      content = valorNutricional.map(valor => {
        return (
          <Table.Row>
            <Table.Cell>{valor[0]}</Table.Cell>
            <Table.Cell>{valor[1]}</Table.Cell>
          </Table.Row>
        );
      });
    }
    let table = (
      <Table>
        <Table.Header>
          <Table.HeaderCell>Infos locais</Table.HeaderCell>
        </Table.Header>
        {content}
      </Table>
    );
    return table;
  };

  searchFactor = comida => {
    let factors = this.props.factors[this.props.refeicao];
    return factors[comida];
  };

  setFactor = async (comida, event) => {
    if (event) {
      let factors = this.props.factors[this.props.refeicao];
      //console.log(factors);
      if (factors) {
      } else {
        factors = {};
      }
      factors[comida.food_name] = event.target.value;
      await new Promise(resolve => {
        this.setState({ factors: factors }, () => {
          resolve();
        });
      });
      this.handleCardapio(this.state.Cardapio);
      this.props.handleFactors(this.props.refeicao, factors);
      this.calcula_VNs(this.props.cardapios);
    }
  };

  gerenateFactor = () => {
    let cardapio = this.state.Cardapio;
    let content;
    if (cardapio) {
      content = cardapio.map(comida => {
        return (
          <Table.Row>
            <Table.Cell>{comida.food_name}</Table.Cell>
            <Table.Cell>
              <Input
                value={this.searchFactor(comida.food_name)}
                onChange={e => this.setFactor(comida, e)}
              ></Input>
            </Table.Cell>
          </Table.Row>
        );
      });
    }
    let table = (
      <Table>
        <Table.Header>
          <Table.HeaderCell>Alimento</Table.HeaderCell>
          <Table.HeaderCell>Quantidade (porções)</Table.HeaderCell>
          {content}
        </Table.Header>
      </Table>
    );
    return table;
  };

  render() {
    let tabela = this.generateTable();
    let chart = this.generateChart();
    let fator = this.gerenateFactor();
    const refeicao = this.props.refeicao;
    if (tabela) {
      return (
        <div>
          <h2>{refeicaoMap[refeicao]}</h2>
          <center>{tabela}</center>
          <br></br>
          <br></br>
          <center>{fator}</center>
          <br></br>
          <br></br>
          <center>{chart}</center>
        </div>
      );
    } else return null;
  }
}

export default Refeicao;
