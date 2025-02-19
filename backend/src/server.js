const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database and Models
const sequelize = require('./config/database');
const { User, EmergencyUser, FirstResponder, EmergencyRequest, Feedback, Notification } = require('./models');

// Test DB Connection and Sync Models
sequelize.authenticate()
    .then(() => {
        console.log('Database connected successfully');
        return sequelize.sync({ alter: true });
    })
    .then(() => {
        console.log('Database models synchronized successfully');
        console.log('Created models:', Object.keys(sequelize.models));
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
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Login endpoint
app.post('/api/users/login', async (req, res) => {
  try {
    console.log('Received login request:', req.body); // Debug log

    const { phoneNumber, name } = req.body;

    // Find or create user
    const [user, created] = await User.findOrCreate({
      where: { id: phoneNumber },
      defaults: {
        name: name,
        contactInfo: phoneNumber,
        latitude: 0,
        longitude: 0,
        userType: 'emergency_user'
      }
    });

    // Update last login time
    await user.update({ updatedAt: new Date() });

    console.log('User logged in:', user.id); // Debug log

    res.status(200).json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        created: created
      }
    });
  } catch (error) {
    console.error('Login error:', error); // Debug log
    res.status(500).json({ 
      message: 'Failed to process login',
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
