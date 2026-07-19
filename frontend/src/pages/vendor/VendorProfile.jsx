import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import vendorService from '../../services/vendorService';
import { updateProfile } from '../../store/slices/authSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Spinner from '../../components/ui/Spinner';
import useAuth from '../../hooks/useAuth';

const VendorProfile = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    vendorService.getMyProfile()
      .then(r => { setProfile(r.data); reset(r.data); })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data) => {
    try {
      await vendorService.updateMyProfile(data);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
  };

  if (loading) return <Spinner size="lg" text="Loading profile..." />;

  return (
    <div className="space-y-5">
      <h1 className="page-title">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Avatar Card */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6 text-center">
          <Avatar src={profile?.profileImage} name={profile?.companyName} size="xl" className="mx-auto mb-4" />
          <h2 className="font-bold text-secondary-900 dark:text-white">{profile?.companyName}</h2>
          <p className="text-sm text-secondary-500">{profile?.ownerName}</p>
          <p className="text-xs text-secondary-400 mt-1">{profile?.email}</p>
          <div className="mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-700">
            <p className="text-xs text-secondary-500">Member since</p>
            <p className="text-sm font-medium text-secondary-800 dark:text-secondary-200">
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : '—'}
            </p>
          </div>
        </motion.div>

        {/* Edit Form */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card p-6 lg:col-span-2">
          <h3 className="section-title mb-5">Edit Profile</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Company Name" {...register('companyName')} />
            <Input label="Owner Name" {...register('ownerName')} />
            <Input label="Phone" {...register('phone')} />
            <Input label="GST Number" {...register('gstNumber')} />
            <Input label="Address" containerClassName="sm:col-span-2" {...register('address')} />
            <Input label="City" {...register('city')} />
            <Input label="State" {...register('state')} />
            <Input label="Pincode" {...register('pincode')} />
            <Input label="Account Number" {...register('bankDetails.accountNumber')} />
            <Input label="IFSC Code" {...register('bankDetails.ifscCode')} />
            <div className="sm:col-span-2">
              <Button type="submit" icon={Save}>Save Profile</Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default VendorProfile;
