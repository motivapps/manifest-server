const Sequelize = require('sequelize');
const db = require('../db');

module.exports = db.define('vices', {
    "vice": {
      type: Sequelize.ENUM,
      values: ['smoking', 'drinking', 'coffee', 'fast food', 'gambling', 'shopping'],
    },
  }, { db }
);
