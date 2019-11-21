import React, { Component } from "react";
import { Table, Input } from "semantic-ui-react";
import { sendAuthenticatedRequest } from "../../utility/httpHelper";
import { Grid, Button } from "semantic-ui-react";

const refeicaoMap = {
  0: "Café da manhã",
  1: "Lanche da manhã",
  2: "Almoço",
  3: "Lanche da tarde",
  4: "Jantar",
  5: "Lanche da noite"
};
class GenerateMenu extends Component {
  state = {
    name: this.props.name,
    VN: this.props.VN[this.props.refeicao]
  };

  componentDidUpdate = prevProps => {
    if (prevProps !== this.props) {
      this.setState({ VN: this.props.VN[this.props.refeicao] });
    }
  };

  setNewVN = async (valor, event) => {
    if (event) {
      let VN = this.state.VN;
      console.log(VN);
      VN = VN.map(item => {
        if (item === valor) {
          return [valor[0], event.target.value];
        }
        return item;
      });
      await new Promise(resolve => {
        this.setState({ VN: VN }, () => {
          resolve();
        });
      });
      this.props.handleVNs(VN, this.props.refeicao);
    }
  };

  generateTable = () => {
    let content;
    content = this.state.VN.map(valor => {
      return (
        <Table.Row>
          <Table.Cell>{valor[0]}</Table.Cell>
          <Input
            value={valor[1]}
            onChange={e => this.setNewVN(valor, e)}
          ></Input>{" "}
        </Table.Row>
      );
    });
    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{this.state.name}</Table.HeaderCell>
          </Table.Row>
          {content}
        </Table.Header>
      </Table>
    );
  };

  handleFetch = async () => {
    let content = {};
    console.log(this.state.VN);
    this.state.VN.map(atributo => {
      content[this.props.translate_map[atributo[0]]] = atributo[1].toString(10);
    });

    console.log("content: ", content);
    let response;
    await sendAuthenticatedRequest(
      `/menu/generate/${this.props.refeicao + 1}/${this.props.patient_id}/`,
      "post",
      () => {},
      resp => (response = resp),
      JSON.stringify(content)
    );
    console.log(response);
    console.log(response.Quantities.length, response.Suggestions.length);
    if (response.Quantities.length && response.Suggestions.length) {
      this.props.handleCardapios(this.props.refeicao, response.Suggestions);
      this.setFactor(
        this.props.refeicao,
        response.Suggestions,
        response.Quantities
      );
    }
  };

  setFactor = (refeicao, comidas, quantities) => {
    let factors = this.props.factors[refeicao];
    comidas.map((comida, index) => {
      factors[comida.food_name] = quantities[index];
    });
    console.log(factors);
    this.props.handleFactors(this.props.refeicao, factors);
  };

  render() {
    let table = this.generateTable();
    if (table) {
      return (
        <React.Fragment>
          <center>
            <br></br>
            <h3> Gerador de cardápios</h3>
            {table}
          </center>
          <Button onClick={() => this.handleFetch()}>Gerar!</Button>
        </React.Fragment>
      );
    } else return "";
  }
}

export default GenerateMenu;
