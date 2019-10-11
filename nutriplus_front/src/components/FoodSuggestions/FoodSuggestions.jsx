import React, { Component } from "react";
import { Table, Segment, Button, Icon } from "semantic-ui-react";

class FoodSuggestions extends Component {
  state = {
    Ativos: ["sushi", "abacaxi"],
    Passivos: ["canela"],
    Disabled: ["banana", "frango"]
  };

  generateTable = () => {
    let Ativos = this.state.Ativos;
    let Passivos = this.state.Passivos;
    let Disabled = this.state.Disabled;
    if (Ativos && Passivos && Disabled) {
      let TableAtivos = Ativos.map(moeda => {
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
      let TablePassivos = Passivos.map(moeda => {
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
      let TableDisabled = Disabled.map(moeda => {
        return (
          <Segment.Group compact>
            <Segment inverted color="grey">
              {moeda}
            </Segment>
            <Button.Group>
              <Button
                name={moeda}
                type="Disabled"
                direction="left"
                onClick={this.handleItemClick}
                icon
              >
                <Icon name="angle double left" />
              </Button>
              <Button
                name={moeda}
                type="Disabled"
                direction="right"
                onClick={this.handleItemClick}
                icon
              >
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
                <Table.HeaderCell width={3}>
                  <center>Disabled</center>
                </Table.HeaderCell>
                <Table.HeaderCell width={6}>
                  <center>Cardápio</center>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row textAlign="center">
                <Table.Cell>{TableAtivos}</Table.Cell>
                <Table.Cell>{TableDisabled}</Table.Cell>
                <Table.Cell>{TablePassivos}</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </div>
      );
      return tabela;
    } else return null;
  };

  handleItemClick = (e, { direction, name, type }) => {
    if (type === "Ativo") {
      let Ativos = this.state.Ativos;
      let Disabled = this.state.Disabled;
      Ativos.splice(Ativos.indexOf(name), 1);
      Disabled.push(name);
      this.setState({ Ativos: Ativos, Disabled: Disabled });
      //console.log(Ativos, Disabled);
    }
    if (type === "Passivo") {
      let Passivos = this.state.Passivos;
      let Disabled = this.state.Disabled;
      Passivos.splice(Passivos.indexOf(name), 1);
      Disabled.push(name);
      this.setState({ Passivos: Passivos, Disabled: Disabled });
      //console.log(Passivos, Disabled);
    }
    if (type === "Disabled") {
      if (direction === "right") {
        let Passivos = this.state.Passivos;
        let Disabled = this.state.Disabled;
        Disabled.splice(Disabled.indexOf(name), 1);
        Passivos.push(name);
        this.setState({ Passivos: Passivos, Disabled: Disabled });
        //console.log(Passivos, Disabled);
      } else {
        let Ativos = this.state.Ativos;
        let Disabled = this.state.Disabled;
        Disabled.splice(Disabled.indexOf(name), 1);
        Ativos.push(name);
        this.setState({ Ativos: Ativos, Disabled: Disabled });
        //console.log(Ativos, Disabled);
      }
    }
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

export default FoodSuggestions;
