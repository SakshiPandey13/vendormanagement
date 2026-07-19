import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-secondary-800 border border-secondary-100 dark:border-secondary-700 rounded-xl p-3 shadow-elevated">
      <p className="text-xs font-semibold text-secondary-600 dark:text-secondary-400 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-secondary-600 dark:text-secondary-300">{entry.name}:</span>
          <span className="font-semibold text-secondary-900 dark:text-white">
            {entry.dataKey === 'revenue' ? `₹${entry.value?.toLocaleString('en-IN')}` : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const RevenueChart = ({ data = [] }) => {
  const chartData = data.map((d) => ({
    month: MONTHS[(d._id?.month || 1) - 1],
    revenue: Math.round(d.revenue || 0),
    orders: d.totalOrders || 0,
  }));

  return (
    <div className="card p-6">
      <div className="mb-4">
        <h3 className="section-title">Revenue Overview</h3>
        <p className="text-sm text-secondary-400 mt-0.5">Monthly revenue and order trends</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:opacity-20" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
          <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
