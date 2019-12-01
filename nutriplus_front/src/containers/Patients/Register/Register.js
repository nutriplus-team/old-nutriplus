import React, { useState, useRef, useEffect } from "react";
import { Redirect } from "react-router-dom";
import {
  Button,
  Form,
  Grid,
  Header,
  Segment,
  Input,
  Dropdown
} from "semantic-ui-react";
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
  const [sex, setSex] = useState("");
  const [ethnicity, setEthnicity] = useState("");
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
        "/patients/get-info/" + params["id"] + "/",
        "get",
        message => setMessage(message),
        info => {
          setName(info.name);
          setDob(info.date_of_birth);
          setSex(info.biological_sex === 0 ? "Feminino" : "Masculino");
          setEthnicity(
            info.ethnic_group === 0 ? "Branco/Hispânico" : "Afroamericano"
          );
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
            "/foods/search/" + restrictionQuery + "/",
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

  const mapSex = sex => (sex === "Feminino" ? 0 : 1);

  const mapEthnicity = ethnicity =>
    ethnicity === "Branco/Hispânico" ? 0 : 1.1;

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
    if (sex.length === 0) {
      setMessage("O sexo não foi escolhido!");
      return;
    }
    if (ethnicity.length === 0) {
      setMessage("A etnia não foi escolhida!");
      return;
    }
    if (!editing) {
      sendAuthenticatedRequest(
        "/patients/add-new/",
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
          biological_sex: mapSex(sex),
          ethnic_group: mapEthnicity(ethnicity),
          food_restrictions: restrictions.reduce(
            (total, actual, index, arr) =>
              total + actual.id + (index === arr.length - 1 ? "" : "&"),
            ""
          )
        })
      );
    } else {
      sendAuthenticatedRequest(
        "/patients/edit/" + props.match.params["id"] + "/",
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
          biological_sex: mapSex(sex),
          ethnic_group: mapEthnicity(ethnicity),
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

  const sexOptions = [
    {
      key: "Masculino",
      text: "Masculino",
      value: "Masculino"
    },
    {
      key: "Feminino",
      text: "Feminino",
      value: "Feminino"
    }
  ];

  const ethnicityOptions = [
    {
      key: "Branco/Hispânico",
      text: "Branco/Hispânico",
      value: "Branco/Hispânico"
    },
    {
      key: "Afroamericano",
      text: "Afroamericano",
      value: "Afroamericano"
    }
  ];

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
              <Dropdown
                placeholder="Sexo"
                selection
                value={sex}
                onChange={(event, data) => {
                  setSex(data.value);
                }}
                options={sexOptions}
              />
            </Form.Field>
            <Form.Field>
              <Dropdown
                placeholder="Etnia"
                selection
                value={ethnicity}
                onChange={(event, data) => {
                  setEthnicity(data.value);
                }}
                options={ethnicityOptions}
              />
            </Form.Field>
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
