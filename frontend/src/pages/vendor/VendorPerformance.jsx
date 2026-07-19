import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, ShoppingCart, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import vendorService from '../../services/vendorService';
import Spinner from '../../components/ui/Spinner';

const StarBar = ({ label, value }) => (
  <div className="flex items-center gap-3">
    <span className="text-sm text-secondary-500 w-32 flex-shrink-0">{label}</span>
    <div className="flex-1 bg-secondary-100 dark:bg-secondary-700 rounded-full h-2">
      <motion.div initial={{ width: 0 }} animate={{ width: `${((value || 0) / 5) * 100}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="bg-amber-400 h-2 rounded-full" />
    </div>
    <div className="flex items-center gap-1 w-14 flex-shrink-0">
      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
      <span className="text-sm font-medium">{(value || 0).toFixed(1)}</span>
    </div>
  </div>
);

const VendorPerformance = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorService.getMyProfile()
      .then(r => setProfile(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" text="Loading performance data..." />;

  const rating = profile?.rating || {};

  return (
    <div className="space-y-5">
      <h1 className="page-title">My Performance</h1>

      <div className="card p-8 text-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200/50 dark:border-amber-700/30">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-400 rounded-full mb-4 shadow-lg">
          <Star className="w-10 h-10 text-white fill-white" />
        </div>
        <p className="text-6xl font-black text-amber-600">{(rating.overall || 0).toFixed(1)}</p>
        <p className="text-secondary-600 dark:text-secondary-400 mt-1">Overall Rating out of 5.0</p>
        <div className="flex justify-center gap-1 mt-3">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} className={`w-6 h-6 ${s <= Math.round(rating.overall || 0) ? 'text-amber-400 fill-amber-400' : 'text-secondary-200'}`} />
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="section-title mb-6">Rating Breakdown</h3>
        <div className="space-y-4">
          {[
            { label: 'Delivery Speed', value: rating.delivery },
            { label: 'Product Quality', value: rating.quality },
            { label: 'Communication', value: rating.communication },
            { label: 'Support', value: rating.support },
          ].map(({ label, value }) => (
            <StarBar key={label} label={label} value={value || 0} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: ShoppingCart, label: 'Total Orders', value: profile?.totalOrders || 0, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
          { icon: CheckCircle, label: 'Completed', value: profile?.completedOrders || 0, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
          { icon: Clock, label: 'Pending', value: profile?.pendingOrders || 0, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
          { icon: TrendingUp, label: 'Completion %', value: `${profile?.completionRate || 0}%`, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
        ].map((m) => (
          <div key={m.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${m.color}`}>
              <m.icon className="w-5 h-5" />
            </div>
            <p className="text-xl font-bold text-secondary-900 dark:text-white">{m.value}</p>
            <p className="text-xs text-secondary-400 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorPerformance;
