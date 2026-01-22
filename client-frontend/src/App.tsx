import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseDetail from './pages/CourseDetail';
import MyCourses from './pages/MyCourses';
import LearnCourse from './pages/LearnCourse';
import Quiz from './pages/Quiz';
import Assignment from './pages/Assignment';
import Discussions from './pages/Discussions';
import Notifications from './pages/Notifications';
import Teach from './pages/Teach';
import InstructorCourses from './pages/InstructorCourses';
import InstructorDashboard from './pages/InstructorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Layout from './components/Layout';
import Toast from './components/Toast';

function App() {
  return (
    <Router>
      <Toast />
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/courses" element={<Home />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/teach" element={<Teach />} />
          <Route path="/instructor/courses" element={<InstructorCourses />} />
          <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/learn/:courseId" element={<LearnCourse />} />
          <Route path="/quiz/:quizId" element={<Quiz />} />
          <Route path="/assignment/:assignmentId" element={<Assignment />} />
          <Route path="/courses/:courseId/discussions" element={<Discussions />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

