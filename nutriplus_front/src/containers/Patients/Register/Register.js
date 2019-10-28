import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Form,
  Grid,
  Header,
  Segment,
  Icon,
  Input
} from "semantic-ui-react";
import { sendAuthenticatedRequest } from "../../../utility/httpHelper";
import classes from "./Register.module.css";

const Register = props => {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [restrictions, setRestrictions] = useState([]);
  const [restrictionQuery, setRestrictionQuery] = useState("");
  const [queryResults, setQueryResults] = useState(null);
  const [message, setMessage] = useState("");
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
              if (info.next) {
                setHasNext(true);
              } else {
                setHasNext(false);
              }
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
    console.log(
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
    const res = await fetch("http://localhost:8080/patients/add-new/", {
      method: "post",
      body: JSON.stringify({
        patient: name,
        date_of_birth: dob,
        food_restrictions: restrictions.reduce(
          (total, actual, index, arr) =>
            total + actual.id + (index === arr.length - 1 ? "" : "&"),
          ""
        )
      }),
      headers: new Headers({
        Authorization: "Port " + localStorage.getItem("stored_token"),
        "Content-Type": "application/json"
      })
    });
    console.log(res);
    const info = await res.json();
    if (res.status === 400) {
      setMessage("Houve um erro no cadastro!");
      console.log(info);
    } else if (res.status === 200) {
      setMessage("Cadastro realizado com sucesso!");
      clearFields();
      console.log(info);
    } else if (res.status === 401) {
      setMessage("A sua sessão expirou! Por favor dê logout e login de novo.");
      //   const res2 = await fetch("http://localhost:8080/user/token/refresh/", {
      //     method: "post",
      //     body: JSON.stringify({
      //       refresh: localStorage.getItem("stored_refresh")
      //     }),
      //     headers: new Headers({
      //       "Content-Type": "application/json"
      //     })
      //   });
      //   const info2 = await res2.json();
      //   console.log(info2);
      //   localStorage.setItem("stored_token", info2.access);
      //   this.setState({ message: "Sessão restaurada!" });
    }
  };

  // use as handleChangePage("next") or handleChangePage("previous")
  const handleChangePage = async str => {
    const res = await fetch(queryResults[str], {
      method: "get",
      headers: new Headers({
        Authorization: "Port " + localStorage.getItem("stored_token")
      })
    });
    console.log(res);
    const info = await res.json();
    if (res.status === 400) {
      setMessage("Houve um erro no cadastro!");
      console.log(info);
    } else if (res.status === 200) {
      setQueryResults(info);
      if (info.previous) {
        setHasPrevious(true);
      } else {
        setHasPrevious(false);
      }
      if (info.next) {
        setHasNext(true);
      } else {
        setHasNext(false);
      }
      console.log(info);
    } else if (res.status === 401) {
      setMessage("A sua sessão expirou! Por favor dê logout e login de novo.");
    }
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
              // TODO: make this update function foolproof
              onChange={event => {
                const inputDob = event.target.value;
                const actualIndex = dob.length;
                if (inputDob.length > actualIndex) {
                  const lastChar = inputDob[actualIndex];
                  if (lastChar < "0" || lastChar > "9") {
                    return;
                  }
                  if (actualIndex === 2 || actualIndex === 5) {
                    // First month digit or year digit was just filled
                    setDob(inputDob.slice(0, -1) + "/" + inputDob.slice(-1));
                    return;
                  }
                  if (actualIndex === 10) {
                    // Date should be finished
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
            {queryResults ? (
              <React.Fragment>
                <hr />
                {queryResults.results
                  .filter(
                    food =>
                      !restrictions.some(
                        state_food => state_food.food_name === food.food_name
                      )
                  )
                  .map(obj => (
                    <p
                      key={obj.id}
                      className={classes.Food}
                      onClick={() => handlefoodClick(obj)}
                    >
                      {obj.food_name}
                    </p>
                  ))}
                <Button
                  onClick={() => handleChangePage("previous")}
                  icon
                  floated="left"
                  size="mini"
                  disabled={!hasPrevious}
                >
                  <Icon name="angle double left" />
                </Button>

                <Button
                  onClick={() => handleChangePage("next")}
                  disabled={!hasNext}
                  icon
                  floated="right"
                  size="mini"
                >
                  <Icon name="angle double right" />
                </Button>
              </React.Fragment>
            ) : null}
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
