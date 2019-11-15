import React, { Component } from "react";
import { Table, Button } from "semantic-ui-react";
import EditableCell from "./EditableCell/EditableCell";

class EditableTableRow extends Component {
  constructor(props) {
    super(props);
    this.state = { modified: false };
    Object.keys(this.props.food)
      .filter(key => key !== "id")
      .forEach(key =>
        key === "nutrition_facts"
          ? Object.keys(this.props.food[key]).forEach(
              nutritionKey =>
                (this.state[
                  nutritionKey + this.props.food.id
                ] = this.props.food[key][nutritionKey])
            )
          : key === "meal_set"
          ? (this.state[key + this.props.food.id] = this.props.food[key]
              .map(meal => this.mapMeal(meal))
              .reduce(
                (total, actual, index, array) =>
                  index === array.length - 1
                    ? total + actual
                    : total + actual + ", ",
                ""
              ))
          : (this.state[key + this.props.food.id] = this.props.food[key])
      );
  }

  mapMeal = mealNumber => {
    switch (mealNumber) {
      case 1:
        return "Café da manhã";
      case 2:
        return "Lanche da manhã";
      case 3:
        return "Almoço";
      case 4:
        return "Lanche da tarde";
      case 5:
        return "Jantar";
      case 6:
        return "Lanche da noite";
      default:
        return "Wrong usage";
    }
  };

  render() {
    return (
      <Table.Row>
        {Object.keys(this.props.food)
          .filter(key => key !== "id")
          .map(key =>
            key === "nutrition_facts" ? (
              Object.keys(this.props.food[key]).map(nutritionKey => (
                <EditableCell
                  key={nutritionKey + this.props.food.id}
                  value={this.state[nutritionKey + this.props.food.id]}
                  onChange={value =>
                    this.setState({
                      [nutritionKey + this.props.food.id]: value,
                      modified: true
                    })
                  }
                  isNumber
                />
              ))
            ) : key === "meal_set" ? (
              <EditableCell
                key={key + this.props.food.id}
                value={this.state[key + this.props.food.id]}
                onChange={value =>
                  this.setState({
                    [key + this.props.food.id]: value,
                    modified: true
                  })
                }
              />
            ) : key === "measure_amount" || key === "measure_total_grams" ? (
              <EditableCell
                key={key + this.props.food.id}
                value={this.state[key + this.props.food.id]}
                onChange={value =>
                  this.setState({
                    [key + this.props.food.id]: value,
                    modified: true
                  })
                }
                isNumber
              />
            ) : (
              <EditableCell
                key={key + this.props.food.id}
                value={this.state[key + this.props.food.id]}
                onChange={value =>
                  this.setState({
                    [key + this.props.food.id]: value,
                    modified: true
                  })
                }
              />
            )
          )}
        <Table.Cell>
          <Button
            onClick={() => console.log("RowState", this.state)}
            size="medium"
            disabled={!this.state.modified}
          >
            Salvar
          </Button>
        </Table.Cell>
      </Table.Row>
    );
  }
}

export default EditableTableRow;
