import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchMyPayments, selectPayments, selectPaymentLoading, selectPaymentPagination } from '../../store/slices/paymentSlice';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/ui/Badge';
import usePagination from '../../hooks/usePagination';
import paymentService from '../../services/paymentService';

const VendorPayments = () => {
  const dispatch = useDispatch();
  const payments = useSelector(selectPayments);
  const loading = useSelector(selectPaymentLoading);
  const pagination = useSelector(selectPaymentPagination);
  const { page, setPage } = usePagination();

  useEffect(() => { dispatch(fetchMyPayments({ page, limit: 10 })); }, [page]);

  const downloadPDF = async (id, num) => {
    try {
      const res = await paymentService.downloadInvoicePDF(id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `Payment-${num}.pdf`; a.click();
    } catch { toast.error('Download failed'); }
  };

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0);

  const columns = [
    { key: 'paymentNumber', label: 'Payment #', render: (v) => <span className="font-mono text-sm text-primary-600 font-medium">{v}</span> },
    { key: 'order', label: 'Order', render: (v) => <span className="text-xs font-mono text-secondary-500">{v?.orderNumber || '—'}</span> },
    { key: 'amount', label: 'Amount', render: (v) => <span className="font-semibold">₹{(v || 0).toLocaleString('en-IN')}</span> },
    { key: 'paymentMethod', label: 'Method', render: (v) => <span className="text-sm capitalize">{v?.replace(/_/g, ' ')}</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v} dot /> },
    { key: 'paymentDate', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '—' },
    {
      key: 'actions', label: 'Invoice',
      render: (_, row) => (
        <button onClick={() => downloadPDF(row._id, row.paymentNumber)} className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-secondary-400 hover:text-primary-600 transition-colors">
          <Download className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <h1 className="page-title">Payments</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Received', value: totalPaid, color: 'text-green-600' },
          { label: 'Pending', value: totalPending, color: 'text-amber-600' },
          { label: 'Total Payments', value: pagination?.total || 0, isCount: true },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-sm text-secondary-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color || 'text-secondary-900 dark:text-white'}`}>
              {s.isCount ? s.value : `₹${s.value.toLocaleString('en-IN')}`}
            </p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={payments} loading={loading} emptyMessage="No payment records" />
        <div className="p-4 border-t border-secondary-100 dark:border-secondary-700">
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
};

export default VendorPayments;
