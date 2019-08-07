const Sequelize = require('sequelize');
const db = require('../db');

module.exports = sequelize.define('relapses', {
    "id_user": {
      type: Sequelize.INTEGER,
      model: "users",
      key: "id",
    },
    "id_goal": {
      type: Sequelize.INTEGER,
      model: "goal",
      key: "id",
    },
    "day": Sequelize.DATE,
    "cost": Sequelize.DECIMAL,
  }, { db }
);