/* eslint-disable camelcase */
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
const { db, models: { 
  Game, Goal, Relapse, Transaction, UsersGame, Vice, User
}
} = require('./models/index');

/**
 * load test users, feel free to comment out
 */
const { loadData, testUsers } = require('../test_data');
loadData(testUsers);


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
  process.env.PLAID_CLIENT_ID,
  process.env.PLAID_SECRET,
  process.env.PLAID_PUBLIC_KEY,
  plaid.environments.sandbox,
  {version: '2018-05-22'}
);

app.get('/users/:auth0_id', (req, res) => {
  const { auth0_id } = req.params
  User.findAll({ where: { auth0_id }})
    .then(data => {
      return data.length 
        ? res.staus(204).send("Not Found") 
        : res.status(200).send(data);
    })
    .catch(err => res.status(500))
});

app.post('/users', (req, res) => {
  const { body: { name, auth0_id, picture } } = req;
  User.findAll({ where: { auth0_id, } })
    .then(data => {
      return data.length 
      // add reddirect to signup
      ? res.send(300)
      : User.create({ name, auth0_id, picture }); 
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
    User.update({ access_token: ACCESS_TOKEN, item_id: ITEM_ID }, {where: 
    {
      email: 'a.bates1993@gmail.com'
    }
    })
      .catch(err => console.error(err));
    res.json({
      access_token: ACCESS_TOKEN,
      item_id: ITEM_ID,
      error: false
    });
  });
});

// GETS BANK ACCT DATA (may or may not need this... if we do, will probably need new table in DB for users' accounts)
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
  // commenting conditional out for now just for testing b/c default updates won't happen with sandbox

  // if (req.body.webhook_code === 'DEFAULT_UPDATE') {
  const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
  const endDate = moment().format('YYYY-MM-DD');
  client.getTransactions(ACCESS_TOKEN, startDate, endDate, { offset: 0 }, (err, transactionRes) => {
    if (err) {
      console.error(err);
    } else {
      console.log(transactionRes);
      // DATABASE WORK HERE
      const itemId = transactionRes.item.item_id;
      // Parse this data, send suspicious transactions to the database
      const { transactions } = transactionRes;
      // loop over transactions to see if any transaction.category array includes "Coffee Shop"
      // if it does, add it to suspicions
      const suspicions = transactions.filter(transaction => transaction.category.includes('Coffee Shop'));
      // find user associated with item_id
      User.findOne({where: {
        item_id: itemId
      }})
        .then((user) => {
          suspicions.forEach(suspicion => {
            Transaction.findOrCreate({where: {
              transaction_id: suspicion.transaction_id
            },
            defaults: {
              id_user: user.id,
              status: 'pending',
              name: suspicion.name,
              day: suspicion.date,
              amount: suspicion.amount,
            }
            });
          });
        })
        .catch(err => console.error(err));
      // res.json({ transactions: transactionRes });
    }
  });
  // }
});

db.sync({ force: false }).then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Your app is manifesting on port ${process.env.PORT}!`);
  });
});