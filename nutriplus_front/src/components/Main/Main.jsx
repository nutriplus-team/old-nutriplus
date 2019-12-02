import React from "react";
import { Grid } from "semantic-ui-react";
import register from "../../assets/images/register.jpg";
import gen_menu from "../../assets/images/gen_menu.jpg";
import gen_options from "../../assets/images/gen_options.jpg";

const main = () => {
  return (
    <React.Fragment>
      <Grid textAlign="center">
        <Grid.Column width={9}>
          <p style={{ textAlign: "justify", fontSize: 25 }}>
            &nbsp;&nbsp;Bem vindo ao site da NutriPlus! Aqui você pode gerar
            cardápios para seus pacientes de acordo com as suas necessidades
            energéticas. Cadastre-os na aba pacientes e crie uma ficha com
            medidas de peso e de altura. Depois, na página do paciente, clique
            em "Criar cardápio" e insira as necessidades nutricionais para gerar
            uma sugestão de cardápio.
          </p>
          <p style={{ textAlign: "justify", fontSize: 25 }}>
            &nbsp;&nbsp;Algumas coisas que você pode fazer por aqui:
          </p>
          <p style={{ textAlign: "justify", fontSize: 25 }}>
            - Você pode inserir pacientes em um banco de dados, que fica salvo
            na nuvem, sem ocupar espaço de seu computador.
          </p>
          <img src={register} alt="register" />
          <p style={{ textAlign: "justify", fontSize: 25 }}>
            - Criar cardápios agora ficou muito fácil! Você pode criar e
            configurar cardápios, de cada refeição, para cada um de seus
            pacientes.
          </p>
          <img src={gen_menu} alt="gen_menu" style={{ width: 1300 }} />

          <p style={{ textAlign: "justify", fontSize: 25 }}>
            - Você também obtém um resumo do cardápio montado, além de várias
            opções equivalentes! Você também pode solicitar novas opções para
            cada refeição.
          </p>
          <img src={gen_options} alt="gen_options" style={{ width: 900 }} />
        </Grid.Column>
      </Grid>
    </React.Fragment>
  );
};

export default main;
