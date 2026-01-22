import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database';
import passport from './config/passport';
import fs from 'fs';
import path from 'path';

// Routes
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import lessonRoutes from './routes/lessonRoutes';
import adminRoutes from './routes/adminRoutes';
import userRoutes from './routes/userRoutes';
import instructorRequestRoutes from './routes/instructorRequestRoutes';
import categoryRoutes from './routes/categoryRoutes';
import paymentRoutes from './routes/paymentRoutes';
import reviewRoutes from './routes/reviewRoutes';
import certificateRoutes from './routes/certificateRoutes';
import quizRoutes from './routes/quizRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import progressRoutes from './routes/progressRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import discussionRoutes from './routes/discussionRoutes';
import notificationRoutes from './routes/notificationRoutes';
import resourceRoutes from './routes/resourceRoutes';
import noteRoutes from './routes/noteRoutes';
import bookmarkRoutes from './routes/bookmarkRoutes';
import announcementRoutes from './routes/announcementRoutes';
import couponRoutes from './routes/couponRoutes';
import refundRoutes from './routes/refundRoutes';

dotenv.config();

// Ensure all models and their associations are initialized before routes/controllers
import './models/User';
import './models/Category';
import './models/Course';
import './models/Lesson';
import './models/Enrollment';
import './models/Review';
import './models/Payment';
import './models/Quiz';
import './models/Question';
import './models/QuizAttempt';
import './models/Assignment';
import './models/Submission';
import './models/LessonProgress';
import './models/Wishlist';
import './models/Discussion';
import './models/Notification';
import './models/Resource';
import './models/Note';
import './models/Bookmark';
import './models/Announcement';
import './models/Coupon';
import './models/Refund';
import './models/InstructorRequest';
// Import associations after all models are loaded
import './models/associations';

const app = express();
const PORT = 5001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
        process.env.ADMIN_FRONTEND_URL || 'http://localhost:5174',
        process.env.CLIENT_FRONTEND_URL || 'http://localhost:5176'
      ]
    : true, // Allow all origins in development
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Ensure upload directories exist
const uploadsRoot = path.join(__dirname, '../uploads');
const uploadDirs = [uploadsRoot, path.join(uploadsRoot, 'videos'), path.join(uploadsRoot, 'images')];
for (const dir of uploadDirs) {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    console.error('Failed to ensure upload directory exists:', dir, e);
  }
}
// Static for uploaded files
app.use('/uploads', express.static(uploadsRoot));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/instructor-requests', instructorRequestRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/refunds', refundRoutes);

// Multer error handler for friendly messages
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    const isVideo = (_req as any).route?.path?.includes('lessons') || (_req as any).originalUrl?.includes('/lessons/');
    const maxMb = isVideo ? (Number(process.env.MAX_VIDEO_MB) || 1024) : (Number(process.env.MAX_IMAGE_MB) || 20);
    return res.status(413).json({ error: `File too large. Max allowed is ${maxMb}MB.` });
  }
  return res.status(500).json({ error: err?.message || 'Server error' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'E-Learning API is running' });
});

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync database (use with caution in production)
    if (process.env.NODE_ENV === 'development') {
      const alter = process.env.DB_SYNC_ALTER ? process.env.DB_SYNC_ALTER === 'true' : true;
      await sequelize.sync({ alter });
      console.log(`Database models synchronized. alter=${alter}`);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();

export default app;

