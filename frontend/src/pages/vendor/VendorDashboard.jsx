import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, CreditCard, Clock, CheckCircle, TrendingUp, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import reportService from '../../services/reportService';
import orderService from '../../services/orderService';
import paymentService from '../../services/paymentService';
import vendorService from '../../services/vendorService';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import { SkeletonDashboard } from '../../components/ui/Skeleton';
import useAuth from '../../hooks/useAuth';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [oRes, pRes, vRes] = await Promise.all([
          orderService.getMyOrders({ limit: 5 }),
          paymentService.getMyPayments({ limit: 5 }),
          vendorService.getMyProfile(),
        ]);
        setOrders(oRes.data || []);
        setPayments(pRes.data || []);
        setProfile(vRes.data);
      } catch { toast.error('Failed to load dashboard'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <SkeletonDashboard />;

  const pendingOrders = orders.filter(o => ['pending', 'approved'].includes(o.status)).length;
  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);

  const statCards = [
    { title: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'blue' },
    { title: 'Pending Orders', value: pendingOrders, icon: Clock, color: 'amber' },
    { title: 'Total Payments', value: payments.length, icon: CreditCard, color: 'green' },
    { title: 'Total Earned', value: totalRevenue, icon: TrendingUp, color: 'purple', prefix: '₹' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="card p-6 bg-gradient-to-r from-primary-600 to-primary-700 border-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-primary-200 text-sm mt-1">{profile?.companyName} • {profile?.category}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
            <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
            <span className="text-white font-semibold">{profile?.rating?.overall?.toFixed(1) || '0.0'}</span>
            <span className="text-primary-200 text-sm">rating</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => <StatCard key={card.title} {...card} index={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Orders */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Recent Orders</h3>
          {orders.length === 0 ? (
            <p className="text-center text-secondary-400 py-8 text-sm">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-secondary-900 dark:text-white font-mono">{order.orderNumber}</p>
                    <p className="text-xs text-secondary-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-secondary-900 dark:text-white">₹{order.grandTotal?.toLocaleString('en-IN')}</p>
                    <Badge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Recent Payments</h3>
          {payments.length === 0 ? (
            <p className="text-center text-secondary-400 py-8 text-sm">No payments yet</p>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment._id} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-secondary-900 dark:text-white font-mono">{payment.paymentNumber}</p>
                    <p className="text-xs text-secondary-400 capitalize">{payment.paymentMethod?.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-secondary-900 dark:text-white">₹{payment.amount?.toLocaleString('en-IN')}</p>
                    <Badge status={payment.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Completion */}
      {profile && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-title">Profile Completeness</h3>
            <span className="text-sm font-semibold text-primary-600">{profile.profileCompleteness || 60}%</span>
          </div>
          <div className="w-full bg-secondary-100 dark:bg-secondary-700 rounded-full h-2">
            <motion.div initial={{ width: 0 }} animate={{ width: `${profile.profileCompleteness || 60}%` }}
              transition={{ duration: 1, ease: 'easeOut' }} className="bg-primary-600 h-2 rounded-full" />
          </div>
          <p className="text-xs text-secondary-400 mt-2">Complete your profile to improve visibility and trust</p>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
