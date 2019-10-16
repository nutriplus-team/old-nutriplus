import React, { Component } from "react";

import { Menu } from "semantic-ui-react";

class TabelaRefeicoes extends Component {
  state = {};
  render() {
    let refeicao = this.props.refeicao;
    let name = "Infos";
    return (
      <center>
        <Menu vertical>
          <Menu.Item>
            <Menu.Header>Refeições</Menu.Header>
            <Menu.Menu>
              <Menu.Item
                name={name}
                value={0}
                active={refeicao === 0}
                onClick={this.props.handleRefeicao}
              >
                Café da manhã
              </Menu.Item>
              <Menu.Item
                name={name}
                value={1}
                active={refeicao === 1}
                onClick={this.props.handleRefeicao}
              >
                Lanche da manhã
              </Menu.Item>
              <Menu.Item
                name={name}
                value={2}
                active={refeicao === 2}
                onClick={this.props.handleRefeicao}
              >
                Almoço
              </Menu.Item>
              <Menu.Item
                name={name}
                value={3}
                active={refeicao === 3}
                onClick={this.props.handleRefeicao}
              >
                Lanche da tarde
              </Menu.Item>
              <Menu.Item
                name={name}
                value={4}
                active={refeicao === 4}
                onClick={this.props.handleRefeicao}
              >
                Jantar
              </Menu.Item>
              <Menu.Item
                name={name}
                value={5}
                active={refeicao === 5}
                onClick={this.props.handleRefeicao}
              >
                Lanche da noite
              </Menu.Item>
            </Menu.Menu>
          </Menu.Item>
        </Menu>
      </center>
    );
  }
}

export default TabelaRefeicoes;
