import React, { Component } from "react";

import { Menu } from "semantic-ui-react";

class TabelaRefeicoes extends Component {
  state = {};
  render() {
    let refeicao = this.props.refeicao;
    return (
      <center>
        <Menu vertical>
          <Menu.Item>
            <Menu.Header>Refeições</Menu.Header>
            <Menu.Menu>
              <Menu.Item
                name={"1"}
                active={refeicao === "1"}
                onClick={this.props.handleRefeicao}
              >
                Café da manhã
              </Menu.Item>
              <Menu.Item
                name={"2"}
                active={refeicao === "2"}
                onClick={this.props.handleRefeicao}
              >
                Lanche da manhã
              </Menu.Item>
              <Menu.Item
                name={"3"}
                active={refeicao === "3"}
                onClick={this.props.handleRefeicao}
              >
                Almoço
              </Menu.Item>
              <Menu.Item
                name={"4"}
                active={refeicao === "4"}
                onClick={this.props.handleRefeicao}
              >
                Lanche da tarde
              </Menu.Item>
              <Menu.Item
                name={"5"}
                active={refeicao === "5"}
                onClick={this.props.handleRefeicao}
              >
                Jantar
              </Menu.Item>
              <Menu.Item
                name={"6"}
                active={refeicao === "6"}
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
