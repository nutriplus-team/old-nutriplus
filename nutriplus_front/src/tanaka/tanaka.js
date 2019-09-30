import React, { Component } from 'react';

class Tanaka extends Component {
    state = { 
        tanaka: "Eu sou o Tanaka"
     }
    render() { 
        return ( 
            <p>
            {
                this.state.tanaka
                }
            </p>
         );
    }
}
 
export default Tanaka;