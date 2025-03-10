const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Database and Models
const sequelize = require('./config/database');
const { User, EmergencyUser, FirstResponder, EmergencyRequest, Feedback, Notification, Certification, TrainingProgress, TrainingVideo } = require('./models');

// Test DB Connection and Sync Models
sequelize.authenticate()
    .then(() => {
        console.log('Database connected successfully');
        return sequelize.sync({ force: true });
    })
    .then(() => {
        console.log('Database synced successfully');
    })
    .catch(err => {
        console.error('Database connection/sync error:', err);
        console.error('Error details:', err.parent || err);
    });

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to QuickAid API' });
});

// Create new user
app.post('/api/users', async (req, res) => {
  console.log('Received request to create user:', req.body);
  try {
    const user = await User.create(req.body);
    console.log('User created successfully:', user.id);
    
    // Send a smaller, simpler response
    res.status(201).json({ 
      success: true, 
      message: 'User created successfully',
      userId: user.id
    });
  } catch (error) {
    console.error('Error creating user:', error.message);
    console.error('Error details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create user', 
      error: error.message 
    });
  }
});

// User login
app.post('/api/users/login', async (req, res) => {
  console.log('Received login request:', req.body);
  try {
    const { id } = req.body;
    
    // Find the user
    const user = await User.findByPk(id);
    
    if (!user) {
      console.error('User not found:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    
    console.log('User login successful:', id);
    res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      userId: id
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    console.error('Error details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed', 
      error: error.message 
    });
  }
});

// Add this route to check database status
app.get('/api/status', async (req, res) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    
    // Get table information specifically from public schema
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    // Get all model names
    const modelNames = Object.keys(sequelize.models);
    
    // Count users
    const userCount = await User.count();
    
    res.json({
      status: 'healthy',
      database: 'connected',
      definedModels: modelNames,
      existingTables: results.map(r => r.table_name),
      userCount: userCount,
      schemaInfo: {
        models: sequelize.models,
        tableCount: results.length
      }
    });
  } catch (error) {
    console.error('Database status check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Training Videos Routes

// Get all training videos
app.get('/api/training-videos', async (req, res) => {
  try {
    const videos = await TrainingVideo.findAll({
      order: [['order', 'ASC']]
    });
    res.status(200).json({ success: true, data: videos });
  } catch (error) {
    console.error('Error fetching training videos:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch training videos', error: error.message });
  }
});

// Get user's training progress
app.get('/api/users/:userId/training-progress', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Get all training videos
    const videos = await TrainingVideo.findAll({
      order: [['order', 'ASC']]
    });
    
    // Get user's progress
    const progress = await TrainingProgress.findAll({
      where: { userId },
      attributes: ['videoId', 'completed', 'completedAt']
    });
    
    // Calculate overall progress percentage
    const totalVideos = videos.length;
    const completedVideos = progress.filter(p => p.completed).length;
    const progressPercentage = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
    
    res.status(200).json({
      success: true,
      data: {
        videos,
        progress,
        stats: {
          totalVideos,
          completedVideos,
          progressPercentage
        }
      }
    });
  } catch (error) {
    console.error('Error fetching training progress:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch training progress', error: error.message });
  }
});

// Update training progress for a video
app.post('/api/users/:userId/training-progress', async (req, res) => {
  try {
    const { userId } = req.params;
    const { videoId, completed } = req.body;
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if video exists
    const video = await TrainingVideo.findByPk(videoId);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Training video not found' });
    }
    
    // Find or create progress record
    const [progress, created] = await TrainingProgress.findOrCreate({
      where: { userId, videoId },
      defaults: {
        completed: completed || false,
        completedAt: completed ? new Date() : null
      }
    });
    
    // If record already exists, update it
    if (!created) {
      progress.completed = completed !== undefined ? completed : progress.completed;
      
      // Set completedAt if video is newly completed
      if (completed && !progress.completedAt) {
        progress.completedAt = new Date();
      }
      
      await progress.save();
    }
    
    // Update certification progress if needed
    if (completed) {
      // Get all training videos
      const videos = await TrainingVideo.findAll();
      
      // Get user's progress
      const allProgress = await TrainingProgress.findAll({
        where: { userId }
      });
      
      // Calculate overall progress percentage
      const totalVideos = videos.length;
      const completedVideos = allProgress.filter(p => p.completed).length;
      const progressPercentage = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
      
      // Update or create certification record
      const [certification, certCreated] = await Certification.findOrCreate({
        where: { userId },
        defaults: {
          completedTraining: progressPercentage === 100,
          progress: progressPercentage
        }
      });
      
      if (!certCreated) {
        certification.progress = progressPercentage;
        certification.completedTraining = progressPercentage === 100;
        await certification.save();
      }
    }
    
    res.status(200).json({
      success: true,
      message: created ? 'Training progress created' : 'Training progress updated',
      data: progress
    });
  } catch (error) {
    console.error('Error updating training progress:', error);
    res.status(500).json({ success: false, message: 'Failed to update training progress', error: error.message });
  }
});

// Certification Routes

// Get user's certification status
app.get('/api/users/:userId/certification', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Get certification status
    const certification = await Certification.findOne({
      where: { userId }
    });
    
    if (!certification) {
      return res.status(200).json({
        success: true,
        data: {
          exists: false,
          hasPendingRequest: false
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        exists: true,
        hasPendingRequest: !!certification.requestedAt,
        status: certification.status,
        progress: certification.progress,
        completedTraining: certification.completedTraining
      }
    });
  } catch (error) {
    console.error('Error fetching certification status:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch certification status', error: error.message });
  }
});

// Request certification
app.post('/api/users/:userId/certification/request', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if user has completed all training
    const videos = await TrainingVideo.findAll();
    
    const progress = await TrainingProgress.findAll({
      where: { userId }
    });
    
    const totalVideos = videos.length;
    const completedVideos = progress.filter(p => p.completed).length;
    const progressPercentage = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
    
    if (progressPercentage < 100) {
      return res.status(400).json({ 
        success: false, 
        message: 'Training not completed. You must complete all training videos before requesting certification.',
        data: {
          progress: progressPercentage,
          completedVideos,
          totalVideos
        }
      });
    }
    
    // Create or update certification request
    const [certification, created] = await Certification.findOrCreate({
      where: { userId },
      defaults: {
        completedTraining: true,
        progress: 100,
        requestedAt: new Date(),
        status: 'pending'
      }
    });
    
    if (!created) {
      certification.completedTraining = true;
      certification.progress = 100;
      certification.requestedAt = new Date();
      certification.status = 'pending';
      await certification.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Certification request submitted successfully',
      data: {
        hasPendingRequest: true,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Error requesting certification:', error);
    res.status(500).json({ success: false, message: 'Failed to request certification', error: error.message });
  }
});

// Update certification status (admin endpoint)
app.put('/api/certifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    // Check if certification exists
    const certification = await Certification.findOne({
      where: { userId }
    });
    
    if (!certification) {
      return res.status(404).json({ success: false, message: 'Certification record not found' });
    }
    
    // Update certification status
    certification.status = status || certification.status;
    await certification.save();
    
    // Also update FirstResponder record if it exists
    try {
      const firstResponder = await FirstResponder.findOne({
        where: { userId }
      });
      
      if (firstResponder) {
        firstResponder.certificationStatus = status;
        
        // If certification is approved, set the completion date to now
        if (status === 'approved') {
          firstResponder.trainingCompletionDate = new Date();
          // Set expiry date to 2 years from now
          const expiryDate = new Date();
          expiryDate.setFullYear(expiryDate.getFullYear() + 2);
          firstResponder.certificationExpiryDate = expiryDate;
        }
        
        await firstResponder.save();
      }
    } catch (error) {
      console.error('Error updating first responder status:', error);
      // Don't fail the whole request if just the FirstResponder update fails
    }
    
    res.status(200).json({
      success: true,
      message: 'Certification status updated successfully',
      data: {
        status: certification.status
      }
    });
  } catch (error) {
    console.error('Error updating certification status:', error);
    res.status(500).json({ success: false, message: 'Failed to update certification status', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
