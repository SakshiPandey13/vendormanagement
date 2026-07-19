import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Download, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { fetchPayments, createPayment, updatePaymentStatus, selectPayments, selectPaymentLoading, selectPaymentPagination } from '../../store/slices/paymentSlice';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import useDebounce from '../../hooks/useDebounce';
import usePagination from '../../hooks/usePagination';
import paymentService from '../../services/paymentService';
import orderService from '../../services/orderService';

const PAYMENT_METHODS = ['upi', 'card', 'bank_transfer', 'cash'];

const Payments = () => {
  const dispatch = useDispatch();
  const payments = useSelector(selectPayments);
  const loading = useSelector(selectPaymentLoading);
  const pagination = useSelector(selectPaymentPagination);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const { page, setPage } = usePagination();
  const debouncedSearch = useDebounce(search);

  // Order lookup state for create payment form
  const [orderSearch, setOrderSearch] = useState('');
  const [orderSearching, setOrderSearching] = useState(false);
  const [foundOrder, setFoundOrder] = useState(null);
  const [orderError, setOrderError] = useState('');

  const { register, handleSubmit, reset, setValue, watch } = useForm();

  // ── Fetch payments whenever page / filter / search changes ──
  useEffect(() => {
    dispatch(fetchPayments({ page, limit: 10, status: statusFilter, search: debouncedSearch }));
  }, [page, statusFilter, debouncedSearch]);

  // ── Search order by order number ──────────────────────────
  const handleOrderSearch = async () => {
    if (!orderSearch.trim()) return;
    setOrderSearching(true);
    setOrderError('');
    setFoundOrder(null);
    try {
      const res = await orderService.getOrders({ search: orderSearch.trim(), limit: 1 });
      const orders = res.data || [];
      if (orders.length === 0) {
        setOrderError('No order found with that order number.');
      } else {
        const o = orders[0];
        setFoundOrder(o);
        setValue('order', o._id);
        setValue('amount', o.grandTotal);
      }
    } catch {
      setOrderError('Failed to search order. Please try again.');
    } finally {
      setOrderSearching(false);
    }
  };

  // ── Download Invoice PDF ──────────────────────────────────
  const downloadPDF = async (id, paymentNumber) => {
    try {
      const res = await paymentService.downloadInvoicePDF(id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${paymentNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  // ── Create Payment ────────────────────────────────────────
  const onCreatePayment = async (data) => {
    if (!foundOrder) {
      toast.error('Please search and select a valid order first.');
      return;
    }
    const result = await dispatch(createPayment({ ...data, amount: Number(data.amount) }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Payment created!');
      setCreateModal(false);
      reset();
      setOrderSearch('');
      setFoundOrder(null);
      setOrderError('');
    } else {
      toast.error(result.payload || 'Failed to create payment');
    }
  };

  // ── Update Payment Status ─────────────────────────────────
  const onUpdateStatus = async () => {
    if (!newStatus) { toast.error('Please select a status'); return; }
    const result = await dispatch(updatePaymentStatus({ id: statusModal._id, status: newStatus }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Payment status updated!');
      setStatusModal(null);
    } else {
      toast.error('Failed to update status');
    }
  };

  const columns = [
    { key: 'paymentNumber', label: 'Payment #', render: (v) => <span className="font-mono text-sm text-primary-600 font-medium">{v}</span> },
    { key: 'vendor',        label: 'Vendor',    render: (v) => <span className="text-sm">{v?.companyName || '—'}</span> },
    { key: 'order',         label: 'Order',     render: (v) => <span className="text-xs font-mono text-secondary-500">{v?.orderNumber || '—'}</span> },
    { key: 'amount',        label: 'Amount',    render: (v) => <span className="font-semibold">₹{(v || 0).toLocaleString('en-IN')}</span> },
    { key: 'paymentMethod', label: 'Method',    render: (v) => <span className="text-sm capitalize">{v?.replace(/_/g, ' ')}</span> },
    { key: 'status',        label: 'Status',    render: (v) => <Badge status={v} dot /> },
    { key: 'paymentDate',   label: 'Date',      render: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '—' },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setStatusModal(row); setNewStatus(row.status); }}
            className="p-1.5 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-400 hover:text-primary-600 transition-colors text-xs font-medium px-2"
          >
            Status
          </button>
          <button
            onClick={() => downloadPDF(row._id, row.paymentNumber)}
            className="p-1.5 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-400 hover:text-primary-600 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="text-secondary-500 text-sm mt-0.5">{pagination?.total || 0} payment records</p>
        </div>
        <Button icon={Plus} onClick={() => { reset(); setOrderSearch(''); setFoundOrder(null); setOrderError(''); setCreateModal(true); }}>
          Create Payment
        </Button>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search payments..." className="flex-1" />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'All Status' },
            { value: 'pending',  label: 'Pending'  },
            { value: 'paid',     label: 'Paid'     },
            { value: 'failed',   label: 'Failed'   },
            { value: 'refunded', label: 'Refunded' },
          ]}
          className="sm:w-40"
        />
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={payments} loading={loading} emptyMessage="No payments found" />
        <div className="p-4 border-t border-secondary-100 dark:border-secondary-700">
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>

      {/* ── Create Payment Modal ── */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Create Payment"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button onClick={handleSubmit(onCreatePayment)}>Create</Button>
          </>
        }
      >
        <form className="space-y-4">
          {/* Order Number Search */}
          <div>
            <label className="label mb-1 block">Search Order by Number *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => { setOrderSearch(e.target.value); setFoundOrder(null); setOrderError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleOrderSearch())}
                placeholder="e.g. PO-2026-0001"
                className="input flex-1"
              />
              <Button
                type="button"
                variant="outline"
                icon={Search}
                loading={orderSearching}
                onClick={handleOrderSearch}
              >
                Search
              </Button>
            </div>
            {orderError && <p className="text-red-500 text-xs mt-1">{orderError}</p>}
            {foundOrder && (
              <div className="mt-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">{foundOrder.orderNumber}</p>
                <p className="text-xs text-green-600 dark:text-green-500">
                  Vendor: {foundOrder.vendor?.companyName || '—'} &nbsp;|&nbsp; Total: ₹{(foundOrder.grandTotal || 0).toLocaleString('en-IN')}
                </p>
                {/* Hidden input stores the resolved _id */}
                <input type="hidden" {...register('order', { required: true })} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Amount (₹)"
              type="number"
              required
              {...register('amount', { required: 'Required', valueAsNumber: true, min: 0 })}
            />
            <Select
              label="Payment Method"
              options={PAYMENT_METHODS.map(m => ({ value: m, label: m.replace(/_/g, ' ').toUpperCase() }))}
              {...register('paymentMethod', { required: 'Required' })}
            />
            <Input label="Transaction ID" {...register('transactionId')} />
            <Input label="Due Date" type="date" {...register('dueDate')} />
            <Input label="Notes" {...register('notes')} containerClassName="sm:col-span-2" />
          </div>
        </form>
      </Modal>

      {/* ── Update Status Modal ── */}
      <Modal
        isOpen={!!statusModal}
        onClose={() => setStatusModal(null)}
        title="Update Payment Status"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setStatusModal(null)}>Cancel</Button>
            <Button onClick={onUpdateStatus}>Update</Button>
          </>
        }
      >
        <div className="space-y-3">
          {statusModal && (
            <div className="p-3 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm">
              <p className="text-secondary-500">Payment: <span className="font-mono font-medium text-primary-600">{statusModal.paymentNumber}</span></p>
              <p className="text-secondary-500">Current: <Badge status={statusModal.status} /></p>
            </div>
          )}
          <Select
            label="New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={['pending', 'paid', 'failed', 'refunded'].map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Payments;
