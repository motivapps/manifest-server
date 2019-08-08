const { models: {
    Game, Goal, Relapse, Transaction, UsersGame, Vice, User
  } 
} = require("./server/models/index.js");

module.exports.testUsers = [{
  id: '1',
  name: 'Galen Housego',
  email: 'GaleyFromDaBlock',
  picture: 'https://avatars1.githubusercontent.com/u/46695209?s=460&v=4',
},{
  id: '2',
  name: 'Gilberto Franco',
  email: 'CrankyFranky',
  picture: 'https://avatars2.githubusercontent.com/u/48068234?s=460&v=4',
},{
  id: '3',
  name: 'Lisa Bertreau Smith',
  email: 'princessLisaaaaa504',
  picture: 'https://avatars1.githubusercontent.com/u/48036467?s=460&v=4',
}]

module.exports.loadData = (array) => {
  array.forEach(async ({ email, name, picture }) => {
    await User.findOrCreate({ where: { email, name, picture }})
  });
};