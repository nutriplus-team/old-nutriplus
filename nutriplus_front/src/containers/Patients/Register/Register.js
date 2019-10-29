import React, { useState, useRef, useEffect } from "react";
import { Button, Form, Grid, Header, Segment, Input } from "semantic-ui-react";
import { sendAuthenticatedRequest } from "../../../utility/httpHelper";
import Paginator from "../../../utility/paginator";
import classes from "./Register.module.css";

const Register = props => {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [restrictions, setRestrictions] = useState([]);
  const [restrictionQuery, setRestrictionQuery] = useState("");
  const [message, setMessage] = useState("");
  const [queryResults, setQueryResults] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const searchRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (restrictionQuery === searchRef.current.inputRef.current.value) {
        if (restrictionQuery !== "") {
          sendAuthenticatedRequest(
            "http://localhost:8080/foods/search/" + restrictionQuery + "/",
            "get",
            message => setMessage(message),
            info => {
              setQueryResults(info);
              setHasNext(info.next !== null);
              setHasPrevious(false);
            }
          );
        } else {
          setQueryResults(null);
        }
      }
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [restrictionQuery, searchRef]);

  const clearFields = () => {
    setName("");
    setDob("");
    setRestrictionQuery("");
    setQueryResults(null);
    setRestrictions([]);
  };

  const register = async () => {
    const fullRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!fullRegex.test(dob)) {
      setMessage("A data não está no formato DD-MM-YYYY!");
      return;
    }
    const day = +dob.slice(0, 2);
    const month = +dob.slice(3, 5);
    const year = +dob.slice(6);
    if (day === 0 || month === 0 || month > 12) {
      setMessage("Data inválida");
      return;
    } else if (
      (month < 8 && month % 2 === 1) ||
      (month >= 8 && month % 2 === 0)
    ) {
      if (day > 31) {
        setMessage("Data inválida");
        return;
      }
    } else if (month === 2) {
      if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        if (day > 29) {
          setMessage("Data inválida");
          return;
        }
      } else {
        if (day > 28) {
          setMessage("Data inválida");
          return;
        }
      }
    } else if (day > 30) {
      setMessage("Data inválida");
      return;
    }
    if (name.length === 0) {
      setMessage("Não há nome!");
      return;
    }
    sendAuthenticatedRequest(
      "http://localhost:8080/patients/add-new/",
      "post",
      message => setMessage(message),
      () => {
        setMessage("Cadastro realizado com sucesso!");
        clearFields();
      },
      JSON.stringify({
        patient: name,
        date_of_birth: dob,
        food_restrictions: restrictions.reduce(
          (total, actual, index, arr) =>
            total + actual.id + (index === arr.length - 1 ? "" : "&"),
          ""
        )
      })
    );
  };

  const handlefoodClick = food => {
    setRestrictions([...restrictions, food]);
    setRestrictionQuery("");
    setQueryResults(null);
  };

  const removeRestriction = food => {
    setRestrictions([...restrictions].filter(restrFood => restrFood !== food));
  };

  return (
    <Grid textAlign="center" style={{ height: "10vh" }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as="h2" color="teal" textAlign="center">
          Insira as informações do paciente abaixo
        </Header>
        <Form size="large">
          <Segment stacked>
            <Form.Input
              icon="id card outline"
              iconPosition="left"
              placeholder="Nome do paciente"
              onChange={event => {
                setName(event.target.value);
                setMessage("");
              }}
              value={name}
            />
            <Form.Input
              icon="calendar"
              iconPosition="left"
              placeholder="DD/MM/YYYY"
              value={dob}
              onChange={event => {
                const fullRegex = /^\d{0,3}$|^\d{0,2}\/\d{0,3}$|^\d{0,2}\/\d{0,2}\/\d{0,4}$/;
                const monthBeginRegex = /^\d{3}$/;
                const yearBeginRegex = /^\d{0,2}\/\d{3}$/;
                const inputDob = event.target.value;
                if (!fullRegex.test(inputDob)) {
                  return;
                }
                const len = dob.length;
                if (inputDob.length > len) {
                  if (
                    monthBeginRegex.test(inputDob) ||
                    yearBeginRegex.test(inputDob)
                  ) {
                    // First month digit or year digit was just filled
                    setDob(inputDob.slice(0, -1) + "/" + inputDob.slice(-1));
                    return;
                  }
                }
                // If I didn't return up until now, I should just set state to the input
                setDob(inputDob);
                setMessage("");
              }}
            />
            <Form.Field>
              <Input
                ref={searchRef}
                icon="search"
                iconPosition="left"
                placeholder="Restrições alimentares (opcional)"
                onChange={async event => {
                  setRestrictionQuery(event.target.value);
                  setMessage("");
                }}
                value={restrictionQuery}
              />
            </Form.Field>
            {restrictions.length === 0 ? null : (
              <ul>
                {restrictions.map(food => (
                  <li
                    className={classes.Food}
                    key={food.id}
                    onClick={() => removeRestriction(food)}
                  >
                    {food.food_name}
                  </li>
                ))}
              </ul>
            )}
            {queryResults && (
              <React.Fragment>
                <hr />
                <Paginator
                  queryResults={queryResults}
                  filter={food =>
                    !restrictions.some(
                      state_food => state_food.food_name === food.food_name
                    )
                  }
                  listElementMap={obj => (
                    <p
                      key={obj.id}
                      className={classes.Food}
                      onClick={() => handlefoodClick(obj)}
                    >
                      {obj.food_name}
                    </p>
                  )}
                  setResults={setQueryResults}
                  setHasNext={setHasNext}
                  setHasPrevious={setHasPrevious}
                  setMessage={setMessage}
                  hasPrevious={hasPrevious}
                  hasNext={hasNext}
                  buttonSize="mini"
                />
              </React.Fragment>
            )}
            <Button color="teal" fluid size="large" onClick={register}>
              Registrar paciente
            </Button>
            <p>{message}</p>
          </Segment>
        </Form>
      </Grid.Column>
    </Grid>
  );
};

export default Register;
