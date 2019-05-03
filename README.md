# Clause - API Sample

This sample demonstrates how authenticate against the [Clause API](https://developers.clause.io) from a React single-page application (SPA).

## Warning

This sample does not authenticate requests between the client and the server. You should secure API requests between your client and your server to protect your Clause data.

The sample only demonstrates the server-side code for using the Clause API.

## Getting Started

To use this sample, create a file `config.js` with the contents:
```
export const AUTH_CONFIG = {
  domain: 'login.clause.io',
  clientId: {CLIENT_ID},
  callbackUrl: 'http://localhost:3000/callback',
  apiUrl: 'https://api.clause.io'
}
```

You should replace `{CLIENT_ID}` with the value of your Client ID. Your Client ID can be found by following the instructions at [developers.clause.io](https://developers.clause.io)

Then enter the following commands at the terminal to run the sample on your machine
```
npm install
npm run start
```

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
