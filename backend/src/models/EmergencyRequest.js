const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmergencyRequest = sequelize.define('EmergencyRequest', {
  requestId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  emergencyUserId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstResponderId: {
    type: DataTypes.STRING,
    allowNull: true
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
  responseTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent_to_responder', 'accepted', 'rejected', 'completed', 'cancelled', 'no_responders_available'),
    defaultValue: 'pending'
  }
}, {
  timestamps: true
});

module.exports = EmergencyRequest;
