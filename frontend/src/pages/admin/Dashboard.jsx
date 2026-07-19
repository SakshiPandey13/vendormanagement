import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Users, ShoppingCart, Package, CreditCard, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import reportService from '../../services/reportService';
import StatCard from '../../components/ui/StatCard';
import RevenueChart from '../../components/charts/RevenueChart';
import OrdersChart from '../../components/charts/OrdersChart';
import PaymentChart from '../../components/charts/PaymentChart';
import VendorPerformanceChart from '../../components/charts/VendorPerformanceChart';
import { SkeletonDashboard } from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, monthlyRes, paymentRes, vendorRes] = await Promise.all([
          reportService.getDashboardStats(),
          reportService.getMonthlyReport(12),
          reportService.getPaymentReport(),
          reportService.getVendorPerformanceReport(),
        ]);
        setStats(statsRes.data);
        setMonthlyData(monthlyRes.data || []);
        setPaymentData(paymentRes.data || []);
        setVendorData(vendorRes.data || []);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <SkeletonDashboard />;

  const statCards = [
    { title: 'Total Vendors', value: stats?.totalVendors || 0, icon: Users, color: 'blue', trend: 'up', trendValue: '+12%' },
    { title: 'Active Vendors', value: stats?.activeVendors || 0, icon: CheckCircle, color: 'green', trend: 'up', trendValue: '+5%' },
    { title: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'purple', trend: 'up', trendValue: '+18%' },
    { title: 'Pending Orders', value: stats?.pendingOrders || 0, icon: Clock, color: 'amber', trend: 'down', trendValue: '-3%' },
    { title: 'Products', value: stats?.totalProducts || 0, icon: Package, color: 'cyan', trend: 'up', trendValue: '+7%' },
    { title: 'Low Stock', value: stats?.lowStockProducts || 0, icon: AlertTriangle, color: 'red' },
    { title: 'Total Revenue', value: stats?.totalRevenue || 0, icon: TrendingUp, color: 'green', prefix: '₹', trend: 'up', trendValue: '+22%' },
    { title: 'Pending Payments', value: stats?.pendingPayments || 0, icon: CreditCard, color: 'amber', prefix: '₹' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-secondary-500 dark:text-secondary-400 text-sm mt-0.5">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-secondary-500 bg-white dark:bg-secondary-800 px-3 py-2 rounded-xl border border-secondary-100 dark:border-secondary-700">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Live data
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <StatCard key={card.title} {...card} index={i} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart data={monthlyData} />
        </div>
        <PaymentChart data={paymentData} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OrdersChart data={monthlyData} />
        <VendorPerformanceChart vendors={vendorData} />
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-6 lg:col-span-2">
          <h3 className="section-title mb-4">System Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Completed Orders', value: stats?.completedOrders || 0, color: 'green' },
              { label: 'Active Vendors', value: stats?.activeVendors || 0, color: 'blue' },
              { label: 'Inactive Vendors', value: stats?.inactiveVendors || 0, color: 'amber' },
            ].map((item) => (
              <div key={item.label} className="bg-secondary-50 dark:bg-secondary-700/50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">{item.value.toLocaleString('en-IN')}</p>
                <p className="text-xs text-secondary-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="section-title mb-4">Order Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Pending', value: stats?.pendingOrders || 0, status: 'pending' },
              { label: 'Completed', value: stats?.completedOrders || 0, status: 'completed' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <Badge status={item.status} dot />
                <span className="font-semibold text-secondary-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
