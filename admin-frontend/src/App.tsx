import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Users from './pages/Users';
import Categories from './pages/Categories';
import InstructorRequests from './pages/InstructorRequests';
import Refunds from './pages/Refunds';
import Payments from './pages/Payments';
import Reviews from './pages/Reviews';
import EnrollmentAnalytics from './pages/EnrollmentAnalytics';
import Announcements from './pages/Announcements';
import Notifications from './pages/Notifications';
import QuizManagement from './pages/QuizManagement';
import Layout from './components/Layout';
import Toast from './components/Toast';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Toast />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="users" element={<Users />} />
          <Route path="categories" element={<Categories />} />
          <Route path="instructor-requests" element={<InstructorRequests />} />
          <Route path="refunds" element={<Refunds />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="analytics/enrollments" element={<EnrollmentAnalytics />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="quizzes" element={<QuizManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

