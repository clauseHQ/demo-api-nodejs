# Clause - API Sample

This samples demonstrates how authenticate against the [Clause API](https://developers.clause.io) from a React single-page application (SPA).

## Getting Started

To use this sample, create a file `src/Auth/auth0-variables.js` with the contents:
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

## Author

This is sample is based on the excellent samples from [Auth0](auth0.com) and modified by [Clause](clause.io).

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
