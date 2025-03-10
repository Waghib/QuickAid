const User = require('./User');
const EmergencyUser = require('./EmergencyUser');
const FirstResponder = require('./FirstResponder');
const EmergencyRequest = require('./EmergencyRequest');
const Feedback = require('./Feedback');
const Notification = require('./Notification');
const Certification = require('./Certification');
const TrainingProgress = require('./TrainingProgress');
const TrainingVideo = require('./TrainingVideo');

// Define relationships
EmergencyRequest.belongsTo(EmergencyUser, { foreignKey: 'emergencyUserId' });
EmergencyRequest.belongsTo(FirstResponder, { foreignKey: 'firstResponderId' });

Feedback.belongsTo(EmergencyRequest, { foreignKey: 'emergencyRequestId' });
Feedback.belongsTo(EmergencyUser, { foreignKey: 'emergencyUserId' });
Feedback.belongsTo(FirstResponder, { foreignKey: 'firstResponderId' });

Notification.belongsTo(User, { foreignKey: 'userId' });

// Certification relationships
Certification.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Certification, { foreignKey: 'userId' });

// First Responder certification relationship
FirstResponder.hasOne(Certification, { foreignKey: 'userId', sourceKey: 'userId' });
Certification.belongsTo(FirstResponder, { foreignKey: 'userId', targetKey: 'userId' });

// Training progress relationships
TrainingProgress.belongsTo(User, { foreignKey: 'userId' });
TrainingProgress.belongsTo(TrainingVideo, { foreignKey: 'videoId' });
User.hasMany(TrainingProgress, { foreignKey: 'userId' });
TrainingVideo.hasMany(TrainingProgress, { foreignKey: 'videoId' });

// Export models
module.exports = {
  User,
  EmergencyUser,
  FirstResponder,
  EmergencyRequest,
  Feedback,
  Notification,
  Certification,
  TrainingProgress,
  TrainingVideo
};
