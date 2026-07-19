import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const OrdersChart = ({ data = [] }) => {
  const chartData = data.map((d) => ({
    month: MONTHS[(d._id?.month || 1) - 1],
    total: d.totalOrders || 0,
    completed: d.completedOrders || 0,
    pending: d.pendingOrders || 0,
  }));

  return (
    <div className="card p-6">
      <div className="mb-4">
        <h3 className="section-title">Monthly Orders</h3>
        <p className="text-sm text-secondary-400 mt-0.5">Total orders per month</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barSize={28} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:opacity-20" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
            cursor={{ fill: 'rgba(37,99,235,0.04)' }}
          />
          <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pending" name="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OrdersChart;
