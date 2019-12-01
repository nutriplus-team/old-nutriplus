import React from "react";
import { Button, Icon, Table } from "semantic-ui-react";

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
      },
      null,
      true
    );
  };

  let results = props.queryResults.results
    .filter(props.filter)
    .map(props.listElementMap);

  if (props.isList) {
    results = (
      <ul style={{ listStyleType: "none", paddingLeft: 0 }}>{results}</ul>
    );
  }

  if (props.isTable) {
    results = (
      <Table>
        {props.tableHeader}
        <Table.Body>{results}</Table.Body>
      </Table>
    );
  }

  const prevButton = (
    <Button
      onClick={() => handleChangePage("previous")}
      icon
      floated="left"
      size={props.buttonSize || "medium"}
      disabled={!props.hasPrevious}
    >
      <Icon name="angle double left" />
    </Button>
  );
  const nextButton = (
    <Button
      onClick={() => handleChangePage("next")}
      disabled={!props.hasNext}
      icon
      floated="right"
      size={props.buttonSize || "medium"}
    >
      <Icon name="angle double right" />
    </Button>
  );

  return (
    <React.Fragment>
      {results}
      {(props.queryResults.next || props.queryResults.previous) && (
        <React.Fragment>
          {prevButton}
          {nextButton}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default paginator;
