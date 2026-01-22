import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/api';
import { useThemeStore } from '../store/themeStore';
import { showToast } from '../utils/toast';

function Settings() {
  const { theme } = useThemeStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [emailUpdates, setEmailUpdates] = useState(true);
  const [productUpdates, setProductUpdates] = useState(true);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      showToast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      showToast.error(error?.response?.data?.error || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-primary">Settings</h1>
        <p className="text-secondary">
          Control your account security and notification preferences.
        </p>
      </div>

      <div className="bg-primary border border-primary rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-accent-light rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary">Password</h2>
            <p className="text-sm text-secondary">
              Choose a strong, unique password to keep your account secure.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="form-label">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter a new strong password"
              className="form-input"
            />
          </div>
          <div className="flex justify-end pt-2 border-t border-primary">
            <button
              type="submit"
              disabled={savingPassword}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-2 px-6"
            >
              {savingPassword ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </div>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-primary border border-primary rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683a17.925 17.925 0 01-7.132-8.317M12 21V9m0 0l3 3m-3-3l-3 3" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary">Notifications</h2>
            <p className="text-sm text-secondary">
              Choose which updates you want to receive by email.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-start gap-4 p-4 bg-secondary border border-primary rounded-lg cursor-pointer hover:bg-tertiary transition-colors">
            <input
              type="checkbox"
              checked={emailUpdates}
              onChange={(e) => setEmailUpdates(e.target.checked)}
              className="mt-1 w-4 h-4 text-accent border-primary rounded focus:ring-accent focus:ring-2"
            />
            <div className="flex-1">
              <p className="font-medium text-primary">Course updates</p>
              <p className="text-sm text-secondary">
                Get notified about new lessons and announcements.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-4 p-4 bg-secondary border border-primary rounded-lg cursor-pointer hover:bg-tertiary transition-colors">
            <input
              type="checkbox"
              checked={productUpdates}
              onChange={(e) => setProductUpdates(e.target.checked)}
              className="mt-1 w-4 h-4 text-accent border-primary rounded focus:ring-accent focus:ring-2"
            />
            <div className="flex-1">
              <p className="font-medium text-primary">Product news</p>
              <p className="text-sm text-secondary">
                Occasional tips and feature announcements.
              </p>
            </div>
          </label>
        </div>

        <div className="mt-4 p-3 bg-warning-light border border-warning/20 rounded-lg">
          <p className="text-xs text-warning">
            <strong>Note:</strong> Notification preferences are currently local only; backend wiring can be added when endpoints are available.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default Settings;


