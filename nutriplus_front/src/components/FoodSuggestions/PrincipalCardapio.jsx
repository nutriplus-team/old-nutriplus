import React, { useState, useRef, useEffect, runEffect } from "react";
import Refeicao from "./Refeicao";
import TabelaRefeicoes from "./TabelaRefeicoes";
import Infos from "./Infos";
import { Grid, Button } from "semantic-ui-react";
import SearchFood from "./SearchFood";
import GenerateMenu from "./GenerateMenu";

const translate_map = {
  "Calorias (kcal)": "calories",
  "Proteínas (g)": "proteins",
  "Carboidratos (g)": "carbohydrates",
  "Lipídeos (g)": "lipids",
  "Fibra Alimentar (g)": "fiber"
};

const PrincipalCardapio = props => {
  const [refeicao, setRefeicao] = useState(null);
  const [valorNutricional, setValorNutricional] = useState(null);
  const [suggestedNutFacts, setSuggestedNutFacts] = useState(null);
  const [cardapios, setCardapios] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [factors, setFactors] = useState(null);
  const [mounted, setMounted] = useState(null);
  const [mounted1, setMounted1] = useState(null);
  const [COMIDAS, setCOMIDAS] = useState(null);
  const [Available, setAvailable] = useState(null);

  useEffect(() => {
    let token = localStorage.getItem("stored_token");
    let res;
    const runEffect = async () => {
      res = await fetch("http://localhost:8080/foods/list-foods/", {
        method: "get",
        headers: new Headers({
          Authorization: "Port " + token,
          "Content-Type": "application/json"
        })
      });
      const info = await res.json();
      //console.log(info);
      setCOMIDAS(info);
      setMounted1(0);
    };

    runEffect();
  }, []);

  useEffect(() => {
    if (COMIDAS && mounted1 === 0) {
      //console.log(COMIDAS.slice(7, 15)); // aqui preciso colocar um "if not logado, entao relogar."
      setRefeicao(0);
      setValorNutricional(initializeAtributos());
      setSuggestedNutFacts([
        initializeAtributos(),
        initializeAtributos(),
        initializeAtributos(),
        initializeAtributos(),
        initializeAtributos(),
        initializeAtributos()
      ]);
      setCardapios([[], [], [], [], [], []]);
      setSuggestions([[], [], [], [], [], []]);
      setAvailable([
        COMIDAS.slice(7, 15),
        COMIDAS.slice(7, 15),
        COMIDAS.slice(7, 15),
        COMIDAS.slice(7, 15),
        COMIDAS.slice(7, 15),
        COMIDAS.slice(7, 15)
      ]);
      setFactors([
        initializeFactors(),
        initializeFactors(),
        initializeFactors(),
        initializeFactors(),
        initializeFactors(),
        initializeFactors()
      ]);
      setMounted(1);
      setMounted1(1);
    }
  }, [COMIDAS, mounted1]);

  const initializeAtributos = () => {
    let resp;
    props.atributos.map(atributo => {
      if (resp) resp.push([atributo, 0]);
      else resp = [[atributo, 0]];
    });
    return resp;
  };
  const initializeFactors = () => {
    let factors = {};
    COMIDAS.map(comida => {
      factors[comida.food_name] = 1;
    });
    return factors;
  };

  const handleTransicaoRefeicao = (e, { name, value }) => {
    if (name === "Next") {
      if (refeicao == 5) {
        props.handleGlobal({
          valorNutricional: valorNutricional,
          cardapios: cardapios,
          factors: factors
        });
        props.history.push("/cardapio/fim");
      } else setRefeicao(refeicao + 1);
    } else if (name === "Prev") {
      if (refeicao > 0) setRefeicao(refeicao - 1);
      else setRefeicao(0);
    } else if (name === "Infos") {
      setRefeicao(value);
    }
  };

  const handleSuggestedNutFacts = (new_VN, refeicao) => {
    let VN_array = suggestedNutFacts.map((item, index) => {
      if (index === refeicao) {
        return new_VN;
      }
      return item;
    });
    setSuggestedNutFacts(VN_array);
  };

  const handleCardapios = (refeicao, cardapio) => {
    const new_cardapios = cardapios.map((item, j) => {
      if (j === refeicao) {
        return cardapio;
      } else {
        return item;
      }
    });
    setCardapios(new_cardapios);
  };

  const handleAvailable = (refeicao, disponiveis) => {
    const new_disponiveis = Available.map((item, j) => {
      if (j === refeicao) {
        return disponiveis;
      } else {
        return item;
      }
    });
    setAvailable(new_disponiveis);
  };

  const handleFactors = (refeicao, factors_local) => {
    //console.log(factors_local);
    const new_factors = factors.map((item, j) => {
      if (j === refeicao) {
        return factors_local;
      } else {
        return item;
      }
    });
    setFactors(new_factors);
  };

  const handleInfos = valorNutricional => {
    setValorNutricional(valorNutricional);
  };

  const handlefoodClick = (
    new_food,
    refeicao,
    setQueryResults,
    setSearchQuery
  ) => {
    const new_disponiveis = Available.map((item, j) => {
      if (j === refeicao) {
        if (item.indexOf(new_food) === -1) item.push(new_food);
        return item;
      } else {
        return item;
      }
    });
    setQueryResults(null);
    setSearchQuery("");
    setAvailable(new_disponiveis);
  };

  if (mounted)
    return (
      <div>
        <Grid>
          <Grid.Column width={2}>
            <TabelaRefeicoes
              handleRefeicao={handleTransicaoRefeicao}
              refeicao={refeicao}
            ></TabelaRefeicoes>
          </Grid.Column>
          <Grid.Column width={3}>
            <h4>
              <Infos valorNutricional={valorNutricional}></Infos>

              <SearchFood
                handlefoodClick={handlefoodClick}
                refeicao={refeicao}
              ></SearchFood>
            </h4>
          </Grid.Column>
          <Grid.Column width={7}>
            <Refeicao
              refeicao={refeicao}
              Available={Available}
              handleAvailable={handleAvailable}
              cardapios={cardapios}
              handleCardapios={handleCardapios}
              atributos={props.atributos}
              handleInfos={handleInfos}
              factors={factors}
              handleFactors={handleFactors}
            ></Refeicao>
            <br></br>
            <br></br>
            <Grid>
              <Grid.Column floated="left">
                <Button name={"Prev"} onClick={handleTransicaoRefeicao}>
                  Prev
                </Button>
              </Grid.Column>
              <Grid.Column floated="right">
                <Button name={"Next"} onClick={handleTransicaoRefeicao}>
                  Next
                </Button>
              </Grid.Column>
            </Grid>
          </Grid.Column>
          <Grid.Column width={4}>
            <GenerateMenu
              translate_map={translate_map}
              atributos={props.atributos}
              refeicao={refeicao}
              VN={suggestedNutFacts}
              handleVNs={handleSuggestedNutFacts} // handle dos valores digitados
              handleCardapios={handleCardapios} // handle do cardapio em si
              handleFactors={handleFactors} // handle dos fatores
              factors={factors}
            ></GenerateMenu>
          </Grid.Column>
        </Grid>
      </div>
    );
  else return "";
};

export default PrincipalCardapio;
