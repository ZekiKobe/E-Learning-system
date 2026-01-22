import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { showToast } from '../utils/toast';

function Teach() {
  const { user, token } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<any>(null);
  const [loadingRequest, setLoadingRequest] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMyRequest();
  }, [token, navigate]);

  const fetchMyRequest = async () => {
    try {
      const response = await api.get('/instructor-requests/me');
      setRequest(response.data);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Failed to fetch request:', error);
      }
    } finally {
      setLoadingRequest(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/instructor-requests', { message });
      showToast.success('Instructor request submitted! An admin will review it shortly.');
      fetchMyRequest();
      setMessage('');
    } catch (error: any) {
      showToast.error(error.response?.data?.error || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (loadingRequest) {
    return <div className="text-center py-8 sm:py-12 text-secondary">Loading...</div>;
  }

  if (user?.role === 'instructor' || user?.role === 'admin') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <h1 className="text-3xl font-extrabold mb-4 gradient-text text-primary">You're already an instructor!</h1>
        <p className="text-secondary mb-6">You can start creating courses now.</p>
        <button
          onClick={() => navigate('/instructor/courses')}
          className="px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-amber-500 hover:from-blue-700 hover:to-amber-600 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Go to My Teaching
        </button>
      </motion.div>
    );
  }

  if (request) {
    const statusColors: Record<string, string> = {
      pending: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      approved: 'bg-green-500/20 text-green-300 border-green-500/40',
      rejected: 'bg-red-500/20 text-red-300 border-red-500/40'
    };

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <h1 className="text-3xl font-extrabold mb-4 gradient-text text-primary">Instructor Request Status</h1>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`rounded-xl border p-6 mb-6 backdrop-blur-sm bg-card border-border ${statusColors[request.status]}`}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">Status: {request.status.toUpperCase()}</h2>
            <span className="text-sm">{new Date(request.createdAt).toLocaleDateString()}</span>
          </div>
          {request.message && (
            <p className="text-sm mb-2 mt-2">Your message: {request.message}</p>
          )}
          {request.status === 'rejected' && request.rejectionReason && (
            <p className="text-sm mt-2">Reason: {request.rejectionReason}</p>
          )}
          {request.status === 'approved' && (
            <p className="text-sm mt-2">Congratulations! You can now create courses.</p>
          )}
          {request.status === 'pending' && (
            <p className="text-secondary mt-3">Your request is being reviewed. Please check back later.</p>
          )}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-extrabold mb-2 gradient-text text-primary"
      >
        Become an Instructor
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-secondary mb-8"
      >
        Share your knowledge and teach thousands of students. Submit a request to become an instructor.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-border bg-card p-6 sm:p-8 backdrop-blur-sm shadow-lg"
      >
        <h2 className="text-xl font-bold mb-4 text-primary">Why teach on E-Learning?</h2>
        <ul className="space-y-3 mb-6 text-secondary">
          <li className="flex items-start gap-3">
            <span className="text-amber-400 mt-1">✓</span>
            <span>Reach thousands of students worldwide</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-400 mt-1">✓</span>
            <span>Set your own course prices</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-400 mt-1">✓</span>
            <span>Build your teaching reputation</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-400 mt-1">✓</span>
            <span>Help others learn and grow</span>
          </li>
        </ul>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-secondary font-medium">Tell us about yourself (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your experience, expertise, or why you want to teach..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-amber-500 shadow-lg hover:shadow-xl disabled:opacity-60 hover:from-blue-700 hover:to-amber-600 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
        <p className="text-muted-foreground text-sm mt-4">An admin will review your request and get back to you soon.</p>
      </motion.div>
    </motion.div>
  );
}

export default Teach;

