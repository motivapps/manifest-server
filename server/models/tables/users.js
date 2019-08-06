const user = (sequelize, DataTypes) => {
  const User = sequelize.define('users',{
    "full_name": DataTypes.STRING,
    "email": {
      type: DataTypes.STRING,
      unique: true
    },
    "access_token": DataTypes.STRING,
    "item_id": DataTypes.STRING,
    "session_token": DataTypes.STRING,
    "totalSaved": DataTypes.INTEGER,
    "transfer_schedule": {
      type: DataTypes.ENUM,
      values: ['a', 'b', 'c']
    },
    "games": DataTypes.INTEGER,
    }, { sequelize }
  )

  return user 
};

module.exports = user;