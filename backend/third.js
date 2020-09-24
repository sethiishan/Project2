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
var PaidUser = sequelize.define('paidusers', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    uid:{
        type: Sequelize.STRING,
        allowNull: false 
    },
orderId: {
        type: Sequelize.STRING,
        allowNull: false
    },
    paymentId: {
        type: Sequelize.STRING,
        allowNull: false
    },
    signature:{
        type: Sequelize.STRING,
        allowNull: false 
    }
}, {
    hooks: {
      beforeCreate: (user) => {  }
    },
    instanceMethods: {
      
    }    
});



sequelize.sync()
    .then(() => console.log('paidusers table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export User model for use in other files.
module.exports = PaidUser;