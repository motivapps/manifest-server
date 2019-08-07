const User = require('./tables/users');
const db = require('./db');



db.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// const imports = {
//   UsersModel: sequelize.import('./tables/users'),
//   GoalsModel: sequelize.import('./tables/goals'),
//   VicesModel: sequelize.import('./tables/vices'),
//   RelapsesModel: sequelize.import('./tables/relapses'),
//   TransactionsModel: sequelize.import('./tables/transactions'),
//   GamesModel: sequelize.import('./tables/games'),
//   UsersGamesModel: sequelize.import('./tables/users_games'),
// }

const models = {
  User,

}

module.exports = { db, models }

// export default models;