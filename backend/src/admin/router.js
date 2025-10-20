const express = require('express');
const path = require('path');
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
const { Op } = require('sequelize');

const router = express.Router();

// Middleware to protect admin routes
const adminAuth = (req, res, next) => {
  // In a real application, you would implement proper authentication
  // For now, we'll use a simple username/password check from environment variables
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="QuickAid Admin"');
    return res.status(401).send('Authentication required');
  }
  
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const [username, password] = credentials.split(':');
  
  // Use environment variables for admin credentials
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    return next();
  }
  
  res.set('WWW-Authenticate', 'Basic realm="QuickAid Admin"');
  return res.status(401).send('Invalid credentials');
};

// Apply authentication middleware to all admin routes
router.use(adminAuth);

// Serve static files from the admin/views directory
router.use(express.static(path.join(__dirname, 'views')));

// API endpoints for admin dashboard

// Get dashboard stats
router.get('/api/stats', async (req, res) => {
  try {
    const userCount = await User.count();
    const emergencyUserCount = await EmergencyUser.count();
    const firstResponderCount = await FirstResponder.count();
    const emergencyRequestCount = await EmergencyRequest.count();
    const pendingRequestCount = await EmergencyRequest.count({
      where: { status: 'pending' }
    });
    const completedRequestCount = await EmergencyRequest.count({
      where: { status: 'completed' }
    });
    const certificationCount = await Certification.count();
    const pendingCertificationCount = await Certification.count({
      where: { status: 'pending' }
    });
    
    res.json({
      users: {
        total: userCount,
        emergencyUsers: emergencyUserCount,
        firstResponders: firstResponderCount
      },
      emergencyRequests: {
        total: emergencyRequestCount,
        pending: pendingRequestCount,
        completed: completedRequestCount
      },
      certifications: {
        total: certificationCount,
        pending: pendingCertificationCount
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// Get recent emergency requests for dashboard
router.get('/api/recent-emergency-requests', async (req, res) => {
  try {
    const requests = await EmergencyRequest.findAll({
      include: [
        { 
          model: EmergencyUser,
          include: [
            { model: User }
          ]
        },
        { 
          model: FirstResponder,
          include: [
            { model: User }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching recent emergency requests:', error);
    res.status(500).json({ error: 'Failed to fetch recent emergency requests' });
  }
});

// Get all users
router.get('/api/users', async (req, res) => {
  try {
    const { search, type } = req.query;
    let where = {};
    
    // Apply search filter if provided
    if (search) {
      where = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { contactInfo: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }
    
    // Get all users with optional search filter
    const users = await User.findAll({
      where,
      include: [
        { model: Certification, required: false }
      ],
      order: [['name', 'ASC']] // Sort by name in ascending order
    });
    
    // If type filter is provided, filter the results
    if (type) {
      let filteredUsers = [];
      
      if (type === 'emergency') {
        // Get all emergency user IDs
        const emergencyUsers = await EmergencyUser.findAll({
          attributes: ['userId']
        });
        const emergencyUserIds = emergencyUsers.map(user => user.userId);
        
        // Filter users that are emergency users
        filteredUsers = users.filter(user => emergencyUserIds.includes(user.id));
      } else if (type === 'responder') {
        // Get all first responder IDs
        const firstResponders = await FirstResponder.findAll({
          attributes: ['userId']
        });
        const responderUserIds = firstResponders.map(user => user.userId);
        
        // Filter users that are first responders
        filteredUsers = users.filter(user => responderUserIds.includes(user.id));
      }
      
      return res.json(filteredUsers);
    }
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        { model: Certification, required: false }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get all emergency requests
router.get('/api/emergency-requests', async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    const requests = await EmergencyRequest.findAll({
      where,
      include: [
        { 
          model: EmergencyUser,
          include: [
            { model: User }
          ]
        },
        { 
          model: FirstResponder,
          include: [
            { model: User }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching emergency requests:', error);
    res.status(500).json({ error: 'Failed to fetch emergency requests' });
  }
});

// Get emergency request by ID
router.get('/api/emergency-requests/:id', async (req, res) => {
  try {
    const request = await EmergencyRequest.findByPk(req.params.id, {
      include: [
        { 
          model: EmergencyUser,
          include: [
            { model: User }
          ]
        },
        { 
          model: FirstResponder,
          include: [
            { model: User }
          ]
        },
        { model: Feedback, required: false }
      ]
    });
    
    if (!request) {
      return res.status(404).json({ error: 'Emergency request not found' });
    }
    
    res.json(request);
  } catch (error) {
    console.error('Error fetching emergency request:', error);
    res.status(500).json({ error: 'Failed to fetch emergency request' });
  }
});

// Get all certifications
router.get('/api/certifications', async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    
    // Apply status filter if provided
    if (status) {
      where.status = status;
    }
    
    const certifications = await Certification.findAll({
      where,
      include: [
        { model: User, required: true }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(certifications);
  } catch (error) {
    console.error('Error fetching certifications:', error);
    res.status(500).json({ error: 'Failed to fetch certifications' });
  }
});

// Update certification status
router.put('/api/certifications/:userId', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const certification = await Certification.findOne({
      where: { userId: req.params.userId }
    });
    
    if (!certification) {
      return res.status(404).json({ error: 'Certification not found' });
    }
    
    certification.status = status;
    await certification.save();
    
    // Update FirstResponder record if it exists
    if (status === 'approved' || status === 'rejected') {
      const firstResponder = await FirstResponder.findOne({
        where: { userId: req.params.userId }
      });
      
      if (firstResponder) {
        firstResponder.certificationStatus = status;
        
        if (status === 'approved') {
          firstResponder.trainingCompletionDate = new Date();
          // Set expiry date to 2 years from now
          const expiryDate = new Date();
          expiryDate.setFullYear(expiryDate.getFullYear() + 2);
          firstResponder.certificationExpiryDate = expiryDate;
        }
        
        await firstResponder.save();
      }
    }
    
    res.json({ success: true, certification });
  } catch (error) {
    console.error('Error updating certification:', error);
    res.status(500).json({ error: 'Failed to update certification' });
  }
});

// Get all training videos
router.get('/api/training-videos', async (req, res) => {
  try {
    const trainingVideos = await TrainingVideo.findAll({
      order: [['order', 'ASC']]
    });
    res.json(trainingVideos);
  } catch (error) {
    console.error('Error fetching training videos:', error);
    res.status(500).json({ error: 'Failed to fetch training videos' });
  }
});

// Create a new training video
router.post('/api/training-videos', async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, order } = req.body;
    
    if (!title || !videoUrl) {
      return res.status(400).json({ error: 'Title and Video URL are required' });
    }
    
    const trainingVideo = await TrainingVideo.create({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      order: order || 0
    });
    
    res.status(201).json(trainingVideo);
  } catch (error) {
    console.error('Error creating training video:', error);
    res.status(500).json({ error: 'Failed to create training video' });
  }
});

// Update a training video
router.put('/api/training-videos/:id', async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, order } = req.body;
    
    const trainingVideo = await TrainingVideo.findByPk(req.params.id);
    
    if (!trainingVideo) {
      return res.status(404).json({ error: 'Training video not found' });
    }
    
    trainingVideo.title = title || trainingVideo.title;
    trainingVideo.description = description || trainingVideo.description;
    trainingVideo.videoUrl = videoUrl || trainingVideo.videoUrl;
    trainingVideo.thumbnailUrl = thumbnailUrl || trainingVideo.thumbnailUrl;
    trainingVideo.order = order !== undefined ? order : trainingVideo.order;
    
    await trainingVideo.save();
    
    res.json(trainingVideo);
  } catch (error) {
    console.error('Error updating training video:', error);
    res.status(500).json({ error: 'Failed to update training video' });
  }
});

// Delete a training video
router.delete('/api/training-videos/:id', async (req, res) => {
  try {
    const trainingVideo = await TrainingVideo.findByPk(req.params.id);
    
    if (!trainingVideo) {
      return res.status(404).json({ error: 'Training video not found' });
    }
    
    await trainingVideo.destroy();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting training video:', error);
    res.status(500).json({ error: 'Failed to delete training video' });
  }
});

// Serve the main admin page for any other routes
router.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

module.exports = router;
