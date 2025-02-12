const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const FirstResponder = sequelize.define('FirstResponder', {
  firstResponderId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  trainingCompletionDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  availability: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  certificationStatus: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

FirstResponder.belongsTo(User, { foreignKey: 'userId' });

module.exports = FirstResponder;
