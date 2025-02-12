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
const models = require('./models');

// Test DB Connection and Sync Models
sequelize.authenticate()
    .then(() => {
        console.log('Database connected successfully');
        return sequelize.sync({ alter: true }); // In development, use alter: true to automatically update tables
    })
    .then(() => {
        console.log('Database models synchronized successfully');
    })
    .catch(err => console.error('Database connection/sync error:', err));

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to QuickAid API' });
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
