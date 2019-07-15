# Clause - API Sample

This sample demonstrates how authenticate against the [Clause API](https://developers.clause.io) from a Node.js server.

## Warning

This sample does not authenticate requests between the client and the server. You should secure API requests between your client and your server to protect your Clause data.

The sample only demonstrates the server-side code for using the Clause API.

## Getting Started

To use this sample, create a file `config.js` in the `/src` directory with the contents:
```
module.exports = {
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

You should now be able to run the sample on your local machine: [localhost:5000/](http://localhost:5000/)

## Troubleshooting

If you receive the following error:
```
unauthorized_client: Callback URL mismatch. http://localhost:5000/callback is not in the list of allowed callback URLs
```
Then you should contact Clause [support](support@clause.io) to get your callback URL added to your Auth0 application.

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
