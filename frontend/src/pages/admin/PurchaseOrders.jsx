import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Eye, Filter, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import {
  fetchOrders, createOrder, selectOrders, selectOrderLoading, selectOrderPagination,
} from '../../store/slices/orderSlice';
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
import vendorService from '../../services/vendorService';
import productService from '../../services/productService';

const ORDER_STATUSES = ['pending', 'approved', 'accepted', 'rejected', 'processing', 'packed', 'dispatched', 'delivered', 'completed', 'cancelled'];
const PAYMENT_TERMS = ['immediate', 'net15', 'net30', 'net45', 'net60', 'cod'];

const PurchaseOrders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrderLoading);
  const pagination = useSelector(selectOrderPagination);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const { page, setPage } = usePagination();
  const debouncedSearch = useDebounce(search);

  const { register, handleSubmit, control, watch, reset, setValue, formState: { errors } } = useForm({
    defaultValues: { vendor: '', paymentTerms: 'net30', discount: 0, discountType: 'fixed', shippingCost: 0, items: [{ product: '', quantity: 1, unitPrice: '' }] }
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  // Watch item product selections so we can auto-fill unit price
  const watchedItems = useWatch({ control, name: 'items' });
  useEffect(() => {
    if (!watchedItems || products.length === 0) return;
    watchedItems.forEach((item, idx) => {
      if (item.product) {
        const found = products.find(p => p._id === item.product);
        // Only auto-fill if unitPrice is blank/zero (user hasn't typed a custom price)
        if (found && (!item.unitPrice || item.unitPrice === 0)) {
          setValue(`items.${idx}.unitPrice`, found.price, { shouldValidate: false });
        }
      }
    });
  }, [watchedItems, products]);

  useEffect(() => {
    dispatch(fetchOrders({ page, limit: 10, search: debouncedSearch, status: statusFilter }));
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    vendorService.getVendors({ limit: 100 }).then(r => setVendors(r.data || []));
    productService.getProducts({ limit: 100 }).then(r => setProducts(r.data || []));
  }, []);

  const onSubmit = async (data) => {
    const result = await dispatch(createOrder(data));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Purchase order created!');
      setModalOpen(false);
      reset();
    } else {
      toast.error(result.payload || 'Failed to create order');
    }
  };

  const columns = [
    { key: 'orderNumber', label: 'Order #', sortable: true, render: (v) => <span className="font-mono font-medium text-primary-600 text-sm">{v}</span> },
    { key: 'vendor', label: 'Vendor', render: (v) => <span className="text-sm">{v?.companyName || '—'}</span> },
    { key: 'grandTotal', label: 'Total', sortable: true, render: (v) => <span className="font-semibold">₹{(v || 0).toLocaleString('en-IN')}</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v} dot /> },
    { key: 'expectedDeliveryDate', label: 'Expected', render: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '—' },
    { key: 'createdAt', label: 'Created', render: (v) => new Date(v).toLocaleDateString('en-IN') },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <button onClick={() => navigate(`/admin/orders/${row._id}`)} className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-secondary-400 hover:text-primary-600 transition-colors">
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Purchase Orders</h1>
          <p className="text-secondary-500 text-sm mt-0.5">{pagination?.total || 0} total orders</p>
        </div>
        <Button icon={Plus} onClick={() => { reset(); setModalOpen(true); }}>Create Order</Button>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by order number..." className="flex-1" />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          options={[{ value: '', label: 'All Statuses' }, ...ORDER_STATUSES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))]}
          className="sm:w-44" />
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={orders} loading={loading} emptyMessage="No purchase orders found"
          onRowClick={(row) => navigate(`/admin/orders/${row._id}`)} />
        <div className="p-4 border-t border-secondary-100 dark:border-secondary-700">
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>

      {/* Create Order Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Purchase Order" size="xl"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={handleSubmit(onSubmit)}>Create Order</Button></>}
      >
        <form className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Vendor *" options={vendors.map(v => ({ value: v._id, label: v.companyName }))} placeholder="Select vendor" {...register('vendor', { required: 'Required' })} />
            <Input label="Expected Delivery Date *" type="date" {...register('expectedDeliveryDate', { required: 'Required' })} />
            <Select label="Payment Terms" options={PAYMENT_TERMS.map(t => ({ value: t, label: t.toUpperCase() }))} {...register('paymentTerms')} />
            <Input label="Shipping Cost (₹)" type="number" {...register('shippingCost', { valueAsNumber: true, min: 0 })} />
            <Input label="Discount" type="number" {...register('discount', { valueAsNumber: true, min: 0 })} />
            <Select label="Discount Type" options={[{ value: 'fixed', label: 'Fixed (₹)' }, { value: 'percentage', label: 'Percentage (%)' }]} {...register('discountType')} />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label">Order Items *</label>
              <button type="button" onClick={() => append({ product: '', quantity: 1, unitPrice: 0 })} className="text-sm text-primary-600 hover:text-primary-700 font-medium">+ Add Item</button>
            </div>
            <div className="space-y-3">
              {fields.map((field, idx) => {
                // Destructure register's onChange so we can chain it with auto-fill
                const { onChange: productOnChange, ...productRegister } = register(`items.${idx}.product`, { required: true });
                return (
                  <div key={field.id} className="grid grid-cols-4 gap-3 items-end">
                    <Select
                      options={products.map(p => ({ value: p._id, label: `${p.name} — ₹${p.price?.toLocaleString('en-IN')} (${p.sku})` }))}
                      placeholder="Select product"
                      containerClassName="col-span-2"
                      {...productRegister}
                      onChange={(e) => {
                        productOnChange(e); // ← call react-hook-form's own onChange first
                        const selected = products.find(p => p._id === e.target.value);
                        if (selected?.price !== undefined) {
                          setValue(`items.${idx}.unitPrice`, selected.price, { shouldValidate: false });
                        }
                      }}
                    />
                    <Input type="number" placeholder="Qty" {...register(`items.${idx}.quantity`, { required: true, valueAsNumber: true, min: 1 })} />
                    <div className="flex gap-2 items-center">
                      <Input type="number" placeholder="Unit Price" {...register(`items.${idx}.unitPrice`, { valueAsNumber: true, min: 0 })} />
                      {fields.length > 1 && <button type="button" onClick={() => remove(idx)} className="text-red-400 hover:text-red-600 text-xs whitespace-nowrap">✕</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Shipping Address" {...register('shippingAddress.address')} />
            <Input label="City" {...register('shippingAddress.city')} />
            <Input label="Notes" {...register('notes')} containerClassName="sm:col-span-2" />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PurchaseOrders;
