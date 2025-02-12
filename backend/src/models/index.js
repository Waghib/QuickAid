const User = require('./User');
const EmergencyUser = require('./EmergencyUser');
const FirstResponder = require('./FirstResponder');
const EmergencyRequest = require('./EmergencyRequest');
const Feedback = require('./Feedback');
const Notification = require('./Notification');

// Define relationships
EmergencyRequest.belongsTo(EmergencyUser, { foreignKey: 'emergencyUserId' });
EmergencyRequest.belongsTo(FirstResponder, { foreignKey: 'firstResponderId' });

Feedback.belongsTo(EmergencyRequest, { foreignKey: 'emergencyRequestId' });
Feedback.belongsTo(EmergencyUser, { foreignKey: 'emergencyUserId' });
Feedback.belongsTo(FirstResponder, { foreignKey: 'firstResponderId' });

Notification.belongsTo(User, { foreignKey: 'userId' });

// Export models
module.exports = {
  User,
  EmergencyUser,
  FirstResponder,
  EmergencyRequest,
  Feedback,
  Notification
};
