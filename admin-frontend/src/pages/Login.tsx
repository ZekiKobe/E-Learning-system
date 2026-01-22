import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, token, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && user) {
      navigate('/');
    }
  }, [token, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/40 bg-slate-900/40 p-7 shadow">
        <h1 className="text-2xl font-extrabold mb-1 text-center">Admin Login</h1>
        <p className="text-slate-400 text-center mb-5">E-Learning System</p>
        {error && <div className="mb-4 p-3 rounded-md bg-red-500/10 text-red-300 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@elearning.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-600/60 bg-slate-900/60 placeholder:text-slate-500"
            />
          </div>
          <div>
            <label className="block mb-2 text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-xl border border-slate-600/60 bg-slate-900/60 placeholder:text-slate-500"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full px-4 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-slate-500 text-sm mt-5 text-center">Demo: admin@elearning.com / admin123</p>
      </div>
    </div>
  );
}

export default Login;

