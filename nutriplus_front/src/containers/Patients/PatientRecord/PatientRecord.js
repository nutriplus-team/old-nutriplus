import React, { Component } from "react";

class PatientRecord extends Component {
  state = {};
  render() {
    const params = this.props.match.params;
    return <p>Placeholder for record creator for patient {params["id"]}</p>;
  }
}

export default PatientRecord;
