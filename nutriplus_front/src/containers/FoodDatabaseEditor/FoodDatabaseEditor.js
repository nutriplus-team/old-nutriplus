import React, { useState, useEffect, useRef, useCallback } from "react";
import { Form, Input, Grid, Table } from "semantic-ui-react";
import EditableTableRow from "../EditableTableRow/EditableTableRow";
import { sendAuthenticatedRequest } from "../../utility/httpHelper";
import Paginator from "../../utility/paginator";

const FoodDatabaseEditor = () => {
  const [foodsQueryInfo, setFoodsQueryInfo] = useState(null);
  const [error, setError] = useState(null);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [restrictionQuery, setRestrictionQuery] = useState("");

  const searchRef = useRef();

  const initializeTable = useCallback(() => {
    sendAuthenticatedRequest(
      "http://localhost:8080/foods/list-foods-pagination/",
      "get",
      message => setError(message),
      info => {
        setFoodsQueryInfo(info);
        setError(null);
        setHasPrevious(false);
        setHasNext(info.next !== null);
      }
    );
  }, []);

  useEffect(initializeTable, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (restrictionQuery === searchRef.current.inputRef.current.value) {
        if (restrictionQuery !== "") {
          sendAuthenticatedRequest(
            "http://localhost:8080/foods/search/" + restrictionQuery + "/",
            "get",
            message => setError(message),
            info => {
              setFoodsQueryInfo(info);
              setHasNext(info.next !== null);
              setHasPrevious(false);
            }
          );
        } else {
          initializeTable();
        }
      }
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [restrictionQuery, searchRef, initializeTable]);

  return (
    <Grid centered>
      <Grid.Column width={12}>
        <Form.Field>
          <Input
            ref={searchRef}
            icon="search"
            iconPosition="left"
            placeholder="Nome da comida"
            onChange={async event => {
              setRestrictionQuery(event.target.value);
              setError("");
            }}
            value={restrictionQuery}
          />
        </Form.Field>
        {foodsQueryInfo && (
          <Paginator
            queryResults={foodsQueryInfo}
            filter={() => true}
            listElementMap={food => (
              <EditableTableRow food={food} key={food.id} />
            )}
            setResults={foodInfo => {
              setFoodsQueryInfo(foodInfo);
            }}
            setHasNext={value => setHasNext(value)}
            setHasPrevious={value => setHasPrevious(value)}
            setMessage={message => setError(message)}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            buttonSize="huge"
            isTable
            tableHeader={
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Alimento</Table.HeaderCell>
                  <Table.HeaderCell>Grupo do alimento</Table.HeaderCell>
                  <Table.HeaderCell>
                    Peso da porção (em gramas)
                  </Table.HeaderCell>
                  <Table.HeaderCell>Unidade da medida</Table.HeaderCell>
                  <Table.HeaderCell>Quantidade da medida</Table.HeaderCell>
                  <Table.HeaderCell>Valor energético (kcal)</Table.HeaderCell>
                  <Table.HeaderCell>Proteínas (g)</Table.HeaderCell>
                  <Table.HeaderCell>Carboidratos (g)</Table.HeaderCell>
                  <Table.HeaderCell>Lipídios (g)</Table.HeaderCell>
                  <Table.HeaderCell>Fibra alimentar (g)</Table.HeaderCell>
                  <Table.HeaderCell>Refeições</Table.HeaderCell>
                  <Table.HeaderCell></Table.HeaderCell>
                </Table.Row>
              </Table.Header>
            }
          />
        )}
        {error && <p>{error}</p>}
      </Grid.Column>
    </Grid>
  );
};

export default FoodDatabaseEditor;
