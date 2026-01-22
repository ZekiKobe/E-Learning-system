import sequelize from '../config/database';
import User, { UserRole } from '../models/User';
import Category from '../models/Category';
import '../models';

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Sync database
    await sequelize.sync({ force: false });

    // Create admin user
    const adminExists = await User.findOne({ where: { email: 'admin@elearning.com' } });
    if (!adminExists) {
      await User.create({
        email: 'admin@elearning.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN
      });
      console.log('Admin user created: admin@elearning.com / admin123');
    }

    // Create sample instructor
    const instructorExists = await User.findOne({ where: { email: 'instructor@elearning.com' } });
    if (!instructorExists) {
      await User.create({
        email: 'instructor@elearning.com',
        password: 'instructor123',
        firstName: 'John',
        lastName: 'Instructor',
        role: UserRole.INSTRUCTOR
      });
      console.log('Instructor user created: instructor@elearning.com / instructor123');
    }

    // Create sample categories
    const categories = [
      { name: 'Web Development', slug: 'web-development', description: 'Learn web development' },
      { name: 'Mobile Development', slug: 'mobile-development', description: 'Learn mobile app development' },
      { name: 'Data Science', slug: 'data-science', description: 'Learn data science and analytics' },
      { name: 'Design', slug: 'design', description: 'Learn design principles' },
      { name: 'Business', slug: 'business', description: 'Learn business skills' }
    ];

    for (const cat of categories) {
      const exists = await Category.findOne({ where: { slug: cat.slug } });
      if (!exists) {
        await Category.create(cat);
      }
    }
    console.log('Sample categories created.');

    console.log('Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();

