import React, { useState, useRef, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { Button, Form, Grid, Header, Segment, Input } from "semantic-ui-react";
import { sendAuthenticatedRequest } from "../../../utility/httpHelper";
import Paginator from "../../../utility/paginator";
import {
  dateFormatValidator,
  dateValidator
} from "../../../utility/validators";
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
  const [editing, setEditing] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState(null);

  const searchRef = useRef();

  const { params } = props.match;

  useEffect(() => {
    if (params["id"]) {
      sendAuthenticatedRequest(
        "http://localhost:8080/patients/get-info/" + params["id"] + "/",
        "get",
        message => setMessage(message),
        info => {
          setName(info.name);
          setDob(info.date_of_birth);
          setRestrictions(info.food_restrictions);
        }
      );
      setEditing(true);
    }
  }, [params]);

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
    const validatorResult = dateValidator(dob);
    if (validatorResult !== "Accepted") {
      setMessage(validatorResult);
      return;
    }
    if (name.length === 0) {
      setMessage("Não há nome!");
      return;
    }
    if (!editing) {
      sendAuthenticatedRequest(
        "http://localhost:8080/patients/add-new/",
        "post",
        message => setMessage(message),
        () => {
          setMessage("Cadastro realizado com sucesso!");
          clearFields();
          setRedirectUrl("/pacientes");
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
    } else {
      sendAuthenticatedRequest(
        "http://localhost:8080/patients/edit/" + props.match.params["id"] + "/",
        "post",
        message => setMessage(message),
        () => {
          setMessage("Paciente editado com sucesso!");
          clearFields();
          setRedirectUrl("/pacientes/" + params["id"]);
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
              onChange={event => {
                const result = dateFormatValidator(
                  event.target.value,
                  event.target.value.length > dob.length
                );
                if (result === "accepted") {
                  setDob(event.target.value);
                  setMessage("");
                } else if (result === "insertSlash") {
                  setDob(
                    event.target.value.slice(0, -1) +
                      "/" +
                      event.target.value.slice(-1)
                  );
                } else if (result === "rejected") {
                  return;
                }
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
              {editing ? "Editar paciente" : "Registrar paciente"}
            </Button>
            <p>{message}</p>
          </Segment>
        </Form>
      </Grid.Column>
      {redirectUrl && <Redirect to={redirectUrl + "?refresh=true"} />}
    </Grid>
  );
};

export default Register;
