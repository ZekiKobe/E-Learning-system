import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { showToast } from '../utils/toast';
import { getImageUrl } from '../utils/imageUtils';

interface ProfileResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
  socialLinks?: any;
}

function Profile() {
  const { user, checkAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    const load = async () => {
      await checkAuth();
      try {
        const res = await api.get<ProfileResponse>('/auth/me');
        setProfile(res.data);
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [checkAuth]);

  const handleChange = (field: keyof ProfileResponse, value: any) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('firstName', profile.firstName);
      fd.append('lastName', profile.lastName);
      if (profile.bio != null) fd.append('bio', profile.bio);
      if (profile.phone != null) fd.append('phone', profile.phone);
      if (profile.address != null) fd.append('address', profile.address);
      if (profile.socialLinks) {
        fd.append('socialLinks', JSON.stringify(profile.socialLinks));
      }
      if (avatarFile) {
        fd.append('avatar', avatarFile);
      }

      const res = await api.put<ProfileResponse>('/users/me', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(res.data);
      showToast.success('Profile updated');
    } catch (error: any) {
      showToast.error(error?.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="loading-skeleton h-8 w-48"></div>
            <div className="loading-skeleton h-4 w-64"></div>
          </div>
          <div className="loading-skeleton h-6 w-16 rounded-full"></div>
        </div>

        <div className="bg-primary border border-primary rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="loading-skeleton w-20 h-20 rounded-full"></div>
            <div className="space-y-2">
              <div className="loading-skeleton h-4 w-32"></div>
              <div className="loading-skeleton h-3 w-48"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="loading-skeleton h-3 w-20"></div>
              <div className="loading-skeleton h-10 w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="loading-skeleton h-3 w-20"></div>
              <div className="loading-skeleton h-10 w-full"></div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="loading-skeleton h-3 w-16"></div>
            <div className="loading-skeleton h-20 w-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="loading-skeleton h-3 w-16"></div>
              <div className="loading-skeleton h-10 w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="loading-skeleton h-3 w-20"></div>
              <div className="loading-skeleton h-10 w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-error-light rounded-full mb-4">
          <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-error font-medium">Profile not found</p>
      </div>
    );
  }

  const avatarSrc =
    avatarFile && typeof URL !== 'undefined'
      ? URL.createObjectURL(avatarFile)
      : profile.avatar
      ? getImageUrl(profile.avatar)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Profile</h1>
          <p className="text-secondary">Manage your personal information and preferences.</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
          profile.role === 'instructor'
            ? 'bg-warning-light text-warning'
            : profile.role === 'admin'
            ? 'bg-error-light text-error'
            : 'bg-accent-light text-accent'
        }`}>
          {user?.role || profile.role}
        </span>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-primary border border-primary rounded-xl p-6 shadow-sm space-y-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-secondary border-2 border-primary flex items-center justify-center overflow-hidden shadow-md">
              {avatarSrc ? (
                <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-accent">
                  {profile.firstName?.[0] || profile.lastName?.[0] || 'U'}
                </span>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-accent-hover transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <svg className="w-4 h-4 text-bg-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </label>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-primary mb-1">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-secondary mb-3">{profile.email}</p>
            <p className="text-xs text-muted">
              Click the camera icon to update your profile picture
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">First name</label>
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Last name</label>
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div>
          <label className="form-label">Bio</label>
          <textarea
            rows={4}
            value={profile.bio || ''}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Tell us about yourself..."
            className="form-input resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Phone</label>
            <input
              type="tel"
              value={profile.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Address</label>
            <input
              type="text"
              value={profile.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Your address"
              className="form-input"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-primary">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-2 px-6"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export default Profile;


