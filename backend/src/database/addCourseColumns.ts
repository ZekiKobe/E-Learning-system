import sequelize from '../config/database';
import { DataTypes } from 'sequelize';

async function addCourseColumns() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Add new columns to courses table if they don't exist
    const queryInterface = sequelize.getQueryInterface();
    
    // Check if columns exist
    const tableDescription = await queryInterface.describeTable('courses');
    
    if (!tableDescription.previewVideo) {
      await queryInterface.addColumn('courses', 'previewVideo', {
        type: DataTypes.STRING,
        allowNull: true
      });
      console.log('✓ Added previewVideo column to courses table');
    } else {
      console.log('✓ previewVideo column already exists');
    }

    if (!tableDescription.whatYouWillLearn) {
      await queryInterface.addColumn('courses', 'whatYouWillLearn', {
        type: DataTypes.JSON,
        allowNull: true
      });
      console.log('✓ Added whatYouWillLearn column to courses table');
    } else {
      console.log('✓ whatYouWillLearn column already exists');
    }

    if (!tableDescription.requirements) {
      await queryInterface.addColumn('courses', 'requirements', {
        type: DataTypes.JSON,
        allowNull: true
      });
      console.log('✓ Added requirements column to courses table');
    } else {
      console.log('✓ requirements column already exists');
    }

    if (!tableDescription.isFeatured) {
      await queryInterface.addColumn('courses', 'isFeatured', {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
      console.log('✓ Added isFeatured column to courses table');
    } else {
      console.log('✓ isFeatured column already exists');
    }

    if (!tableDescription.isTrending) {
      await queryInterface.addColumn('courses', 'isTrending', {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
      console.log('✓ Added isTrending column to courses table');
    } else {
      console.log('✓ isTrending column already exists');
    }

    console.log('\n✅ Course table columns updated successfully!');
    await sequelize.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error adding columns:', error.message);
    console.error(error);
    await sequelize.close();
    process.exit(1);
  }
}

addCourseColumns();

