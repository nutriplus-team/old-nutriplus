import React, { Component } from "react";
import { Grid, Button } from "semantic-ui-react";
import SubSection from "./GenerateMenu";
import { sendAuthenticatedRequest } from "../../utility/httpHelper";

const nomes = [
  "café da manhã",
  "lanche da manhã",
  "almoço",
  "lanche da tarde",
  "jantar",
  "lanche da noite"
];

const translate_map = {
  "Calorias (kcal)": "calories",
  "Proteínas (g)": "proteins",
  "Carboidratos (g)": "carbohydrates",
  "Lipídeos (g)": "lipids",
  "Fibra Alimentar (g)": "fiber"
};

class StartCardapio extends Component {
  state = {
    VN_array: [],
    mounted: 0
  };

  //fazer um didMount para pegar o nome do paciente
  //fazer tabela de acompanhamento do total diário, analogo ao Infos

  componentDidMount = async () => {
    await new Promise(resolve => {
      this.setState(
        {
          VN_array: [
            this.initializeAtributos(),
            this.initializeAtributos(),
            this.initializeAtributos(),
            this.initializeAtributos(),
            this.initializeAtributos(),
            this.initializeAtributos()
          ],
          mounted: 1
        },
        () => {
          resolve();
        }
      );
    });
  };
  initializeAtributos = () => {
    let resp;
    this.props.atributos.map(atributo => {
      if (resp) resp.push([atributo, 0]);
      else resp = [[atributo, 0]];
    });
    return resp;
  };

  handleVNs = (new_VN, refeicao) => {
    let VN_array = this.state.VN_array.map((item, index) => {
      if (index === refeicao) {
        return new_VN;
      }
      return item;
    });
    this.setState({ VN_array: VN_array });
  };

  handleNext = () => {
    let content = {};
    this.state.VN_array[0].map(atributo => {
      content[translate_map[atributo[0]]] = atributo[1].toString(10);
    });

    console.log("content: ", content);

    sendAuthenticatedRequest(
      "http://localhost:8080/menu/generate/1/1/",
      "post",
      () => {},
      resp => console.log("resp: ", resp),
      JSON.stringify(content)
    );

    this.props.history.push("/cardapio/principal");
  };

  render() {
    if (this.state.mounted === 1) {
      let content = nomes.map((nome, index) => {
        return (
          <SubSection
            name={nome}
            atributos={this.props.atributos}
            refeicao={index}
            VN={this.state.VN_array}
            handleVNs={this.handleVNs}
          ></SubSection>
        );
      });
      return (
        <div>
          <h1>Você está montando o cardápio de ____</h1>
          {content}
          <Grid>
            <Grid.Column floated="left"></Grid.Column>
            <Grid.Column floated="right">
              <Button name={"Next"} onClick={() => this.handleNext()}>
                Next
              </Button>
            </Grid.Column>
          </Grid>
        </div>
      );
    } else return "";
  }
}

export default StartCardapio;
