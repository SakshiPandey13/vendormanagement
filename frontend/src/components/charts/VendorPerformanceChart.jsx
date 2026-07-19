import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Star } from 'lucide-react';

const VendorPerformanceChart = ({ vendors = [] }) => {
  const top = vendors.slice(0, 5);

  return (
    <div className="card p-6">
      <div className="mb-4">
        <h3 className="section-title">Top Vendor Performance</h3>
        <p className="text-sm text-secondary-400 mt-0.5">Ratings overview</p>
      </div>
      <div className="space-y-3">
        {top.map((vendor, i) => (
          <div key={vendor._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-sm font-bold">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-900 dark:text-white truncate">{vendor.companyName}</p>
              <p className="text-xs text-secondary-400">{vendor.category}</p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-semibold text-secondary-900 dark:text-white">{vendor.rating?.overall?.toFixed(1) || '0.0'}</span>
            </div>
            <div className="text-xs text-secondary-400">{vendor.totalOrders || 0} orders</div>
          </div>
        ))}
        {top.length === 0 && (
          <p className="text-center text-secondary-400 py-8 text-sm">No vendor data available</p>
        )}
      </div>
    </div>
  );
};

export default VendorPerformanceChart;
