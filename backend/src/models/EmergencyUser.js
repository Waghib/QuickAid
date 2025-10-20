const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const EmergencyUser = sequelize.define('EmergencyUser', {
  emergencyUserId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  emergencyHistory: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  timestamps: true
});

EmergencyUser.belongsTo(User, { foreignKey: 'userId' });

module.exports = EmergencyUser;
