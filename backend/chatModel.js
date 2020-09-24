var Sequelize = require('sequelize');
var bcrypt = require('bcrypt-nodejs');

// create a sequelize instance with our local postgres database information.
var sequelize = new Sequelize('vcoach',process.env.RDS_USERNAME,process.env.RDS_PASSWORD,{
    host:process.env.RDS_HOSTNAME,
    dialect: 'mysql',

    pool: {
        max:5,
        min:0,
        acquire:30000,
        idle:10000
    }
});

// setup User model and its fields.
var Chat = sequelize.define('chats', {
    cid: {
        type: Sequelize.STRING,
        allowNull: false
    },
    problem: {
        type: Sequelize.STRING,
        allowNull: false
    },
    chat: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    result: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    uid: {
        type: Sequelize.STRING,
        defaultValue: '0',
        allowNull: true,
    },
    name: {
        type: Sequelize.STRING,
        defaultValue: '0',
        allowNull: true,
    }
}, {
    hooks: {
      beforeCreate: (user) => {

      }
    },
    instanceMethods: {

    }    
});

// User.prototype.validPassword = function(password) {
//         return bcrypt.compareSync(password, this.password);
//       }
// User.sync({force: true}).then(() => {
//   // Table created
//   return User.create({
//     username: 'sunil@gmail.com',
//     email: 'Hancock',
//     password:'hi'
//   });
// });
// create all the defined tables in the specified database.
sequelize.sync()
    .then(() => console.log('chats table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export User model for use in other files.
module.exports = Chat;