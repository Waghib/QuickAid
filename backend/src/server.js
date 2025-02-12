const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database
const sequelize = require('./config/database');

// Test DB Connection
sequelize.authenticate()
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Unable to connect to the database:', err));

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
