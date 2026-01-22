import sequelize from '../config/database';
import { DataTypes } from 'sequelize';

async function addUserColumns() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('users');
    
    if (!tableDescription.phone) {
      await queryInterface.addColumn('users', 'phone', {
        type: DataTypes.STRING,
        allowNull: true
      });
      console.log('✓ Added phone column to users table');
    } else {
      console.log('✓ phone column already exists');
    }

    if (!tableDescription.address) {
      await queryInterface.addColumn('users', 'address', {
        type: DataTypes.TEXT,
        allowNull: true
      });
      console.log('✓ Added address column to users table');
    } else {
      console.log('✓ address column already exists');
    }

    if (!tableDescription.socialLinks) {
      await queryInterface.addColumn('users', 'socialLinks', {
        type: DataTypes.JSON,
        allowNull: true
      });
      console.log('✓ Added socialLinks column to users table');
    } else {
      console.log('✓ socialLinks column already exists');
    }

    console.log('\n✅ User table columns updated successfully!');
    await sequelize.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error adding columns:', error.message);
    console.error(error);
    await sequelize.close();
    process.exit(1);
  }
}

addUserColumns();

