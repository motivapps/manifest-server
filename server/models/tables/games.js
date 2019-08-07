const Sequelize = require('sequelize');
const db = require('../db');

module.exports = db.define('games', {
    "game": Sequelize.STRING,
  }, { db }
);