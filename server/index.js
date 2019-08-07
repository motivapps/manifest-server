require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');
const passport = require('passport');
const plaid = require('plaid');
const { sequelize, models } = require('./models/index');
const moment = require('moment');

/**
 * express required to aid in in handeling request made to server
 * session required to aid with passport request for google authentication
 * path required to aid in redirects to avoid landing on incorrect endpoint
 * axios required to send requests
 * bodyParse required to retrieve information from body while avoiding chunks
 * passport required in retrieving info from google authentication
 */

const app = express();

/**
 * middleware assigned to app for use with incoming requests
 */

app.use(express.static(path.join(__dirname, '../dist')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(session({ secret: 'anything' }));
// app.use(passport.initialize());
// app.use(passport.session());

app.get('http://127.0.0.1:4041', (req, res) => {
  console.log('inside app get');
  console.log('req:', req);
});

let ACCESS_TOKEN = null;
let PUBLIC_TOKEN = null;

const client = new plaid.Client(
  process.env.PLAID_CLIENT_ID,
  process.env.PLAID_SECRET,
  process.env.PLAID_PUBLIC_KEY,
  plaid.environments.sandbox,
  {version: '2018-05-22'}
);

app.post('/get_access_token', (req, res, next) => {
  PUBLIC_TOKEN = req.body.public_token;
  client.exchangePublicToken(PUBLIC_TOKEN, (err, tokenResponse) => {
    if (err) {
      console.error('Problem exchanging public token ' + err);
    }
    ACCESS_TOKEN = tokenResponse.access_token;
    ITEM_ID = tokenResponse.item_id;
    axios.get('http://localhost/auth');
    console.log(JSON.stringify(tokenResponse));
    // ADD ACCESS_TOKEN AND ITEM_ID TO DATABASE HERE
    res.json({
      access_token: ACCESS_TOKEN,
      item_id: ITEM_ID,
      error: false
    });
  });
});

app.get('/auth', (req, res) => {
  client.getAuth(ACCESS_TOKEN, (err, authResponse) => {
    if (err) {
      console.error(err);
    }
    console.log(authResponse);
    res.json({ error: null, auth: authResponse });
  });
});

app.post('/transaction_hook', (req, res) => {
  console.log(req);
  // check if req.body.webhook_code is DEFAULT_UPDATE
  // if it is, make a request to Plaid for transaction data
  // if (req.body.webhook_code === 'DEFAULT_UPDATE') {
  const startDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
  const endDate = moment().format('YYYY-MM-DD');
  client.getTransactions(ACCESS_TOKEN, startDate, endDate, { offset: 0 }, (err, transactionRes) => {
    if (err) {
      console.error(err);
    } else {
      console.log(transactionRes);
      // DATABASE WORK HERE
      // Parse this data, send suspicious transactions to the database
      res.json({ transactions: transactionRes });
    }
  });
  // }
});

sequelize.sync({ force: false }).then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Your app is manifesting on port ${process.env.PORT}!`);
  });
});