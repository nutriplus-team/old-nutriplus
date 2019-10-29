import React from "react";
import { Button, Icon } from "semantic-ui-react";

import { sendAuthenticatedRequest } from "./httpHelper";

const paginator = props => {
  // use as handleChangePage("next") or handleChangePage("previous")
  const handleChangePage = async str => {
    sendAuthenticatedRequest(
      props.queryResults[str],
      "get",
      message => props.setMessage(message),
      info => {
        props.setResults(info);
        props.setHasPrevious(info.previous !== null);
        props.setHasNext(info.next != null);
      }
    );
  };

  let results = props.queryResults.results
    .filter(props.filter)
    .map(props.listElementMap);

  if (props.isList) {
    results = <ul>{results}</ul>;
  }

  return (
    <React.Fragment>
      {results}
      {(results.length > 1 || results.length === null) && (
        <React.Fragment>
          <Button
            onClick={() => handleChangePage("previous")}
            icon
            floated="left"
            size={props.buttonSize || "medium"}
            disabled={!props.hasPrevious}
          >
            <Icon name="angle double left" />
          </Button>

          <Button
            onClick={() => handleChangePage("next")}
            disabled={!props.hasNext}
            icon
            floated="right"
            size={props.buttonSize || "medium"}
          >
            <Icon name="angle double right" />
          </Button>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default paginator;
