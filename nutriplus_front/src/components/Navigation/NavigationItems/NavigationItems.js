import React from "react";

import classes from "./NavigationItems.module.css";
import NavigationItem from "./NavigationItem/NavigationItem";

const navigationItems = props => (
  <ul className={classes.NavigationItems}>
    <NavigationItem link="/" exact>
      Home
    </NavigationItem>
    {props.isAuthenticated ? (
      <NavigationItem link="/pacientes">Pacientes</NavigationItem>
    ) : null}
    {props.isAuthenticated ? (
      <NavigationItem link="/cardapio">Cardápio</NavigationItem>
    ) : null}
    {!props.isAuthenticated ? (
      <NavigationItem link="/auth">Login</NavigationItem>
    ) : (
      <NavigationItem link="/logout">Logout</NavigationItem>
    )}
  </ul>
);

export default navigationItems;
