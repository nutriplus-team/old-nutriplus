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
    setMessage("A sua sessão expirou! Logando de novo...");
    const res2 = await fetch("http://localhost:8080/user/token/refresh/", {
      method: "post",
      body: JSON.stringify({
        refresh: localStorage.getItem("stored_refresh")
      }),
      headers: new Headers({
        "Content-Type": "application/json"
      })
    });
    const info2 = await res2.json();
    localStorage.setItem("stored_token", info2.access);
    setMessage("Sessão restaurada!");
    sendAuthenticatedRequest(url, method, setMessage, afterRequest, body);
  }
};
