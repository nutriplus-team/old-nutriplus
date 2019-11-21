import React, { Component } from "react";
import { Table } from "semantic-ui-react";

class Infos extends Component {
  state = {
    valorNutricional: this.props.valorNutricional
  };

  componentDidUpdate = prevProps => {
    if (this.props.valorNutricional !== prevProps.valorNutricional) {
      this.setState({ valorNutricional: this.props.valorNutricional });
    }
  };

  generateTable = () => {
    let table = (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Infos </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {this.state.valorNutricional.map(valor => {
            return (
              <Table.Row>
                <Table.Cell>{valor[0]}</Table.Cell>
                <Table.Cell>{valor[1].toFixed(2)}</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    );
    return table;
  };
  render() {
    let table = this.generateTable();
    return table;
  }
}

export default Infos;
