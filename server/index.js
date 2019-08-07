require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');
const passport = require('passport');
const plaid = require('plaid');
const { db, models: { 
    Game, Goal, Relapse, Transaction, UsersGame, Vice, User
  }
} = require('./models/index');


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

// // Initialize Passport
// app.use(passport.initialize());
// app.use(passport.session());

app.get('http://127.0.0.1:4041', (req, res) => {
  console.log('inside app get');
  console.log('req:', req);
});

let ACCESS_TOKEN = null;
let PUBLIC_TOKEN = null;

const client = new plaid.Client(
  "5d40763fc2c21f00115793fe",
  "6dd65e4d6b8b3d6884cc4c4f5add6a",
  "a35fead643ab95153802609fa5c0a2",
  plaid.environments.sandbox,
  {version: '2018-05-22'}
);

app.get('/users', (req, res) => {

});

app.post('/users', (req, res) => {
  const { body: { full_name } } = req;
  User.findAll({ where: { full_name } }).then(data => {
      // if (data){

      // }
      return User.create({ full_name }); 
    })
    .catch(err => console.err(err));
});

app.post('/get_access_token', (req, res, next) => {
  PUBLIC_TOKEN = req.body.public_token;
  client.exchangePublicToken(PUBLIC_TOKEN, (err, tokenResponse) => {
    if (err) {
      console.error('Problem exchanging public token ' + err);
    }
    ACCESS_TOKEN = tokenResponse.access_token;
    ITEM_ID = tokenResponse.item_id;
    console.log(JSON.stringify(tokenResponse));
    // ADD ACCESS_TOKEN AND ITEM_ID TO DATABASE HERE
    res.json({
      access_token: ACCESS_TOKEN,
      item_id: ITEM_ID,
      error: false
    });
  });
});

db.sync({ force: false }).then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Your app is manifesting on port ${process.env.PORT}!`);
  });
});