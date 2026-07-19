import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, TrendingUp, Package, CreditCard, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import reportService from '../../services/reportService';
import Button from '../../components/ui/Button';

const reportTypes = [
  {
    id: 'vendor', title: 'Vendor Report', icon: Users, description: 'Complete vendor performance and status report',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    action: async () => {
      const res = await reportService.downloadVendorReportPDF();
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Vendor-Report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    format: 'PDF',
  },
  {
    id: 'orders', title: 'Orders Report', icon: TrendingUp, description: 'All purchase orders with financial summaries',
    color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    action: async () => {
      const res = await reportService.downloadOrdersExcel();
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Orders-Report.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    format: 'Excel',
  },
  {
    id: 'inventory', title: 'Inventory Report', icon: Package, description: 'Stock levels and product catalog overview',
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    action: async () => { const res = await reportService.getInventoryReport(); console.log(res); toast.success('Inventory data loaded'); },
    format: 'View',
  },
  {
    id: 'payments', title: 'Payment Analytics', icon: CreditCard, description: 'Payment methods distribution and status summary',
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    action: async () => { const res = await reportService.getPaymentReport(); console.log(res); toast.success('Payment data loaded'); },
    format: 'View',
  },
];

const Reports = () => {
  const [loading, setLoading] = useState({});

  const handleAction = async (report) => {
    setLoading(prev => ({ ...prev, [report.id]: true }));
    try {
      await report.action();
      if (report.format !== 'View') toast.success(`${report.title} downloaded!`);
    } catch (err) {
      toast.error('Report generation failed');
    } finally {
      setLoading(prev => ({ ...prev, [report.id]: false }));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Reports</h1>
        <p className="text-secondary-500 text-sm mt-0.5">Generate and download business reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTypes.map((report, i) => (
          <motion.div key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="card-hover p-6">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${report.color} flex-shrink-0`}>
                <report.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-secondary-900 dark:text-white">{report.title}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${report.format === 'PDF' ? 'bg-red-100 text-red-600' : report.format === 'Excel' ? 'bg-green-100 text-green-600' : 'bg-secondary-100 text-secondary-600'}`}>
                    {report.format}
                  </span>
                </div>
                <p className="text-sm text-secondary-500 mb-4">{report.description}</p>
                <Button
                  variant="outline" size="sm"
                  icon={report.format === 'View' ? FileText : Download}
                  loading={loading[report.id]}
                  onClick={() => handleAction(report)}
                >
                  {report.format === 'View' ? 'View Report' : `Download ${report.format}`}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Box */}
      <div className="card p-6 bg-gradient-to-r from-primary-600 to-primary-700">
        <h3 className="text-lg font-semibold text-white mb-1">Monthly Summary</h3>
        <p className="text-primary-200 text-sm mb-4">Download a comprehensive monthly business summary</p>
        <Button variant="ghost" className="!bg-white/20 !text-white hover:!bg-white/30 border border-white/20" icon={Download}>
          Download Monthly Summary
        </Button>
      </div>
    </div>
  );
};

export default Reports;
