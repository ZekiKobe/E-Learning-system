import sequelize from '../config/database';
// Ensure all models are loaded before syncing
import '../models/User';
import '../models/Category';
import '../models/Course';
import '../models/Lesson';
import '../models/Enrollment';
import '../models/Review';
import '../models/Payment';
import '../models/associations';

const migrate = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Sync all models
    await sequelize.sync({ force: false, alter: true });
    console.log('Database migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();

