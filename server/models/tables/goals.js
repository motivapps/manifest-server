const Sequelize = require('sequelize');
const db = require('../db');

module.exports = db.define('goals', {
    "id_user": {
      type: Sequelize.INTEGER,
      model: 'users',
      key: 'id',
    },
    "vice": {
      type: Sequelize.STRING,
      model: 'vices',
      key: 'id'
    },
    "streak_days": Sequelize.INTEGER,
    "goal_name": Sequelize.STRING,
    "goal_item": Sequelize.STRING,
    "goal_cost": Sequelize.FLOAT,
    "amount_saved": Sequelize.FLOAT,
    "relapse_count": Sequelize.INTEGER,
    "relapse_cost_total": Sequelize.FLOAT,
    "vice_freq": Sequelize.STRING,
    "vice_price": Sequelize.FLOAT,
    "daily_savings": Sequelize.FLOAT,
  }, { db }
);
