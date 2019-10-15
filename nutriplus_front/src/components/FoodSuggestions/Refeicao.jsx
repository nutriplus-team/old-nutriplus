import React, { Component } from "react";
import { Table, Segment, Button, Icon } from "semantic-ui-react";

class Refeicao extends Component {
  state = {
    Disponiveis: this.props.COMIDAS.DISPONIVEIS,
    Cardapio: []
  };

  generateTable = () => {
    let Disponiveis = this.state.Disponiveis;
    let Cardapio = this.state.Cardapio;
    if (Disponiveis || Cardapio) {
      let TableDisponiveis = Disponiveis.map(moeda => {
        return (
          <Segment.Group compact>
            <Segment inverted color="green">
              <center>{moeda}</center>
            </Segment>
            <Button.Group>
              <Button disabled icon>
                <Icon name="angle double left" />
              </Button>

              <Button
                name={moeda}
                type="Ativo"
                onClick={this.handleItemClick}
                icon
              >
                <Icon name="angle double right" />
              </Button>
            </Button.Group>
          </Segment.Group>
        );
      });
      let TableCardapio = Cardapio.map(moeda => {
        return (
          <Segment.Group compact>
            <Segment inverted color="blue">
              <center>{moeda}</center>
            </Segment>
            <Button.Group>
              <Button
                name={moeda}
                type="Passivo"
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

  handleItemClick = (e, { direction, name, type }) => {
    let Disponiveis = this.state.Disponiveis;
    let Cardapio = this.state.Cardapio;
    if (type === "Ativo") {
      Disponiveis.splice(Disponiveis.indexOf(name), 1);
      Cardapio.push(name);
      this.setState({ Disponiveis: Disponiveis, Cardapio: Cardapio });
    }
    if (type === "Passivo") {
      Cardapio.splice(Cardapio.indexOf(name), 1);
      Disponiveis.push(name);
      this.setState({ Cardapio: Cardapio, Disponiveis: Disponiveis });
    }
    this.props.handleCardapio(Cardapio);
  };

  render() {
    let tabela = this.generateTable();
    //console.log(chart);
    if (tabela) {
      return (
        <div>
          <h2>Café da manhã</h2>
          <center>{tabela}</center>
        </div>
      );
    } else return null;
  }
}

export default Refeicao;
