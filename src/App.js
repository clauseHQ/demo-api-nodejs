import React, { Component } from 'react';
import { Container, Button, Segment, Header, Divider } from 'semantic-ui-react'
import './App.css';
import AUTH_CONFIG from './config';
import axios from 'axios';

class App extends Component {
  state = { 
    profile: {},
    contracts: []
  };

  login() {
    window.location = `/connect`;
  }

  logout() {    
    window.location = `https://${AUTH_CONFIG.domain}/v2/logout`;
  }

  getProfile(){
    axios.get('/api/profile')
    .then(({ data }) => this.setState({ profile: data }));
  }

  getContracts(){
    axios.get(`/api/contracts`)
      .then(({ data }) => this.setState({ contracts: data }));
  }

  render() {
    const { contracts, profile } = this.state

    return (
      <Container text>
        <Header as='h1' dividing>
          Clause API Sample
        </Header>
        
        <Segment>
          <Header as='h2'>1. Connect</Header>
          <p>
            Before a user can use the Clause API they will need to grant your app access their data.
            Click <em>Connect to Clause</em> to grant access to this sample app.
          </p>
          <Button onClick={this.login.bind(this)}>
            Connect to Clause
          </Button>
        </Segment>
        <Segment fluid styled>
          <Header as='h2'>2. Sample API, User Profile</Header>
          <p>
          As the first test of the Clause API, we retrieve the current user's profile. 
          </p>
          <p>
            This uses the <a href='https://developers.clause.io/reference#userfindfulluserbyid'>GET users/[userId]/full</a> API.
          </p>
          <Button onClick={this.getProfile.bind(this)}>
            Get User Profile
          </Button>
          <Divider />
          {
            profile.firstName &&
            <p>
              <Header as='h3'>Name:</Header>
              <span>{profile.firstName} {profile.lastName}</span>
            </p>
          }
          {
            profile.email &&
            <p>
              <Header as='h3'>Email:</Header>
              <span>{profile.email}</span>
            </p>
          }
        </Segment>
        <Segment fluid styled>
          <Header as='h2'>3. Sample API, List Contracts</Header>
            <p>
              Next we retrieve a list of all contracts in the user's organization.
            </p>
            <p>
              This uses the <a href='https://developers.clause.io/reference#contractfind'>GET contracts/list</a> API.
            </p>
            <Button onClick={this.getContracts.bind(this)}>
              Get Contracts
            </Button>
            <Divider />
            { 
              contracts.length > 0 &&
              <div>
                <Header as='h3'>Contracts</Header>
                <ul>
                  { contracts.map((contract, index) => (
                    <li key={index}>
                      <p>
                        <a href={'https://hub.clause.io/contract/'+contract.id}>{contract.name}</a>, {contract.status}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            }            
        </Segment>
      </Container>

    );
  }
}

export default App;
