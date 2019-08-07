const { db, models: {
  Game, Goal, Relapse, Transaction, UsersGame, Vice, User
}
} = require("./server/models/index.js");

const users = [{
  name: 'Galen Housego',
  email: 'GaleyFromDaBlock',
  pic: 'https://avatars1.githubusercontent.com/u/46695209?s=460&v=4',
},{
  name: 'Gilberto Franco',
  email: 'CrankyFranky',
  pic: 'https://avatars2.githubusercontent.com/u/48068234?s=460&v=4',
},{
  name: 'Lisa Bertreau Smith',
  email: 'princessLisaaaaa504',
  pic: 'https://avatars1.githubusercontent.com/u/48036467?s=460&v=4',
}]

function loadData(array){
  array.foreach(client => {
    User.find
  })
}