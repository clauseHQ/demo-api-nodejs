const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');
const crypto = require('crypto');
const querystring = require('querystring');
const jwt = require('jsonwebtoken');

const AUTH_CONFIG = require('./src/config');
const API_URL = 'https://api.clause.io/v1';
const PORT = 5000;

/**
 * WARNING
 * This sample does not authenticate requests between the client and the server. 
 * You should secure API requests between your client and server to protect your Clause data.
 * 
 * The sample only demonstrates the server-side code for using the Clause API
 */

// These local variables are shared by all consumers of this API, 
// The values should be stored securely and associated with your app's user id
let verifier;
let token;

// The scope determines which API resources and operations can be accessed. 'write:all' is the most permissive.
// Use the least permissive scopes where possible. 
const scope = 'write:all';

const app = express();

app.use(cors());
app.use(morgan('API Request (port '+PORT+'): :method :url :status :response-time ms - :res[content-length]'));
app.use(express.json());

// This exposes our sample UI
app.use(express.static(path.join(__dirname, 'build')));
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// This API performs the first step of the authorization flow
app.get('/connect', (req, res) => {
  const encode = buffer => buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
    
  // The verifier code needs to be stored securely until the callback is called. The verifier is unique to the user
  verifier = encode(crypto.randomBytes(32));

  const challenge = encode(
    crypto.createHash('sha256')
      .update(verifier)
      .digest()
  );

  // Send the user to the Clause authorization page where they grant access to their Clause account 
  res.redirect(`https://${AUTH_CONFIG.domain}/authorize?audience=${AUTH_CONFIG.apiUrl}&scope=${scope}&response_type=code&client_id=${AUTH_CONFIG.clientId}&redirect_uri=${AUTH_CONFIG.callbackUrl}&code_challenge=${challenge}&code_challenge_method=S256`);
});

// This API is where Clause sends back the authorization code
app.get('/callback', (req, res) => {
  // Get the value from /callback?code=value
  const code = req.query.code;

  // Exchange the code for an access token
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
    .then(({data}) => {
      token = data.access_token;
      res.redirect('/');
    })
    .catch(error => console.error(error));
});

// A sample proxy to the user profile API
app.get('/api/profile', function(req, res) {
  if(token){
    const decoded = jwt.decode(token);
    const userId = decoded.sub.substring(6); // Strip the prefix 'auth0|'

    const headers = { 'Authorization': `Bearer ${token}`}
    axios.get(`${API_URL}/users/${userId}/full`, { headers })
      .then(({ data }) => res.send(data))
      .catch(error => console.error(error));
  } else {
    res.send(401);
  }
});

// A sample proxy to the contracts API
app.get('/api/contracts', function(req, res) {
  if(token){
    const headers = { 'Authorization': `Bearer ${token}`}
    axios.get(`${API_URL}/contracts/list`, { headers })
        .then(({ data }) => res.send(data));
  } else {
    res.send(401);
  }
});

// start server on the specified port and binding host
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
