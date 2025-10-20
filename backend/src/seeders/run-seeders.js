const seedDemoData = require('./demo-data');
const sequelize = require('../config/database');

async function runSeeders() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Sync models with force: true to drop and recreate tables
    await sequelize.sync({ force: true });
    console.log('Database synced successfully');
    
    // Seed demo data
    const result = await seedDemoData();
    
    console.log('Seeding completed successfully');
    console.log('Summary:');
    console.log(`- Total Users: ${result.users}`);
    console.log(`  - Emergency Users: ${result.emergencyUsers}`);
    console.log(`  - First Responders: ${result.firstResponders}`);
    console.log(`- Emergency Requests: ${result.emergencyRequests}`);
    console.log(`- Notifications: ${result.notifications}`);
    console.log(`- Training Videos: ${result.trainingVideos}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error running seeders:', error);
    process.exit(1);
  }
}

runSeeders();
