const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmergencyRequest = sequelize.define('EmergencyRequest', {
  requestId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  emergencyType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  latitude: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  longitude: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'completed', 'cancelled'),
    defaultValue: 'pending'
  }
}, {
  timestamps: true
});

module.exports = EmergencyRequest;
