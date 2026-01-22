# E-Learning Platform (Udemy-style)

A modern, full-featured e-learning platform built with React, TypeScript, Node.js, Express, and MySQL. Features course creation, video uploads, payment integration (Chapa & Telebirr), reviews, certificates, and comprehensive dashboards.

## 🚀 Features

### Core Features
- ✅ User Authentication (JWT-based)
- ✅ Course Management (Create, Edit, Delete)
- ✅ Lesson Management with Video Upload
- ✅ Payment Integration (Chapa & Telebirr)
- ✅ Reviews & Ratings System
- ✅ Student Dashboard with Progress Tracking
- ✅ Instructor Dashboard with Analytics
- ✅ Admin Panel with Revenue Analytics
- ✅ Certificate Generation
- ✅ Course Search & Filters
- ✅ Responsive Modern UI (TailwindCSS)

### Advanced Learning Features
- ✅ **Quiz System**: Multiple question types (MCQ, True/False, Short Answer, Essay) with automatic scoring
- ✅ **Assignment System**: Create assignments, submit work, grade submissions
- ✅ **Progress Tracking**: Detailed lesson-by-lesson progress with completion tracking
- ✅ **Wishlist**: Save courses for later purchase
- ✅ **Q&A Forums**: Interactive discussions with replies, upvotes, and resolution
- ✅ **Notifications**: In-app notifications for all platform activities
- ✅ **Student Notes**: Take notes with video timestamps
- ✅ **Bookmarks**: Bookmark important moments in video lessons
- ✅ **Course Resources**: Upload and download course materials (PDFs, documents, links)
- ✅ **Announcements**: Course announcements from instructors
- ✅ **Discount Coupons**: Percentage or fixed discounts, course-specific or site-wide
- ✅ **Refund System**: Request and process refunds

### User Roles
- **Student**: Browse, purchase, enroll, learn, review courses
- **Instructor**: Create courses, upload videos, view analytics
- **Admin**: Manage users, courses, categories, view platform analytics

## 📁 Project Structure

```
ELS/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/      # Route controllers
│   │   ├── models/          # Sequelize models
│   │   ├── routes/          # Express routes
│   │   ├── middleware/      # Auth middleware
│   │   ├── database/        # Seed data
│   │   └── server.ts        # Express app entry
│   └── uploads/             # Uploaded files (videos, images)
│       ├── videos/
│       └── images/
├── client-frontend/          # Student/Instructor frontend
├── admin-frontend/           # Admin dashboard
└── README.md
```

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: MySQL (via Sequelize ORM)
- **Authentication**: JWT
- **File Upload**: Multer
- **Payments**: Chapa API, Telebirr API

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MySQL (v8+)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=elearning_db
   DB_USER=root
   DB_PASSWORD=your_password
   DB_DIALECT=mysql
   
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   NODE_ENV=development
   
   # Payment Gateways
   CHAPA_SECRET_KEY=your_chapa_secret_key
   CHAPA_BASE_URL=https://api.chapa.co
   TELEBIRR_APP_KEY=your_telebirr_app_key
   
   # URLs
   API_BASE_URL=http://localhost:5000
   CLIENT_FRONTEND_URL=http://localhost:5174
   ADMIN_FRONTEND_URL=http://localhost:5173
   ```

4. **Create upload directories**
   ```bash
   mkdir -p uploads/videos uploads/images
   ```

5. **Run database migrations** (if needed)
   ```bash
   # The app auto-syncs in development mode
   npm run dev
   ```

6. **Start backend server**
   ```bash
   npm run dev
   # or
   npm start
   ```

### Client Frontend Setup

1. **Navigate to client-frontend directory**
   ```bash
   cd client-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (optional)
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Admin Frontend Setup

1. **Navigate to admin-frontend directory**
   ```bash
   cd admin-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (optional)
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

### Main Tables
- `users` - User accounts (students, instructors, admins)
- `courses` - Course information
- `lessons` - Course lessons (videos, text, quizzes)
- `enrollments` - Student course enrollments
- `reviews` - Course reviews and ratings
- `payments` - Payment transactions
- `categories` - Course categories
- `instructor_requests` - Instructor application requests

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - List courses (with filters)
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (instructor/admin)
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `POST /api/courses/:id/enroll` - Enroll in course

### Lessons
- `GET /api/lessons/course/:courseId` - Get course lessons
- `POST /api/lessons/course/:courseId` - Create lesson (with video upload)
- `PUT /api/lessons/:id` - Update lesson
- `DELETE /api/lessons/:id` - Delete lesson

### Quizzes
- `POST /api/quizzes` - Create quiz (instructor/admin)
- `GET /api/quizzes/:id` - Get quiz with questions
- `POST /api/quizzes/:quizId/questions` - Add question to quiz
- `POST /api/quizzes/:quizId/attempts` - Start quiz attempt
- `PUT /api/quizzes/attempts/:attemptId` - Submit quiz attempt
- `GET /api/quizzes/:quizId/attempts` - Get user's quiz attempts

### Assignments
- `POST /api/assignments` - Create assignment (instructor/admin)
- `GET /api/assignments/course/:courseId` - Get course assignments
- `POST /api/assignments/:assignmentId/submit` - Submit assignment
- `PUT /api/assignments/submissions/:submissionId/grade` - Grade assignment
- `GET /api/assignments/:assignmentId/submissions` - Get submissions (instructor)

### Progress
- `PUT /api/progress/lessons/:lessonId` - Update lesson progress
- `GET /api/progress/lessons/:lessonId` - Get lesson progress
- `GET /api/progress/courses/:courseId` - Get course progress

### Wishlist
- `POST /api/wishlist/:courseId` - Add to wishlist
- `DELETE /api/wishlist/:courseId` - Remove from wishlist
- `GET /api/wishlist` - Get user's wishlist
- `GET /api/wishlist/check/:courseId` - Check if in wishlist

### Discussions
- `POST /api/discussions` - Create discussion/question
- `GET /api/discussions/course/:courseId` - Get course discussions
- `GET /api/discussions/:id` - Get discussion with replies
- `POST /api/discussions/:id/upvote` - Upvote discussion
- `PUT /api/discussions/:id/resolve` - Resolve discussion (instructor)
- `PUT /api/discussions/:id/pin` - Pin discussion (instructor)

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/unread/count` - Get unread count
- `DELETE /api/notifications/:id` - Delete notification

### Resources
- `POST /api/resources` - Create resource (instructor/admin)
- `GET /api/resources/course/:courseId` - Get course resources
- `POST /api/resources/:id/download` - Download resource
- `DELETE /api/resources/:id` - Delete resource

### Notes
- `POST /api/notes` - Create note
- `GET /api/notes/lesson/:lessonId` - Get lesson notes
- `GET /api/notes` - Get all user notes
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Bookmarks
- `POST /api/bookmarks` - Create bookmark
- `GET /api/bookmarks/lesson/:lessonId` - Get lesson bookmarks
- `GET /api/bookmarks` - Get all user bookmarks
- `DELETE /api/bookmarks/:id` - Delete bookmark

### Announcements
- `POST /api/announcements` - Create announcement (instructor/admin)
- `GET /api/announcements/course/:courseId` - Get course announcements
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

### Coupons
- `POST /api/coupons` - Create coupon (admin)
- `POST /api/coupons/validate` - Validate coupon code
- `GET /api/coupons` - Get all coupons (admin)
- `PUT /api/coupons/:id` - Update coupon (admin)

### Refunds
- `POST /api/refunds` - Request refund
- `GET /api/refunds` - Get user refunds
- `GET /api/refunds/all` - Get all refunds (admin)
- `PUT /api/refunds/:id/process` - Process refund (admin)

### Payments
- `POST /api/payments/checkout` - Initiate payment
- `GET /api/payments/chapa/verify/:reference` - Verify Chapa payment
- `POST /api/payments/telebirr/notify` - Telebirr webhook

### Reviews
- `GET /api/reviews/course/:courseId` - Get course reviews
- `POST /api/reviews/course/:courseId` - Create/update review
- `DELETE /api/reviews/:id` - Delete review

### Certificates
- `GET /api/certificates/course/:courseId` - Generate certificate
- `GET /api/certificates/:certificateId/download` - Download certificate

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - List users
- `GET /api/admin/categories` - List categories

## 🎯 Usage Guide

### For Students
1. Register/Login
2. Browse courses on homepage
3. Use filters (category, price, rating, level)
4. View course details and reviews
5. Purchase course via Chapa/Telebirr
6. Access enrolled courses in "My Courses"
7. Learn with video player (fullscreen, speed control)
8. Submit reviews after completion
9. Download certificate when course is completed

### For Instructors
1. Apply to become instructor (via `/teach`)
2. Wait for admin approval
3. Access instructor dashboard at `/instructor/dashboard`
4. Create courses at `/instructor/courses`
5. Upload course thumbnail
6. Add lessons with video uploads
7. View analytics (students, revenue, ratings)

### For Admins
1. Login to admin panel
2. Manage users, courses, categories
3. Approve/reject instructor requests
4. View platform analytics (revenue, top courses)
5. Manage course lessons with video uploads

## 🔐 Default Admin Account

Create an admin user via database seed or manually:
```sql
INSERT INTO users (email, password, firstName, lastName, role) 
VALUES ('admin@elearning.com', '$2a$10$...', 'Admin', 'User', 'admin');
```

Or use the seed script in `backend/src/database/seed.ts`

## 📝 Payment Integration

### Chapa
1. Get API key from [Chapa](https://chapa.co)
2. Add to `.env`: `CHAPA_SECRET_KEY=your_key`
3. Payment flow: Checkout → Chapa → Verify → Enroll

### Telebirr
1. Get credentials from Telebirr
2. Add to `.env`: `TELEBIRR_APP_KEY=your_key`
3. Implement webhook handler (see `paymentController.ts`)

## 🎨 UI Features

- Modern, responsive design
- Smooth animations (fade-in, hover effects)
- Dark theme with glassmorphism
- Mobile-friendly navigation
- Video player with fullscreen & speed control
- Interactive course cards
- Review system with star ratings

## 🚧 Future Enhancements

- [ ] PDF certificate generation (using pdfkit/puppeteer)
- [ ] Email notifications (SendGrid, AWS SES)
- [ ] Course recommendations algorithm
- [ ] Learning paths
- [ ] Badges/Achievements system
- [ ] Dark/Light mode toggle
- [ ] Video streaming optimization (CDN, transcoding)
- [ ] AWS S3/MinIO integration for file storage
- [ ] Advanced search with full-text indexing
- [ ] Live sessions/Webinars
- [ ] Mobile app (React Native)

## 📄 License

MIT License

## 👥 Contributing

Contributions welcome! Please open an issue or submit a PR.

---

**Built with ❤️ for modern e-learning**

