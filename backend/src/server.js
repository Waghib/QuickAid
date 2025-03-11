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
const { User, EmergencyUser, FirstResponder, EmergencyRequest, Feedback, Notification } = require('./models');

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

// Update user type
app.put('/api/users/:userId/type', async (req, res) => {
  try {
    const { userId } = req.params;
    const { userType } = req.body;
    
    if (!userType) {
      return res.status(400).json({ success: false, message: 'userType is required' });
    }
    
    // Find user by phone number or uid
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update user type
    user.userType = userType;
    await user.save();
    
    // If user type is first_responder, create or update FirstResponder record
    if (userType === 'first_responder') {
      await FirstResponder.findOrCreate({
        where: { userId },
        defaults: {
          firstResponderId: userId,
          certificationStatus: 'pending',
          availability: false
        }
      });
    }
    
    // If user type is emergency_user, create or update EmergencyUser record
    if (userType === 'emergency_user') {
      await EmergencyUser.findOrCreate({
        where: { userId },
        defaults: {
          emergencyUserId: userId
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User type updated successfully',
      data: {
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('Error updating user type:', error);
    res.status(500).json({ success: false, message: 'Failed to update user type', error: error.message });
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
