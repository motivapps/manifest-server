const Sequelize = require('sequelize');
const db = require('../db');

module.exports = db.define('accounts', {
  'routing': Sequelize.INTEGER,
  'account_id_to': Sequelize.STRING,
  'account_id_from': Sequelize.STRING,
  'accounts': Sequelize.ARRAY(Sequelize.TEXT),
}, { db }
);