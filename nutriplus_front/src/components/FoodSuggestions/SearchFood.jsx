import React, { useState, useRef, useEffect } from "react";
import { Form, Input } from "semantic-ui-react";
import { sendAuthenticatedRequest } from "../../utility/httpHelper";
import Paginator from "../../utility/paginator";

const SearchFood = props => {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [queryResults, setQueryResults] = useState(null);
  const searchRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log(searchRef);
      if (searchQuery === searchRef.current.inputRef.current.value) {
        if (searchQuery !== "") {
          sendAuthenticatedRequest(
            "/foods/search/" + searchQuery + "/",
            "get",
            message => {},
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
  }, [searchQuery, searchRef]);

  return (
    <div>
      <Form.Field>
        <Input
          ref={searchRef}
          icon="search"
          iconPosition="left"
          placeholder="Comidas a inserir"
          onChange={async event => {
            setSearchQuery(event.target.value);
          }}
          value={searchQuery}
        />
      </Form.Field>
      {queryResults && (
        <React.Fragment>
          <hr />
          <Paginator
            queryResults={queryResults}
            filter={() => true}
            listElementMap={obj => (
              <p
                style={{ cursor: "pointer" }}
                key={obj.id}
                onClick={() =>
                  props.handlefoodClick(
                    obj,
                    props.refeicao,
                    setQueryResults,
                    setSearchQuery
                  )
                }
              >
                {obj.food_name}
              </p>
            )}
            setResults={setQueryResults}
            setHasNext={setHasNext}
            setHasPrevious={setHasPrevious}
            setMessage={() => {}}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            buttonSize="mini"
          />
        </React.Fragment>
      )}
    </div>
  );
};

export default SearchFood;
