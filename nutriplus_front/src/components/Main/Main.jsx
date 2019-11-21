import React from "react";
import { Grid } from "semantic-ui-react";

const main = () => {
  return (
    <React.Fragment>
      <Grid textAlign="center">
        <Grid.Column width={6}>
          <p style={{ textAlign: "justify", fontSize: 25 }}>
            Bem vindo ao site da NutriPlus! Aqui você pode gerar cardápios para
            seus pacientes de acordo com as suas necessidades energéticas.
            Cadastre-os na aba pacientes e crie uma ficha com medidas de peso e
            de altura. Depois, na página do paciente, clique em "Criar cardápio"
            e insira as necessidades nutricionais para gerar uma sugestão de
            cardápio.
          </p>
        </Grid.Column>
      </Grid>
    </React.Fragment>
  );
};

export default main;
