import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const PaymentChart = ({ data = [] }) => {
  // Aggregate by method
  const methodMap = {};
  data.forEach((d) => {
    const method = d._id?.method || 'other';
    if (!methodMap[method]) methodMap[method] = 0;
    methodMap[method] += d.totalAmount || 0;
  });

  const chartData = Object.entries(methodMap).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: Math.round(value),
  }));

  return (
    <div className="card p-6">
      <div className="mb-4">
        <h3 className="section-title">Payment Methods</h3>
        <p className="text-sm text-secondary-400 mt-0.5">Distribution by payment method</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Amount']} contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentChart;
