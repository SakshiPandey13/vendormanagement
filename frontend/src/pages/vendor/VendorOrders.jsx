import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders, selectOrders, selectOrderLoading, selectOrderPagination } from '../../store/slices/orderSlice';
import { updateOrderStatus } from '../../store/slices/orderSlice';
import { motion } from 'framer-motion';
import { Eye, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import FileUpload from '../../components/common/FileUpload';
import useDebounce from '../../hooks/useDebounce';
import usePagination from '../../hooks/usePagination';
import orderService from '../../services/orderService';

const VENDOR_ACTIONS = { pending: [], approved: ['accepted', 'rejected'], accepted: ['processing'], processing: ['packed'], packed: ['dispatched'], dispatched: ['delivered'] };

const VendorOrders = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrderLoading);
  const pagination = useSelector(selectOrderPagination);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [invoiceModal, setInvoiceModal] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const { page, setPage } = usePagination();
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    dispatch(fetchMyOrders({ page, limit: 10, search: debouncedSearch, status: statusFilter }));
  }, [page, debouncedSearch, statusFilter]);

  const handleStatusUpdate = async () => {
    const result = await dispatch(updateOrderStatus({ id: statusModal._id, status: newStatus, note }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Order updated!'); setStatusModal(null); setNote('');
    } else { toast.error(result.payload || 'Failed'); }
  };

  const handleUploadInvoice = async () => {
    if (!invoiceFile) return toast.error('Select a file');
    const fd = new FormData(); fd.append('invoice', invoiceFile);
    try {
      await orderService.uploadInvoice(invoiceModal._id, fd);
      toast.success('Invoice uploaded!'); setInvoiceModal(null); setInvoiceFile(null);
    } catch { toast.error('Upload failed'); }
  };

  const columns = [
    { key: 'orderNumber', label: 'Order #', render: (v) => <span className="font-mono text-sm text-primary-600 font-medium">{v}</span> },
    { key: 'grandTotal', label: 'Total', render: (v) => <span className="font-semibold">₹{(v || 0).toLocaleString('en-IN')}</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v} dot /> },
    { key: 'paymentTerms', label: 'Terms', render: (v) => <span className="text-sm uppercase">{v}</span> },
    { key: 'expectedDeliveryDate', label: 'Expected', render: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '—' },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => {
        const nextActions = VENDOR_ACTIONS[row.status] || [];
        return (
          <div className="flex items-center gap-1">
            {nextActions.length > 0 && (
              <button onClick={() => { setStatusModal(row); setNewStatus(nextActions[0]); }}
                className="text-xs font-medium px-2 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 hover:bg-primary-100 transition-colors">
                Update
              </button>
            )}
            <button onClick={() => setInvoiceModal(row)} className="p-1.5 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-400 hover:text-primary-600 transition-colors" title="Upload Invoice">
              <Upload className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">My Orders</h1>
        <p className="text-secondary-500 text-sm mt-0.5">{pagination?.total || 0} orders received</p>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search orders..." className="flex-1" />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          options={[{ value: '', label: 'All Statuses' }, 'pending', 'approved', 'accepted', 'rejected', 'processing', 'packed', 'dispatched', 'delivered'].map(s => typeof s === 'string' ? { value: s, label: s.charAt(0).toUpperCase() + s.slice(1) } : s)}
          className="sm:w-44" />
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={orders} loading={loading} emptyMessage="No orders assigned yet" />
        <div className="p-4 border-t border-secondary-100 dark:border-secondary-700">
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>

      <Modal isOpen={!!statusModal} onClose={() => setStatusModal(null)} title="Update Order Status" size="sm"
        footer={<><Button variant="secondary" onClick={() => setStatusModal(null)}>Cancel</Button><Button onClick={handleStatusUpdate}>Update</Button></>}
      >
        <div className="space-y-4">
          <Select label="New Status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
            options={(VENDOR_ACTIONS[statusModal?.status] || []).map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
          <Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note..." />
        </div>
      </Modal>

      <Modal isOpen={!!invoiceModal} onClose={() => setInvoiceModal(null)} title="Upload Invoice" size="sm"
        footer={<><Button variant="secondary" onClick={() => setInvoiceModal(null)}>Cancel</Button><Button onClick={handleUploadInvoice}>Upload</Button></>}
      >
        <FileUpload accept=".pdf,.jpg,.jpeg,.png" maxSize={5} onFileSelect={setInvoiceFile} label="Invoice Document" hint="PDF or image, max 5MB" />
      </Modal>
    </div>
  );
};

export default VendorOrders;
