import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { getImageUrl } from '../utils/imageUtils';
import { showToast } from '../utils/toast';

interface Enrollment {
  id: number;
  progress: number;
  completed: boolean;
  course: {
    id: number;
    title: string;
    thumbnail?: string;
    instructor: {
      firstName: string;
      lastName: string;
    };
  };
}

function MyCourses() {
  const { user, token } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMyCourses();
  }, [token, navigate]);

  const fetchMyCourses = async () => {
    try {
      const response = await api.get('/users/me/enrollments');
      setEnrollments(response.data);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  if (loading) {
    return <div className="text-center py-12 text-secondary">Loading your courses...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-4 px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-extrabold mb-6 gradient-text text-primary"
      >
        My Courses
      </motion.h1>
      {enrollments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-6 sm:p-10 rounded-xl border border-border bg-card backdrop-blur-sm"
        >
          <p className="text-secondary mb-4">You haven't enrolled in any courses yet.</p>
          <Link to="/courses" className="inline-block px-5 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 active:scale-95">Browse Courses</Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {enrollments.map((enrollment, index) => (
            <motion.div
              key={enrollment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="rounded-xl border border-border bg-card overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {enrollment.course.thumbnail && (
                <img src={getImageUrl(enrollment.course.thumbnail)} alt={enrollment.course.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-bold mb-1 text-primary">{enrollment.course.title}</h3>
                <p className="text-secondary text-sm mb-3">
                  {enrollment.course.instructor.firstName} {enrollment.course.instructor.lastName}
                </p>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-blue-600" style={{ width: `${enrollment.progress}%` }} />
                </div>
                <p className="text-muted-foreground text-xs mb-3">{enrollment.progress}% Complete</p>
                <div className="space-y-2">
                  <Link to={`/learn/${enrollment.course.id}`} className="block text-center px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-amber-500">
                    {enrollment.completed ? 'Review Course' : 'Continue Learning'}
                  </Link>
                  {enrollment.completed && (
                    <button
                      onClick={async () => {
                        try {
                          const res = await api.get(`/certificates/course/${enrollment.course.id}`);
                          showToast.success(`Certificate generated! ID: ${res.data.certificate.certificateId}. Download coming soon!`);
                        } catch (error: any) {
                          showToast.error(error.response?.data?.error || 'Failed to generate certificate');
                        }
                      }}
                      className="w-full px-4 py-2 rounded-lg font-semibold text-blue-300 border border-blue-500/40 hover:bg-blue-500/10 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Certificate
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default MyCourses;

