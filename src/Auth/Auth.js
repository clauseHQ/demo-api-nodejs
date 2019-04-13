import { AUTH_CONFIG } from './auth0-variables';
import { API_URL } from './../constants';
import history from '../history';
import crypto from 'crypto';
import axios from 'axios';
import querystring from 'querystring';
import jwt from 'jsonwebtoken';

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
    const verifier = encode(crypto.randomBytes(32));
    localStorage.setItem('verifier', verifier);

    const challenge = encode(
      crypto.createHash('sha256')
        .update(verifier)
        .digest()
    );
    
    window.location = `https://${AUTH_CONFIG.domain}/authorize?audience=${AUTH_CONFIG.apiUrl}&scope=write:all&response_type=code&client_id=${AUTH_CONFIG.clientId}&redirect_uri=${AUTH_CONFIG.callbackUrl}&code_challenge=${challenge}&code_challenge_method=S256`;
  }

  handleAuthentication(code) {
    const verifier = localStorage.getItem('verifier');

    const body = querystring.stringify({
      grant_type: 'authorization_code',
      client_id: AUTH_CONFIG.clientId,
      code_verifier: verifier,
      code,
      redirect_uri: AUTH_CONFIG.callbackUrl
    });
  
    const headers = {
      'Content-Length': body.length,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    axios.post(`https://${AUTH_CONFIG.domain}/oauth/token`, body, {headers })
      .then(({data}) => this.setSession(data))
      .catch(error => console.error(error));
  }

  getAccessToken() {
    return this.accessToken;
  }

  getIdToken() {
    return this.idToken;
  }

  setSession(authResult) {
    if (authResult && authResult.access_token) {
        
      // Set isLoggedIn flag in localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.removeItem('verifier');

      // Set the time that the access token will expire at
      let expiresAt = (authResult.expires_in * 1000) + new Date().getTime();
      this.accessToken = authResult.access_token;
      this.expiresAt = expiresAt;

      // navigate to the home route
      history.replace('/home');
    }
  }

  renewSession() {
    // We cannot renew the session, so we should login again
    localStorage.removeItem('isLoggedIn');
  }

  getProfile(cb) {
    const token = this.getAccessToken();
    const decoded = jwt.decode(token);
    const userId = decoded.sub.substring(6); // Strip the prefix 'auth0|'

    const headers = { 'Authorization': `Bearer ${token}`}
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
