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
const { createCustomer } = require('./dbHelpers');

/**
 * load test users, feel free to comment out
 */
const { loadDataUsers, loadDataGoals, testUsers, testGoals } = require('../test_data');
loadDataUsers(testUsers);

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
  const { auth0_id } = req.params;
  User.findAll({ where: { auth0_id }})
    .then(data => {
      return data.length 
        ? res.staus(204).send('Not Found') 
        : res.status(200).send(data);
    })
    .catch(err => res.status(500));
});

app.post('/signup', (req, res) => {
  const { body: { name, auth0_id, picture } } = req;
  User.findAll({ where: { auth0_id, } })
    .then(data => {
      return data.length 
      // add reddirect to signup
        ? res.status(300).end()
        : User.create({ name, auth0_id, picture }); 
    })
    // adds a test goal to the first loser to login!  :^ P
  //  .then(() => loadDataGoals(testGoals))
    .catch(err => console.error(err));
});

app.post('/login', (req, res) => {
  const { body: { auth0_id } } = req;
  User.findAll({ where: { auth0_id, } })
    .then(data => {
      return data.length
        // add reddirect to signup
        ? res.status(300).end()
        : res.status(201).send(data);
    })
    .catch(err => console.error(err));
});

app.post('/get_access_token', (req, res, next) => {
  PUBLIC_TOKEN = req.body.public_token;
  const { userToken } = req.body;
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
      auth0_id: userToken
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
// need to send userToken with user...
app.post('/auth', (req, res) => {
  const { userToken } = req.body;
  User.findAll({ where: {
    auth0_id: userToken
  }}).then(async (data) => {
    const user  = data[0];
    client.getAuth(user.access_token, (err, authResponse) => {
      if (err) {
        console.error(err);
      }
      console.log(user);
  
      createCustomer(authResponse, user);
      res.status(300).json({ error: null, auth: authResponse });
    });
  }).catch((err) => console.log(err));
});

app.post('/transaction_hook', (req, res) => {
  console.log(req);
  // check if req.body.webhook_code is DEFAULT_UPDATE
  // if it is, make a request to Plaid for transaction data
  // commenting conditional out for now just for testing b/c default updates won't happen with sandbox

  // if (req.body.webhook_code === 'DEFAULT_UPDATE') {
  const startDate = moment().subtract(300, 'days').format('YYYY-MM-DD');
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

app.get('/transactions/:auth0_id', (req, res) => {
  // when client hits this endpoint, we want to send back suspicious transactions
  // find user by auth0 id
  User.findOne({where: {auth0_id: req.params.auth0_id}})
    .then((user) => {
      // use users id to find corresponding transactions
      return Transaction.findAll({where: {id_user: user.id}});
    })
    .then((transactions) => {
      console.log('transactions:', transactions);
      res.status(200);
      res.json(transactions);
    })
    .catch(err => console.error(err));
});

// Suspicious transaction has been denied:
app.patch('/deny_transaction/:auth0_id', (req, res) => {
  const { transaction_id } = req.body;
  const { auth0_id } = req.params;
  // update said transaction's status to 'dismissed'
  Transaction.update(
    {status: 'dismissed'}, 
    { where: {transaction_id}})
    .then(response => {
      res.status(200);
      res.json(response);
    })
    .catch(err => console.error(err));
});

// Suspicious transaction has been accepted:
app.patch('/accept_transaction/:auth0_id', (req, res) => {
  const { transaction_id, amount, day } = req.body;
  const { auth0_id } = req.params;
  // update said transaction's status to 'dismissed'
  Transaction.update(
    {status: 'relapsed'}, 
    { where: {transaction_id}})
    .then(response => {
      res.status(200);
      res.json(response);
    })
    .catch(err => console.error(err));
  // ALSO NEED TO UPDATE GOALS AND RELAPSE TABLES!
  User.findOne({where: { auth0_id }})
    .then(user => {
      return user.id;
    })
    .then(userId => {
      let goalId = '';
      // UPDATE GOALS
      Goal.update(
        { relapse_count: relapse_count += 1,
          relapse_cost_total: relapse_cost_total += amount, },
        { where: { id_user: userId }}
      )
      .then(goal => {
        goalId = goal.id;
        // CREATE RELAPSE
        Relapse.create({
          id_user: userId,
          id_goal: goalId,
          day,
          cost: amount
        })
      })
    });
});

app.get('/goals/:auth0_id', (req, res) => {
  // when client hits this endpoint, we want to send back suspicious transactions
  // find user by auth0 id
  User.findOne({where: {auth0_id: req.params.auth0_id}})
    .then((user) => {
      // use users id to find corresponding transactions
      return Goal.findAll({where: {id_user: user.id}});
    })
    .then((goals) => {
      res.status(200);
      res.json(goals);
    })
    .catch(err => console.error(err));
});


app.post('/pushtoken', (req, res) => {
  console.log('inside pushtoken route');
  console.log('push token req:', req.body);
  User.update(
    {device_token: req.body.pushToken},
    {where: {auth0_id: req.body.authID}
    })
    .then((response) => {
      res.status(201).send(response);
    })
    .catch((err) => {
      console.error(err);
    });
});

app.post('/user/goals', (req, res) => {
  Goal.create({ 
    id_user: req.body.userId,
    vice: req.body.viceName,
    goal_name: req.body.goalName,
    goal_item: req.body.goalItem,
    goal_cost: req.body.goalAmount,
    vice_freq: req.body.viceFrequency,
    vice_price: req.body.vicePrice,
    amount_saved: 0,
    relapse_count: 0,
    relapse_cost_total: 0,
    streak_days: 0,
  });
});

app.get('/user/:auth0_id', (req, res) => {
  User.findOne({ where: { auth0_id: req.params.auth0_id } })
    .then((response) => {
      console.log('then response:', response);
      res.status(200).send(response);
    })
    .catch((err) => {
      console.log('UserId get error:', err);
    });
});

db.sync({ force: false }).then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Your app is manifesting on port ${process.env.PORT}!`);
  });
});
