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
          <Table.HeaderCell>Infos </Table.HeaderCell>
        </Table.Header>
        {this.state.valorNutricional.map(valor => {
          return (
            <Table.Row>
              <Table.Cell>{valor[0]}</Table.Cell>
              <Table.Cell>{valor[1]}</Table.Cell>
            </Table.Row>
          );
        })}
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
