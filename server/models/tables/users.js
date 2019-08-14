const Sequelize = require('sequelize');
const db = require('../db');

module.exports = db.define('users',{
  "name": Sequelize.STRING,
  "auth0_id": {
    type: Sequelize.STRING,
    unique: true
  },
  "picture": Sequelize.STRING,
  "access_token": Sequelize.STRING,
  "item_id": Sequelize.STRING,
  "session_token": Sequelize.STRING,
  "device_token": Sequelize.STRING,
  "totalSaved": Sequelize.INTEGER,
  "transfer_schedule": {
    type: Sequelize.ENUM,
    values: ['a', 'b', 'c']
  },
  "games": Sequelize.INTEGER,
  "stripe_customer": Sequelize.STRING(5000),
  "accounts": Sequelize.STRING(5000),
  }, { db }
);
// add stripe customer object
// add accounts array
// add checking source
// add savings source