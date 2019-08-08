const { models: {
    Game, Goal, Relapse, Transaction, UsersGame, Vice, User
  } 
} = require("./server/models/index.js");

module.exports.testUsers = [{
  id: '1',
  name: 'Galen Housego',
  auth0_id: 'google-oauth2|1111111111',
  picture: 'https://avatars1.githubusercontent.com/u/46695209?s=460&v=4',
},{
  id: '2',
  name: 'Gilberto Franco',
  auth0_id: 'google-oauth2|0000000000',
  picture: 'https://avatars2.githubusercontent.com/u/48068234?s=460&v=4',
},{
  id: '3',
  name: 'Lisa Bertreau Smith',
  auth0_id: 'google-oauth2|2222222222',
  picture: 'https://avatars1.githubusercontent.com/u/48036467?s=460&v=4',
}]

module.exports.testGoals = [{
  id_user: 4,
  vice: 'coffee',
}]

module.exports.loadDataGoals = (array) => {
  array.forEach(async ({ id_user, vice }) => {
    await Goal.findOrCreate({ where: { id_user, vice }})
  });
};

module.exports.loadDataUsers = (array) => {
  array.forEach(async ({ auth0_id, name, picture }) => {
    await User.findOrCreate({ where: { auth0_id, name, picture }})
  });
};