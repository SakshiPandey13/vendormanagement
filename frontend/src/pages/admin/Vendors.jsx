import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Eye, Filter, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import {
  fetchVendors, createVendor, updateVendor, deleteVendor,
  selectVendors, selectVendorLoading, selectVendorPagination,
} from '../../store/slices/vendorSlice';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
import useDebounce from '../../hooks/useDebounce';
import usePagination from '../../hooks/usePagination';

const CATEGORIES = ['Electronics', 'Furniture', 'Clothing', 'Food & Beverages', 'Raw Materials', 'Machinery', 'Chemicals', 'Packaging', 'IT Services', 'Logistics', 'Other'];
const STATUSES = ['active', 'inactive', 'suspended', 'pending'];

const defaultValues = { companyName: '', ownerName: '', email: '', phone: '', category: '', address: '', city: '', state: '', pincode: '', country: 'India', status: 'active', gstNumber: '', panNumber: '' };

const Vendors = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const vendors = useSelector(selectVendors);
  const loading = useSelector(selectVendorLoading);
  const pagination = useSelector(selectVendorPagination);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editVendor, setEditVendor] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const { page, setPage } = usePagination();
  const debouncedSearch = useDebounce(search, 400);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });

  const loadVendors = () => {
    dispatch(fetchVendors({ page, limit: 10, search: debouncedSearch, status: statusFilter, category: categoryFilter }));
  };

  useEffect(() => { loadVendors(); }, [page, debouncedSearch, statusFilter, categoryFilter]);

  const openCreate = () => { setEditVendor(null); reset(defaultValues); setModalOpen(true); };
  const openEdit = (v) => { setEditVendor(v); reset(v); setModalOpen(true); };

  const onSubmit = async (data) => {
    const action = editVendor
      ? dispatch(updateVendor({ id: editVendor._id, data }))
      : dispatch(createVendor(data));
    const result = await action;
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(editVendor ? 'Vendor updated!' : 'Vendor created!');
      setModalOpen(false);
      loadVendors();
    } else {
      toast.error(result.payload || 'Operation failed');
    }
  };

  const onDelete = async () => {
    const result = await dispatch(deleteVendor(deleteModal._id));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Vendor deleted');
      setDeleteModal(null);
    } else {
      toast.error('Delete failed');
    }
  };

  const columns = [
    {
      key: 'companyName', label: 'Company', sortable: true,
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.profileImage} name={row.companyName} size="sm" />
          <div>
            <p className="font-medium text-secondary-900 dark:text-white text-sm">{row.companyName}</p>
            <p className="text-xs text-secondary-400">{row.ownerName}</p>
          </div>
        </div>
      ),
    },
    { key: 'email', label: 'Email', sortable: true, render: (v) => <span className="text-sm">{v}</span> },
    { key: 'category', label: 'Category', render: (v) => <span className="text-sm">{v}</span> },
    { key: 'phone', label: 'Phone', render: (v) => <span className="text-sm">{v}</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v} dot /> },
    {
      key: 'rating', label: 'Rating',
      render: (v) => <span className="text-sm font-medium">⭐ {v?.overall?.toFixed(1) || '0.0'}</span>,
    },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`/admin/vendors/${row._id}`)} className="p-1.5 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-400 hover:text-primary-600 transition-colors"><Eye className="w-4 h-4" /></button>
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-400 hover:text-amber-500 transition-colors"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDeleteModal(row)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-secondary-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Vendors</h1>
          <p className="text-secondary-500 text-sm mt-0.5">{pagination?.total || 0} vendors registered</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Add Vendor</Button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search vendors..." className="flex-1" />
        <Select
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          options={[{ value: '', label: 'All Statuses' }, ...STATUSES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))]}
          className="sm:w-40"
        />
        <Select
          value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          options={[{ value: '', label: 'All Categories' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]}
          className="sm:w-48"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <Table columns={columns} data={vendors} loading={loading} emptyMessage="No vendors found" />
        <div className="p-4 border-t border-secondary-100 dark:border-secondary-700">
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editVendor ? 'Edit Vendor' : 'Add New Vendor'} size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)}>{editVendor ? 'Update Vendor' : 'Create Vendor'}</Button>
        </>}
      >
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Company Name" required error={errors.companyName?.message} {...register('companyName', { required: 'Required' })} />
          <Input label="Owner Name" required error={errors.ownerName?.message} {...register('ownerName', { required: 'Required' })} />
          <Input label="Email" type="email" required error={errors.email?.message} {...register('email', { required: 'Required' })} />
          <Input label="Phone" required error={errors.phone?.message} {...register('phone', { required: 'Required' })} />
          <Input label="GST Number" {...register('gstNumber')} />
          <Input label="PAN Number" {...register('panNumber')} />
          <Select label="Category" required options={CATEGORIES} placeholder="Select category" error={errors.category?.message} {...register('category', { required: 'Required' })} />
          <Select label="Status" options={STATUSES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} {...register('status')} />
          <Input label="Address" containerClassName="sm:col-span-2" {...register('address')} />
          <Input label="City" {...register('city')} />
          <Input label="State" {...register('state')} />
          <Input label="Pincode" {...register('pincode')} />
          <Input label="Country" {...register('country')} />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Vendor" size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={onDelete}>Delete</Button>
        </>}
      >
        <p className="text-secondary-600 dark:text-secondary-300">
          Are you sure you want to delete <strong>{deleteModal?.companyName}</strong>? This will also remove the vendor's user account. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Vendors;
