const User = require('./tables/users');
const Game = require('./tables/games');
const Goal = require('./tables/goals');
const Relapse = require('./tables/relapses');
const Transaction = require('./tables/transactions');
const UserGame = require('./tables/users_games');
const Vice = require('./tables/vices');
const Account = require('./tables/accounts');

const db = require('./db');

const models = {
  User,
  Game,
  Goal,
  Relapse,
  Transaction,
  UserGame,
  Vice,
  Account,
};

// create foreign key
Account.belongsTo(User)

db.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


module.exports = { db, models }
