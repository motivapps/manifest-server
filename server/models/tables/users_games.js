const Sequelize = require('sequelize');
const db = require('../db');

module.exports = db.define('users_games', {
    "id_user": {
      type: Sequelize.INTEGER,
      model: "users",
      key: "id",
    },
    "id_game": {
      type: Sequelize.INTEGER,
      model: "games",
      key: "id",
    }
  }, { db }
);
