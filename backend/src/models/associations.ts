import Course from './Course';
import Lesson from './Lesson';
import User from './User';
import Category from './Category';
import Enrollment from './Enrollment';
import Review from './Review';
import Payment from './Payment';
import Quiz from './Quiz';
import Question from './Question';
import QuizAttempt from './QuizAttempt';
import Assignment from './Assignment';
import Submission from './Submission';
import LessonProgress from './LessonProgress';
import Wishlist from './Wishlist';
import Discussion from './Discussion';
import Notification from './Notification';
import Resource from './Resource';
import Note from './Note';
import Bookmark from './Bookmark';
import Announcement from './Announcement';
import Coupon from './Coupon';
import Refund from './Refund';
import InstructorRequest from './InstructorRequest';

// Define associations after all models are initialized

// Course associations
Course.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });
Course.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Course.hasMany(Lesson, { foreignKey: 'courseId', as: 'lessons' });
Course.hasMany(Enrollment, { foreignKey: 'courseId', as: 'enrollments' });
Lesson.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Enrollment associations
User.hasMany(Enrollment, { foreignKey: 'userId', as: 'enrollments' });
Enrollment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Review associations
Course.hasMany(Review, { foreignKey: 'courseId', as: 'reviews' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Review.belongsTo(Course, { foreignKey: 'courseId', as: 'reviewedCourse' });

// Payment associations
Course.hasMany(Payment, { foreignKey: 'courseId', as: 'payments' });
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Payment.belongsTo(Course, { foreignKey: 'courseId', as: 'paymentCourse' });

// Quiz associations
Course.hasMany(Quiz, { foreignKey: 'courseId', as: 'quizzes' });
Lesson.hasMany(Quiz, { foreignKey: 'lessonId', as: 'quizzes' });
Quiz.hasMany(Question, { foreignKey: 'quizId', as: 'questions' });
Question.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });
User.hasMany(QuizAttempt, { foreignKey: 'userId', as: 'quizAttempts' });
Quiz.hasMany(QuizAttempt, { foreignKey: 'quizId', as: 'attempts' });
QuizAttempt.belongsTo(User, { foreignKey: 'userId', as: 'user' });
QuizAttempt.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });

// Assignment associations
Course.hasMany(Assignment, { foreignKey: 'courseId', as: 'assignments' });
Lesson.hasMany(Assignment, { foreignKey: 'lessonId', as: 'assignments' });
Assignment.hasMany(Submission, { foreignKey: 'assignmentId', as: 'submissions' });
User.hasMany(Submission, { foreignKey: 'userId', as: 'submissions' });
Submission.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Submission.belongsTo(Assignment, { foreignKey: 'assignmentId', as: 'assignment' });

// Progress associations
User.hasMany(LessonProgress, { foreignKey: 'userId', as: 'lessonProgress' });
Lesson.hasMany(LessonProgress, { foreignKey: 'lessonId', as: 'progress' });
LessonProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });
LessonProgress.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

// Wishlist associations
User.hasMany(Wishlist, { foreignKey: 'userId', as: 'wishlist' });
Course.hasMany(Wishlist, { foreignKey: 'courseId', as: 'wishlistItems' });
Wishlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Wishlist.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Discussion associations
Course.hasMany(Discussion, { foreignKey: 'courseId', as: 'discussions' });
Lesson.hasMany(Discussion, { foreignKey: 'lessonId', as: 'discussions' });
User.hasMany(Discussion, { foreignKey: 'userId', as: 'discussions' });
Discussion.hasMany(Discussion, { foreignKey: 'parentId', as: 'replies' });
Discussion.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Discussion.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Discussion.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });
Discussion.belongsTo(Discussion, { foreignKey: 'parentId', as: 'parent' });

// Notification associations
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Resource associations
Course.hasMany(Resource, { foreignKey: 'courseId', as: 'resources' });
Lesson.hasMany(Resource, { foreignKey: 'lessonId', as: 'resources' });
Resource.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Resource.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

// Note associations
User.hasMany(Note, { foreignKey: 'userId', as: 'notes' });
Lesson.hasMany(Note, { foreignKey: 'lessonId', as: 'notes' });
Note.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Note.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

// Bookmark associations
User.hasMany(Bookmark, { foreignKey: 'userId', as: 'bookmarks' });
Lesson.hasMany(Bookmark, { foreignKey: 'lessonId', as: 'bookmarks' });
Bookmark.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Bookmark.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

// Announcement associations
Course.hasMany(Announcement, { foreignKey: 'courseId', as: 'announcements' });
User.hasMany(Announcement, { foreignKey: 'instructorId', as: 'announcements' });
Announcement.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Announcement.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

// Coupon associations
Course.hasMany(Coupon, { foreignKey: 'courseId', as: 'coupons' });
Coupon.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Refund associations
User.hasMany(Refund, { foreignKey: 'userId', as: 'refunds' });
Payment.hasMany(Refund, { foreignKey: 'paymentId', as: 'refunds' });
Refund.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Refund.belongsTo(Payment, { foreignKey: 'paymentId', as: 'payment' });

// InstructorRequest associations
User.hasMany(InstructorRequest, { foreignKey: 'userId', as: 'instructorRequests' });
User.hasMany(InstructorRequest, { foreignKey: 'reviewedBy', as: 'reviewedRequests' });
InstructorRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });
InstructorRequest.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

export {};

