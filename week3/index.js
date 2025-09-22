import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:' });
const User = sequelize.define('User', {
  username: DataTypes.STRING,
  birthday: DataTypes.DATE,
});

await sequelize.sync();

const jane = await User.create({
    username: 'janedoe',
    birthday: new Date(1980, 6, 20),
  });
  
const users = await User.findAll();

console.log(users);