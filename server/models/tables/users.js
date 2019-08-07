const Sequelize = require('sequelize');
const db = require('../db');

module.exports = db.define('users',{
  "full_name": Sequelize.STRING,
  "email": {
    type: Sequelize.STRING,
    unique: true
  },
  "access_token": Sequelize.STRING,
  "item_id": Sequelize.STRING,
  "session_token": Sequelize.STRING,
  "totalSaved": Sequelize.INTEGER,
  "transfer_schedule": {
    type: Sequelize.ENUM,
    values: ['a', 'b', 'c']
  },
  "games": Sequelize.INTEGER,
  }, { db }
);
