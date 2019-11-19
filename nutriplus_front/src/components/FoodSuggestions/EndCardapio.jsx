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
  "Calorias (kcal)": "calories",
  "Proteínas (g)": "proteins",
  "Carboidratos (g)": "carbohydrates",
  "Lipídeos (g)": "lipids",
  "Fibra Alimentar (g)": "fiber"
};

class EndCardapio extends Component {
  state = {};

  generateChart = valorNutricional => {
    let content;
    if (valorNutricional) {
      //console.log(valorNutricional);
      content = valorNutricional.map(valor => {
        return (
          <Table.Row>
            <Table.Cell>{valor[0]}</Table.Cell>
            <Table.Cell>{valor[1].toFixed(2)}</Table.Cell>
          </Table.Row>
        );
      });
    }
    let table = (
      <Table>
        <Table.Header>
          <Table.HeaderCell>Infos</Table.HeaderCell>
        </Table.Header>
        {content}
      </Table>
    );
    return table;
  };

  calcula_VN = (cardapio, factors) => {
    let valorNutricional;
    let atributos = this.props.atributos;
    atributos.map(atributo => {
      let vn_val = 0;
      cardapio.map(comida => {
        vn_val =
          vn_val +
          comida.nutrition_facts[atributos_map[atributo]] *
            factors[comida.food_name];
      });
      let vn = [atributo, vn_val];
      if (valorNutricional) valorNutricional.push(vn);
      else valorNutricional = [vn];
    });
    return valorNutricional;
  };

  generateContent = () => {
    let content = this.props.global.cardapios.map((cardapio, refeicao) => {
      let content_i = cardapio.reduce((total, actual, index, array) => {
        return (
          total +
          this.props.global.factors[refeicao][actual.food_name] +
          " x " +
          actual.measure_amount +
          " " +
          actual.measure_type +
          " " +
          actual.food_name +
          (index === array.length - 1 ? "" : ", ")
        );
      }, "");
      let valorNutricional = this.calcula_VN(
        cardapio,
        this.props.global.factors[refeicao]
      );
      let infos = this.generateChart(valorNutricional); // infos das 6 refeicao
      return (
        <React.Fragment>
          <p>
            {refeicaoMap[refeicao]}: {content_i}
          </p>
          {infos}
        </React.Fragment>
      );
    });
    console.log(content);
    content = [
      ...content,
      <React.Fragment>
        <p>TOTAL:</p>
        {this.generateChart(this.props.global.valorNutricional)}
      </React.Fragment>
    ];
    return content;
  };

  render() {
    let content = this.generateContent();
    console.log(this.props);
    return (
      <div>
        <h1>Resumo do Cardapio</h1>
        {content}
        <Button onClick={() => this.props.history.push("/")}>Fim</Button>
      </div>
    );
  }
}

export default EndCardapio;
