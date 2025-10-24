const { 
  User, 
  EmergencyUser, 
  FirstResponder, 
  EmergencyRequest, 
  Feedback, 
  Notification, 
  Certification, 
  TrainingProgress, 
  TrainingVideo 
} = require('../models');

const { v4: uuidv4 } = require('uuid');

// Helper function to generate random coordinates in Pakistan
function getRandomPakistanCoordinates() {
  // Pakistan's approximate bounding box
  const minLat = 23.5;
  const maxLat = 37.0;
  const minLng = 60.5;
  const maxLng = 77.0;
  
  return {
    latitude: minLat + Math.random() * (maxLat - minLat),
    longitude: minLng + Math.random() * (maxLng - minLng)
  };
}

// Helper function to get random date in the last 30 days
function getRandomRecentDate() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()));
}

// Helper function to get random item from array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Seed demo data
async function seedDemoData() {
  try {
    console.log('Seeding demo data...');
    
    // Clear existing data
    await EmergencyRequest.destroy({ where: {} });
    await Feedback.destroy({ where: {} });
    await Notification.destroy({ where: {} });
    await TrainingProgress.destroy({ where: {} });
    await Certification.destroy({ where: {} });
    await EmergencyUser.destroy({ where: {} });
    await FirstResponder.destroy({ where: {} });
    await TrainingVideo.destroy({ where: {} });
    await User.destroy({ where: {} });
    
    console.log('Existing data cleared');
    
    // Create training videos
    const trainingVideos = await TrainingVideo.bulkCreate([
      {
        title: 'Basic First Aid',
        description: 'Learn the basics of first aid and emergency response.',
        videoUrl: 'https://www.youtube.com/watch?v=WqhpQmDcGxY',
        thumbnailUrl: 'https://img.youtube.com/vi/WqhpQmDcGxY/hqdefault.jpg',
        order: 1
      },
      {
        title: 'CPR Techniques',
        description: 'Comprehensive guide to CPR for adults, children, and infants.',
        videoUrl: 'https://www.youtube.com/watch?v=cosVBV96E2g',
        thumbnailUrl: 'https://img.youtube.com/vi/cosVBV96E2g/hqdefault.jpg',
        order: 2
      },
      {
        title: 'Handling Bleeding Emergencies',
        description: 'How to control bleeding in emergency situations.',
        videoUrl: 'https://www.youtube.com/watch?v=NxO5LvgqZe0',
        thumbnailUrl: 'https://img.youtube.com/vi/NxO5LvgqZe0/hqdefault.jpg',
        order: 3
      },
      {
        title: 'Treating Burns',
        description: 'Proper techniques for treating different types of burns.',
        videoUrl: 'https://www.youtube.com/watch?v=EaJmzB8YgS0',
        thumbnailUrl: 'https://img.youtube.com/vi/EaJmzB8YgS0/hqdefault.jpg',
        order: 4
      },
      {
        title: 'Responding to Cardiac Emergencies',
        description: 'How to recognize and respond to heart attacks and other cardiac emergencies.',
        videoUrl: 'https://www.youtube.com/watch?v=gDwt7dD3awc',
        thumbnailUrl: 'https://img.youtube.com/vi/gDwt7dD3awc/hqdefault.jpg',
        order: 5
      }
    ]);
    
    console.log(`Created ${trainingVideos.length} training videos`);
    
    // Create emergency users
    const emergencyUsers = [];
    const emergencyUserIds = [];
    
    for (let i = 1; i <= 10; i++) {
      const userId = uuidv4();
      emergencyUserIds.push(userId);
      
      const coords = getRandomPakistanCoordinates();
      
      const user = await User.create({
        id: userId,
        name: `Emergency User ${i}`,
        contactInfo: `+92${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        latitude: coords.latitude,
        longitude: coords.longitude,
        userType: 'emergency_user'
      });
      
      const emergencyUser = await EmergencyUser.create({
        emergencyUserId: userId,
        userId: userId,
        medicalConditions: i % 3 === 0 ? 'Asthma, Diabetes' : i % 2 === 0 ? 'None' : 'Hypertension',
        emergencyContacts: JSON.stringify([
          { name: 'Emergency Contact 1', phone: '+923001234567' },
          { name: 'Emergency Contact 2', phone: '+923007654321' }
        ])
      });
      
      emergencyUsers.push({ user, emergencyUser });
    }
    
    console.log(`Created ${emergencyUsers.length} emergency users`);
    
    // Create first responders
    const firstResponders = [];
    const firstResponderIds = [];
    
    for (let i = 1; i <= 15; i++) {
      const userId = uuidv4();
      firstResponderIds.push(userId);
      
      const coords = getRandomPakistanCoordinates();
      
      const user = await User.create({
        id: userId,
        name: `First Responder ${i}`,
        contactInfo: `+92${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        latitude: coords.latitude,
        longitude: coords.longitude,
        userType: 'first_responder'
      });
      
      const certificationStatus = i <= 10 ? 'approved' : i <= 13 ? 'pending' : 'rejected';
      const trainingCompletionDate = certificationStatus === 'approved' ? new Date() : null;
      
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 2);
      
      const firstResponder = await FirstResponder.create({
        firstResponderId: userId,
        userId: userId,
        specialization: getRandomItem(['General First Aid', 'CPR Specialist', 'Trauma Care', 'Emergency Medical Technician']),
        certificationStatus,
        trainingCompletionDate,
        certificationExpiryDate: certificationStatus === 'approved' ? expiryDate : null,
        isAvailable: i % 5 !== 0, // 80% available
        rating: Math.floor(3 + Math.random() * 3) // 3-5 rating
      });
      
      // Create certification for first responders
      const certification = await Certification.create({
        userId: userId,
        status: certificationStatus,
        progress: certificationStatus === 'approved' ? 100 : certificationStatus === 'rejected' ? Math.floor(50 + Math.random() * 30) : Math.floor(70 + Math.random() * 30),
        completedTraining: certificationStatus === 'approved',
        requestedAt: getRandomRecentDate(),
        metadata: JSON.stringify({
          education: 'Medical School',
          experience: `${Math.floor(1 + Math.random() * 10)} years`,
          documents: ['certification.pdf', 'id_proof.pdf']
        })
      });
      
      // Create training progress for each video
      for (const video of trainingVideos) {
        const completed = certification.progress >= (video.order / trainingVideos.length) * 100;
        
        await TrainingProgress.create({
          userId: userId,
          videoId: video.id,
          completed,
          completedAt: completed ? getRandomRecentDate() : null,
          progress: completed ? 100 : Math.floor(Math.random() * 90)
        });
      }
      
      firstResponders.push({ user, firstResponder, certification });
    }
    
    console.log(`Created ${firstResponders.length} first responders`);
    
    // Create emergency requests
    const emergencyRequests = [];
    const emergencyTypes = ['Medical', 'Accident', 'Fire', 'Crime', 'Natural Disaster'];
    const statuses = ['pending', 'accepted', 'completed'];
    
    for (let i = 1; i <= 30; i++) {
      const requestId = uuidv4();
      const emergencyType = getRandomItem(emergencyTypes);
      const status = getRandomItem(statuses);
      const time = getRandomRecentDate();
      const coords = getRandomPakistanCoordinates();
      
      // Select random emergency user
      const emergencyUserId = getRandomItem(emergencyUserIds);
      
      // Select random first responder for accepted and completed requests
      const firstResponderId = status !== 'pending' ? getRandomItem(firstResponderIds.slice(0, 10)) : null; // Only approved responders
      
      const emergencyRequest = await EmergencyRequest.create({
        requestId,
        emergencyType,
        latitude: coords.latitude,
        longitude: coords.longitude,
        time,
        status
      });
      
      // If this is an accepted or completed request, update the associations
      if (status !== 'pending' && emergencyUserId && firstResponderId) {
        await emergencyRequest.update({
          emergencyUserId,
          firstResponderId
        });
      } else {
        // For pending requests, only associate with emergency user
        await emergencyRequest.update({
          emergencyUserId
        });
      }
      
      // Create feedback for completed requests
      if (status === 'completed' && emergencyUserId && firstResponderId) {
        const feedback = await Feedback.create({
          feedbackId: uuidv4(),
          emergencyRequestId: requestId,
          emergencyUserId,
          firstResponderId,
          rating: Math.floor(3 + Math.random() * 3), // 3-5 rating
          comments: getRandomItem([
            'Very professional and quick response.',
            'Saved my life! Thank you so much.',
            'Great service, arrived quickly.',
            'Very knowledgeable and calm under pressure.',
            'Excellent care provided.',
            'Could have been faster but overall good service.'
          ])
        });
      }
      
      emergencyRequests.push(emergencyRequest);
    }
    
    console.log(`Created ${emergencyRequests.length} emergency requests`);
    
    // Create notifications
    const notifications = [];
    const notificationTypes = ['emergency_alert', 'request_accepted', 'request_completed', 'certification_update', 'system_message'];
    
    for (let i = 1; i <= 50; i++) {
      const userId = getRandomItem([...emergencyUserIds, ...firstResponderIds]);
      const type = getRandomItem(notificationTypes);
      
      let content;
      
      switch (type) {
        case 'emergency_alert':
          content = 'There is an emergency near your location.';
          break;
        case 'request_accepted':
          content = 'Your emergency request has been accepted by a responder.';
          break;
        case 'request_completed':
          content = 'Your emergency request has been marked as completed.';
          break;
        case 'certification_update':
          content = getRandomItem([
            'Your certification has been approved.',
            'Your certification is pending review.',
            'Your certification requires additional information.'
          ]);
          break;
        case 'system_message':
          content = 'QuickAid has been updated with new features.';
          break;
      }
      
      const notification = await Notification.create({
        notificationId: uuidv4(),
        userId,
        type,
        content,
        isRead: Math.random() > 0.3, // 70% read
        timestamp: getRandomRecentDate()
      });
      
      notifications.push(notification);
    }
    
    console.log(`Created ${notifications.length} notifications`);
    
    console.log('Demo data seeding completed successfully');
    
    return {
      users: emergencyUsers.length + firstResponders.length,
      emergencyUsers: emergencyUsers.length,
      firstResponders: firstResponders.length,
      emergencyRequests: emergencyRequests.length,
      notifications: notifications.length,
      trainingVideos: trainingVideos.length
    };
  } catch (error) {
    console.error('Error seeding demo data:', error);
    throw error;
  }
}

module.exports = seedDemoData;
