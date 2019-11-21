import React, { Component } from "react";
import { Input, Table } from "semantic-ui-react";
import { numberValidator } from "../../../utility/validators";

class EditableCell extends Component {
  constructor(props) {
    super(props);
    this.state = { editing: false };
  }

  _handleKeyDown = e => {
    if (e.key === "Enter") {
      this.onBlur();
    }
  };

  render() {
    const { value, onChange, isNumber } = this.props;

    return this.state.editing ? (
      <Table.Cell>
        <Input
          ref="input"
          value={value}
          onChange={e => {
            const value = e.target.value;
            if (isNumber) {
              if (numberValidator(value, 4, true, 1)) onChange(value);
            } else {
              onChange(value);
            }
          }}
          onBlur={() => this.onBlur()}
          onKeyDown={this._handleKeyDown}
        />
      </Table.Cell>
    ) : (
      <Table.Cell onClick={() => this.onFocus()}>{value}</Table.Cell>
    );
  }

  onFocus() {
    this.setState({ editing: true }, () => {
      this.refs.input.focus();
    });
  }

  onBlur() {
    this.setState({ editing: false });
  }
}

export default EditableCell;
