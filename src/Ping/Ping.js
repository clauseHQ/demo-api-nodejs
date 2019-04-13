import React, { Component } from 'react';
import { API_URL } from './../constants';
import axios from 'axios';

class Ping extends Component {

  constructor(props){
    super(props);
    this.state = {
      contracts: [],
    };
  }
  componentWillMount() {
    const { getAccessToken } = this.props.auth;
    const headers = { 'Authorization': `Bearer ${getAccessToken()}`}
    axios.get(`${API_URL}/contracts/search`, { headers })
      .then(response => this.setState({ contracts: response.data.contracts }))
      .catch(error => this.setState({ message: error.message }));
  }
  render() {
    const { isAuthenticated } = this.props.auth;
    const { contracts } = this.state;
    return (
      <div className="container">
        <h2>Contracts</h2>
        {
          !isAuthenticated() &&
            <p>Log in to list your contracts.</p>
        }
        {
          isAuthenticated() && (
            <ul>
              { contracts.map((contract, index) => (
                <li key={index}>
                  <p>
                    <a href={'https://hub.clause.io/contract/'+contract.id}>{contract.name}</a>
                  </p>
                </li>
              ))}
            </ul>
            )
        }
      </div>
    );
  }
}

export default Ping;
