const Sequelize = require('sequelize');
const db = require('../db');

module.exports = db.define('transactions', {
  'id_user': {
    type: Sequelize.INTEGER,
    model: 'users',
    key: 'id',
  },
  'status': {
    type: Sequelize.ENUM,
    values: ['pending', 'dismissed', 'else'],
  },
  'name': Sequelize.STRING,
  'day': Sequelize.DATE,
  'amount': Sequelize.DECIMAL,
  'transaction_id': Sequelize.STRING,
}, { db }
);
