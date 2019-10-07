import React, { useEffect } from "react";
import { Redirect } from "react-router-dom";

const Logout = props => {
  useEffect(() => {
    props.updateLogout();
  }, [props]);
  return <Redirect to="/" />;
};

export default Logout;
