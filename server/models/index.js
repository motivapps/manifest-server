const User = require('./tables/users');
const Game = require('./tables/users');
const Goal = require('./tables/users');
const Relapse = require('./tables/users');
const Transaction = require('./tables/users');
const UserGame = require('./tables/users');
const Vice = require('./tables/users');

const db = require('./db');

const models = {
  User,
  Game,
  Goal,
  Relapse,
  Transaction,
  UserGame,
  Vice
};

db.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


module.exports = { db, models }
