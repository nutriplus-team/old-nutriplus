import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Tanaka from './tanaka/tanaka';
import { Button } from 'semantic-ui-react';
import axios from 'axios';



class App extends Component {
  state = {  }
  
  componentDidMount = () => {

  }
  
  login = async () => {
    const res = await fetch('http://localhost:8080/user/login/', 
    {
      method: "post",
      body: JSON.stringify({ username: 'ocimar', password: 'senhadoocimar' }),
      headers: new Headers({ "Content-Type": "application/json" })
    }
    )
    const info = await res.json();
    console.log(info.token);

    
  }

  render() { 
    return (  
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
              Edit <code>src/App.js</code> and save to reload.
              Hey I'm Lucas _
            </p>
            <Button onClick = {this.login}>BOTAOOOOO</Button>
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </a>
            
            <Tanaka></Tanaka>
          </header>
        </div>
    );
  }
}
 
export default App;
