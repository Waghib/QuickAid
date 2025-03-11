// Script to update database schema for adding metadata column to Certification table
const sequelize = require('../config/database');

async function addMetadataColumnToCertification() {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log('Checking if metadata column exists in Certification table...');
    const tableInfo = await queryInterface.describeTable('Certifications');
    
    if (!tableInfo.metadata) {
      console.log('Adding metadata column to Certification table...');
      await queryInterface.addColumn('Certifications', 'metadata', {
        type: sequelize.Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      });
      console.log('Successfully added metadata column to Certification table!');
    } else {
      console.log('Metadata column already exists in Certification table.');
    }
    
    console.log('Schema update complete!');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    // Close the connection
    await sequelize.close();
  }
}

// Run the function
addMetadataColumnToCertification();
