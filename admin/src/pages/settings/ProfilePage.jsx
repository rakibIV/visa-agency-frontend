import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { UserCircleIcon, CheckIcon, KeyIcon } from '@heroicons/react/24/outline';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user } = useAuth();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Basic info form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  
  // SMTP Config
  const [smtpEmail, setSmtpEmail] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  
  // Password form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const { data: profile, refetch } = useQuery({
    queryKey: ['auth-me'],
    queryFn: () => api.get('/auth/me/').then(r => r.data),
  });

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setEmail(profile.email || '');
      setSmtpEmail(profile.smtp_email || '');
      setSmtpPassword(profile.smtp_password || '');
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data) => api.patch('/auth/me/', data),
    onSuccess: () => {
      setSuccess('Profile updated successfully.');
      setError('');
      refetch();
    },
    onError: (err) => {
      setSuccess('');
      setError(err.response?.data?.detail || 'Failed to update profile.');
    },
  });

  const pwdMutation = useMutation({
    mutationFn: (data) => api.patch('/auth/me/password/', data),
    onSuccess: () => {
      setPwdSuccess('Password updated successfully.');
      setPwdError('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err) => {
      setPwdSuccess('');
      setPwdError(err.response?.data?.detail || 'Failed to update password.');
    },
  });

  const handleUpdateInfo = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      first_name: firstName,
      last_name: lastName,
      email: email,
      smtp_email: smtpEmail,
      smtp_password: smtpPassword,
    });
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setPwdError("Passwords do not match.");
    }
    if (newPassword.length < 8) {
      return setPwdError("Password must be at least 8 characters.");
    }
    pwdMutation.mutate({ password: newPassword });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-6">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
          <UserCircleIcon className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{profile?.first_name} {profile?.last_name}</h2>
          <p className="text-slate-500 font-medium">{profile?.email} • @{profile?.username}</p>
          <span className="mt-2 inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg uppercase">System Administrator</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.form 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleUpdateInfo} 
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UserCircleIcon className="w-5 h-5 text-slate-400" /> Basic Information
          </h3>
          
          {success && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl font-medium flex items-center gap-2"><CheckIcon className="w-5 h-5" />{success}</div>}
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl font-medium">{error}</div>}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username (Read Only)</label>
              <input type="text" value={profile?.username || ''} disabled className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-700 mb-4">SMTP Configuration (System Default Email)</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SMTP Email</label>
                  <input type="email" value={smtpEmail} onChange={e => setSmtpEmail(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="admin@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SMTP Password / App Password</label>
                  <input type="password" value={smtpPassword} onChange={e => setSmtpPassword(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="••••••••" />
                  <p className="text-[10px] text-slate-400 mt-1">Used as the default sender for status updates if no lawyer is assigned.</p>
                </div>
              </div>
            </div>
            
            <button type="submit" disabled={updateMutation.isLoading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50">
              {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.form>

        <motion.form 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleUpdatePassword} 
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <KeyIcon className="w-5 h-5 text-slate-400" /> Change Password
          </h3>
          
          {pwdSuccess && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl font-medium flex items-center gap-2"><CheckIcon className="w-5 h-5" />{pwdSuccess}</div>}
          {pwdError && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl font-medium">{pwdError}</div>}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={8} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            
            <button type="submit" disabled={pwdMutation.isLoading} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 mt-4">
              {pwdMutation.isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
