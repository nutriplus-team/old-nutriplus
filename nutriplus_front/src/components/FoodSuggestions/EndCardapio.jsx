import React, { Component } from "react";
import { Table, Segment, Button, Icon, Input, Grid } from "semantic-ui-react";
import { sendAuthenticatedRequest } from "../../utility/httpHelper";

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
  state = {
    new_cardapios: [
      [[], [], []],
      [[], [], []],
      [[], [], []],
      [[], [], []],
      [[], [], []],
      [[], [], []]
    ],
    new_factors: [
      [[], [], []],
      [[], [], []],
      [[], [], []],
      [[], [], []],
      [[], [], []],
      [[], [], []]
    ],
    options: [[], [], [], [], [], []],
    mounted: 0
  };

  calcula_VN = (cardapio, refeicao) => {
    let factors = this.props.global.factors[refeicao];
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

  generateNewCardapio = async (refeicao, i, actualVN) => {
    console.log("entrou: ", i);
    console.log(
      "new_cardapios dentro do generate antes do fetch: ",
      this.state.new_cardapios
    );
    await this.handleFetch(actualVN, refeicao, i);
    console.log(
      "new_cardapios dentro do generate dps do fetch: ",
      this.state.new_cardapios
    );
    let options = [];
    let j = 0;
    while (j < 3) {
      options = [
        ...options,
        <Table.Row active>
          <Table.Cell />
          <Table.Cell textAlign="center">
            {console.log(j)}
            <Button
              type={j}
              onClick={(event, { type }) =>
                this.generateNewCardapio(refeicao, type, actualVN)
              }
              color="orange"
            >
              Gerar outra opção
            </Button>
          </Table.Cell>
          <Table.Cell />
        </Table.Row>
      ];
      this.state.new_cardapios[refeicao][j].map((actual, index) => {
        options = [
          ...options,
          <Table.Row>
            <Table.Cell>{actual.food_name}</Table.Cell>
            <Table.Cell>
              {(
                Number(this.state.new_factors[refeicao][j][index]) *
                actual.measure_amount
              ).toFixed(2) +
                " " +
                actual.measure_type}
            </Table.Cell>
            <Table.Cell>
              {(
                Number(this.state.new_factors[refeicao][j][index]) *
                actual.measure_total_grams
              ).toFixed(2) + " g"}
            </Table.Cell>
          </Table.Row>
        ];
      });
      j += 1;
    }

    let total_options = this.state.options;
    total_options[refeicao] = options;
    await new Promise(resolve => {
      this.setState({ total_options: total_options }, () => {
        resolve();
      });
    });
  };

  componentDidMount = async () => {
    this.props.global.cardapios.map(async (cardapio, refeicao) => {
      if (cardapio.length === 0) {
        return;
      }
      let actualVN = this.calcula_VN(cardapio, refeicao);
      let i = 0;

      let options = [];
      while (i < 3) {
        await this.handleFetch(actualVN, refeicao, i);
        options = [
          ...options,
          <Table.Row active>
            <Table.Cell />
            <Table.Cell textAlign="center">
              <Button
                type={i}
                onClick={(event, { type }) =>
                  this.generateNewCardapio(refeicao, type, actualVN)
                }
                color="orange"
              >
                Gerar outra opção
              </Button>
            </Table.Cell>
            <Table.Cell />
          </Table.Row>
        ];
        this.state.new_cardapios[refeicao][i].map((actual, index) => {
          options = [
            ...options,
            <Table.Row>
              <Table.Cell>{actual.food_name}</Table.Cell>
              <Table.Cell>
                {(
                  Number(this.state.new_factors[refeicao][i][index]) *
                  actual.measure_amount
                ).toFixed(2) +
                  " " +
                  actual.measure_type}
              </Table.Cell>
              <Table.Cell>
                {(
                  Number(this.state.new_factors[refeicao][i][index]) *
                  actual.measure_total_grams
                ).toFixed(2) + " g"}
              </Table.Cell>
            </Table.Row>
          ];
        });
        i += 1;
      }
      let total_options = this.state.options;
      total_options[refeicao] = options;
      await new Promise(resolve => {
        this.setState({ total_options: total_options }, () => {
          resolve();
        });
      });
    });
    this.setState({ mounted: 1 });
  };

  handleFetch = async (actualVN, refeicao, i) => {
    let content = {};
    actualVN.map(atributo => {
      content[atributos_map[atributo[0]]] = atributo[1].toString(10);
    });
    let response;
    await sendAuthenticatedRequest(
      `/menu/generate/${refeicao + 1}/${this.props.match.params["id"]}/`,
      "post",
      () => {},
      resp => (response = resp),
      JSON.stringify(content)
    );
    if (response.Quantities.length && response.Suggestions.length) {
      let new_cardapios = [...this.state.new_cardapios];
      new_cardapios[refeicao][i] = response.Suggestions;
      let new_factors = [...this.state.new_factors];
      new_factors[refeicao][i] = response.Quantities;
      await new Promise(resolve => {
        this.setState(
          { new_cardapios: new_cardapios, new_factors: new_factors },
          () => {
            resolve();
          }
        );
      });
    }
  };

  generateContent = () => {
    console.log("chamou");
    let content = this.props.global.cardapios.map((cardapio, refeicao) => {
      let content_i;
      // todas as refeicoes, todas as tabelas
      if (cardapio.length === 0) {
        return;
      }
      content_i = cardapio.map((actual, index) => {
        // uma refeicao, uma tabela com varios "ou"
        return (
          <Table.Row>
            <Table.Cell>{actual.food_name}</Table.Cell>
            <Table.Cell>
              {(
                Number(this.props.global.factors[refeicao][actual.food_name]) *
                actual.measure_amount
              ).toFixed(2) +
                " " +
                actual.measure_type}
            </Table.Cell>
            <Table.Cell>
              {(
                Number(this.props.global.factors[refeicao][actual.food_name]) *
                actual.measure_total_grams
              ).toFixed(2) + " g"}
            </Table.Cell>
          </Table.Row>
        );
      }, "");

      let options = this.state.options[refeicao];
      content_i = [...content_i, ...options];
      console.log("content_i: ", content_i);
      return (
        <React.Fragment>
          <Grid centered>
            <Grid.Column width={9}>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell width={3}>
                      {refeicaoMap[refeicao]}
                    </Table.HeaderCell>
                    <Table.HeaderCell width={3}>
                      Quantidade caseira
                    </Table.HeaderCell>
                    <Table.HeaderCell width={3}>
                      Quantidade em gramas
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                {content_i}
              </Table>
            </Grid.Column>
          </Grid>
        </React.Fragment>
      );
    });
    return content;
  };

  render() {
    if (this.state.mounted === 1) {
      let content = this.generateContent();
      console.log("content: ", content);
      return (
        <div>
          <h1>Resumo do Cardapio</h1>
          <center>{content}</center>

          <Button onClick={() => this.props.history.push("/")}>Fim</Button>
        </div>
      );
    }
    return "";
  }
}

export default EndCardapio;
