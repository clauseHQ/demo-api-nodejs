import { AUTH_CONFIG } from './auth0-variables';
import { API_URL } from './../constants';
import history from '../history';
import crypto from 'crypto';
import axios from 'axios';
import request from 'request';
import querystring from 'querystring';

export default class Auth {
  accessToken;
  idToken;
  expiresAt;
  userProfile;
  verifier;

  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.getAccessToken = this.getAccessToken.bind(this);
    this.getIdToken = this.getIdToken.bind(this);
    this.renewSession = this.renewSession.bind(this);
    this.getProfile = this.getProfile.bind(this);
  }

  login() {
    const encode = buffer => buffer.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    this.verifier = encode(crypto.randomBytes(32));
    const challenge = verifier => encode(
      crypto.createHash('sha256')
        .update(verifier)
        .digest()
    );
    
    localStorage.setItem('verifier', this.verifier);
    window.location = `https://${AUTH_CONFIG.domain}/authorize?audience=${AUTH_CONFIG.apiUrl}&scope=write:all&response_type=code&client_id=${AUTH_CONFIG.clientId}&redirect_uri=${AUTH_CONFIG.callbackUrl}&code_challenge=${challenge(this.verifier)}&code_challenge_method=S256`;
  }

  handleAuthentication(code) {
    this.verifier = localStorage.getItem('verifier');

    const body = querystring.stringify({
      grant_type: 'authorization_code',
      client_id: AUTH_CONFIG.clientId,
      code_verifier: this.verifier,
      code,
      redirect_uri: AUTH_CONFIG.callbackUrl
    });
  
    return request({
      uri: `https://${AUTH_CONFIG.domain}/oauth/token`,
      method: 'POST',
      headers: {
        'Content-Length': body.length,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    }, (error, response, body) => {
      if(!error){
        const authResult = JSON.parse(body);
        if (authResult && authResult.access_token) {
          this.setSession(authResult);
        } else  {
          history.replace('/home');
          console.error(error);
          alert(`Error: ${error.error}. Check the console for further details.`);
        }
      } else  {
        history.replace('/home');
        console.error(error);
        alert(`Error: ${error.error}. Check the console for further details.`);
      }
      

      return;
    });
  }

  getAccessToken() {
    return this.accessToken;
  }

  getIdToken() {
    return this.idToken;
  }

  setSession(authResult) {
    // Set isLoggedIn flag in localStorage
    localStorage.setItem('isLoggedIn', 'true');

    // Set the time that the access token will expire at
    let expiresAt = (authResult.expires_in * 1000) + new Date().getTime();
    this.accessToken = authResult.access_token;
    this.expiresAt = expiresAt;

    // navigate to the home route
    history.replace('/home');
  }

  renewSession() {
    // this.auth0.checkSession({}, (err, authResult) => {
    //    if (authResult && authResult.accessToken && authResult.idToken) {
    //      this.setSession(authResult);
    //    } else if (err) {
    //      this.logout();
    //      console.log(err);
    //      alert(`Could not get a new token (${err.error}: ${err.error_description}).`);
    //    }
    // });
  }

  getProfile(cb) {
    const userId = '5afacb60cb1324958d9b1b90';

    const headers = { 'Authorization': `Bearer ${this.getAccessToken()}`}
    axios.get(`${API_URL}/users/${userId}/full`, { headers })
      .then(response => {
        this.userProfile = response.data;
        cb(null, this.userProfile);
      })
      .catch(error => cb(error, null));
  }

  logout() {
    // Remove tokens and expiry time
    this.accessToken = null;
    this.idToken = null;
    this.expiresAt = 0;

    // Remove user profile
    this.userProfile = null;

    // Remove isLoggedIn flag from localStorage
    localStorage.removeItem('isLoggedIn');

    window.location = `https://${AUTH_CONFIG.domain}/v2/logout`;
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = this.expiresAt;
    return new Date().getTime() < expiresAt;
  }
}
