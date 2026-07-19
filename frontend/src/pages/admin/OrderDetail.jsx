import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Check, X, Truck, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import orderService from '../../services/orderService';
import useAuth from '../../hooks/useAuth';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';

const STATUS_ICONS = {
  pending: Clock, approved: Check, accepted: Check,
  rejected: X, processing: Package, dispatched: Truck, delivered: Check, completed: Check,
};

const ADMIN_STATUSES = ['approved', 'completed', 'cancelled'];
const VENDOR_ACTIONS = {
  pending: [],
  approved: ['accepted', 'rejected'],
  accepted: ['processing'],
  processing: ['packed'],
  packed: ['dispatched'],
  dispatched: ['delivered']
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isVendor, isAdmin } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');

  const loadOrder = async () => {
    try {
      const res = await orderService.getOrder(id);
      // axios interceptor already unwraps response.data → res = { success, data, message }
      setOrder(res.data || res);
    } catch { toast.error('Failed to load order'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadOrder(); }, [id]);

  const updateStatus = async () => {
    try {
      const res = await orderService.updateOrderStatus(id, { status: newStatus, note });
      const updated = res.data || res;
      // Update local state immediately — no need to re-fetch
      setOrder(prev => ({
        ...prev,
        status: updated.status,
        statusTimeline: updated.statusTimeline,
        actualDeliveryDate: updated.actualDeliveryDate,
      }));
      toast.success('Order status updated');
      setStatusModal(false);
      setNote('');
    } catch { toast.error('Update failed'); }
  };

  if (loading) return <Spinner size="lg" text="Loading order..." />;
  if (!order) return <div className="text-center py-16 text-secondary-400">Order not found</div>;

  const allowedStatuses = isVendor ? (VENDOR_ACTIONS[order.status] || []) : ADMIN_STATUSES;
  const canUpdateStatus = allowedStatuses.length > 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(isVendor ? '/vendor/orders' : '/admin/orders')}
          className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-secondary-600" />
        </button>
        <div className="flex-1">
          <h1 className="page-title">{order.orderNumber}</h1>
          <p className="text-secondary-500 text-sm">Created {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
        </div>
        <Badge status={order.status} dot />
        {canUpdateStatus && (
          <Button onClick={() => { setNewStatus(allowedStatuses[0] || order.status); setStatusModal(true); }}>
            Update Status
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          <div className="card p-6">
            <h3 className="section-title mb-4">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-secondary-100 dark:border-secondary-700">
                  {['Product', 'SKU', 'Qty', 'Unit Price', 'Tax', 'Total'].map(h => <th key={h} className="pb-2 text-xs font-semibold text-secondary-500 text-left pr-4">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-secondary-50 dark:divide-secondary-700">
                  {order.items?.map((item, i) => (
                    <tr key={i}>
                      <td className="py-3 pr-4 text-sm font-medium text-secondary-900 dark:text-white">{item.productName}</td>
                      <td className="py-3 pr-4 text-xs text-secondary-400 font-mono">{item.sku}</td>
                      <td className="py-3 pr-4 text-sm">{item.quantity}</td>
                      <td className="py-3 pr-4 text-sm">₹{item.unitPrice?.toLocaleString('en-IN')}</td>
                      <td className="py-3 pr-4 text-sm text-secondary-500">{item.taxRate}%</td>
                      <td className="py-3 text-sm font-semibold">₹{item.totalPrice?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Totals */}
            <div className="mt-4 border-t border-secondary-100 dark:border-secondary-700 pt-4 space-y-2 max-w-xs ml-auto">
              {[['Subtotal', `₹${order.subtotal?.toLocaleString('en-IN')}`], ['Tax', `₹${order.taxAmount?.toLocaleString('en-IN')}`], ['Discount', `-₹${order.discount || 0}`], ['Shipping', `₹${order.shippingCost || 0}`]].map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm"><span className="text-secondary-500">{l}</span><span>{v}</span></div>
              ))}
              <div className="flex justify-between text-base font-bold border-t border-secondary-100 dark:border-secondary-700 pt-2">
                <span>Grand Total</span><span className="text-primary-600">₹{order.grandTotal?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="card p-6">
            <h3 className="section-title mb-4">Order Timeline</h3>
            <div className="space-y-4">
              {order.statusTimeline?.map((entry, i) => {
                const Icon = STATUS_ICONS[entry.status] || Clock;
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-primary-600" />
                      </div>
                      {i < order.statusTimeline.length - 1 && <div className="w-0.5 h-6 bg-secondary-200 dark:bg-secondary-600 mt-1" />}
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-2">
                        <Badge status={entry.status} />
                        <span className="text-xs text-secondary-400">{new Date(entry.timestamp).toLocaleString('en-IN')}</span>
                      </div>
                      {entry.updatedByName && <p className="text-xs text-secondary-500 mt-0.5">By {entry.updatedByName}</p>}
                      {entry.note && <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-1">{entry.note}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h4 className="font-semibold text-secondary-800 dark:text-secondary-100 mb-3">Vendor</h4>
            <p className="font-medium text-secondary-900 dark:text-white">{order.vendor?.companyName}</p>
            <p className="text-sm text-secondary-500">{order.vendor?.email}</p>
            <p className="text-sm text-secondary-500">{order.vendor?.phone}</p>
          </div>

          <div className="card p-5 space-y-2">
            <h4 className="font-semibold text-secondary-800 dark:text-secondary-100 mb-3">Order Details</h4>
            {[
              ['Payment Terms', order.paymentTerms?.toUpperCase()],
              ['Expected Delivery', order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString('en-IN') : '—'],
              ['Actual Delivery', order.actualDeliveryDate ? new Date(order.actualDeliveryDate).toLocaleDateString('en-IN') : 'Pending'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm">
                <span className="text-secondary-500">{l}</span>
                <span className="font-medium text-secondary-800 dark:text-secondary-200">{v}</span>
              </div>
            ))}
          </div>

          {order.invoiceUrl && (
            <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer" className="card p-4 flex items-center gap-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors block">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-600" />
              </div>
              <div><p className="text-sm font-medium text-primary-600">View Invoice</p><p className="text-xs text-secondary-400">Uploaded by vendor</p></div>
            </a>
          )}
        </div>
      </div>

      <Modal isOpen={statusModal} onClose={() => setStatusModal(false)} title="Update Order Status" size="sm"
        footer={<><Button variant="secondary" onClick={() => setStatusModal(false)}>Cancel</Button><Button onClick={updateStatus}>Update</Button></>}
      >
        <div className="space-y-4">
          <Select label="New Status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
            options={allowedStatuses.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
          <Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note..." />
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetail;
