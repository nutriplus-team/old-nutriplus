export const sendAuthenticatedRequest = async (
  url,
  method,
  setMessage,
  afterRequest,
  body = null
) => {
  let response;
  if (body) {
    response = await fetch(url, {
      method: method,
      body: body,
      headers: new Headers({
        Authorization: "Port " + localStorage.getItem("stored_token"),
        "Content-Type": "application/json"
      })
    });
  } else {
    response = await fetch(url, {
      method: method,
      headers: new Headers({
        Authorization: "Port " + localStorage.getItem("stored_token")
      })
    });
  }

  const responseJson = await response.json();
  if (response.status === 400) {
    setMessage("Houve algum problema ao tentar carregar a ficha do paciente!");
  } else if (response.status === 200) {
    afterRequest(responseJson);
  } else if (response.status === 401) {
    setMessage("A sua sessão expirou! Por favor dê logout e login de novo.");
  }
};
