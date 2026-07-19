import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateProfile } from '../../store/slices/authSlice';
import { toggleDarkMode, selectDarkMode } from '../../store/slices/uiSlice';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import authService from '../../services/authService';

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const darkMode = useSelector(selectDarkMode);
  const [activeTab, setActiveTab] = useState('profile');

  const { register: regProfile, handleSubmit: submitProfile } = useForm({ defaultValues: { name: user?.name, phone: user?.phone } });
  const { register: regPass, handleSubmit: submitPass, watch, reset: resetPass } = useForm();

  const onUpdateProfile = async (data) => {
    const result = await dispatch(updateProfile(data));
    if (result.meta.requestStatus === 'fulfilled') toast.success('Profile updated!');
    else toast.error('Update failed');
  };

  const onChangePassword = async (data) => {
    try {
      await authService.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed!');
      resetPass();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-5">
      <h1 className="page-title">Settings</h1>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Sidebar tabs */}
        <div className="card p-2 lg:w-48 flex lg:flex-col gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700'}`}>
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
              <h3 className="section-title mb-5">Profile Information</h3>
              <form onSubmit={submitProfile(onUpdateProfile)} className="space-y-4 max-w-md">
                <Input label="Full Name" {...regProfile('name')} />
                <Input label="Email" value={user?.email} disabled hint="Email cannot be changed" />
                <Input label="Phone" {...regProfile('phone')} />
                <Button type="submit">Save Changes</Button>
              </form>
            </motion.div>
          )}

          {activeTab === 'password' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
              <h3 className="section-title mb-5">Change Password</h3>
              <form onSubmit={submitPass(onChangePassword)} className="space-y-4 max-w-md">
                <Input label="Current Password" type="password" {...regPass('currentPassword', { required: 'Required' })} />
                <Input label="New Password" type="password" {...regPass('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} />
                <Input label="Confirm Password" type="password" {...regPass('confirmPassword', { validate: v => v === watch('newPassword') || 'Passwords do not match' })} />
                <Button type="submit">Change Password</Button>
              </form>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
              <h3 className="section-title mb-5">Appearance</h3>
              <div className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  {darkMode ? <Moon className="w-5 h-5 text-primary-600" /> : <Sun className="w-5 h-5 text-amber-500" />}
                  <div>
                    <p className="font-medium text-secondary-900 dark:text-white">Dark Mode</p>
                    <p className="text-sm text-secondary-500">{darkMode ? 'Currently enabled' : 'Currently disabled'}</p>
                  </div>
                </div>
                <button onClick={() => dispatch(toggleDarkMode())}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${darkMode ? 'bg-primary-600' : 'bg-secondary-200'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
              <h3 className="section-title mb-5">Notification Preferences</h3>
              <div className="space-y-3">
                {['Email Notifications', 'Order Assigned', 'Order Approved', 'Payment Completed', 'Low Stock Alerts'].map((pref) => (
                  <div key={pref} className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                    <p className="text-sm font-medium text-secondary-900 dark:text-white">{pref}</p>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded cursor-pointer" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
