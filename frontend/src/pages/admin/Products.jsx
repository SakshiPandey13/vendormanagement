import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Package, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import {
  fetchProducts, createProduct, updateProduct, deleteProduct,
  selectProducts, selectProductLoading, selectProductPagination,
} from '../../store/slices/productSlice';
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

const CATEGORIES = ['Electronics', 'Furniture', 'Clothing', 'Food & Beverages', 'Raw Materials', 'Machinery', 'Chemicals', 'Packaging', 'IT Services', 'Stationery', 'Other'];
const UNITS = ['piece', 'kg', 'gram', 'liter', 'meter', 'box', 'pack', 'dozen', 'set'];

const Products = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const loading = useSelector(selectProductLoading);
  const pagination = useSelector(selectProductPagination);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const { page, setPage } = usePagination();
  const debouncedSearch = useDebounce(search);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    dispatch(fetchProducts({ page, limit: 10, search: debouncedSearch, category: categoryFilter, stockStatus: stockFilter }));
  }, [page, debouncedSearch, categoryFilter, stockFilter]);

  const openCreate = () => { setEditProduct(null); reset({ unit: 'piece', taxRate: 18, minimumStock: 10 }); setModalOpen(true); };
  const openEdit = (p) => { setEditProduct(p); reset(p); setModalOpen(true); };

  const onSubmit = async (data) => {
    const action = editProduct
      ? dispatch(updateProduct({ id: editProduct._id, data }))
      : dispatch(createProduct(data));
    const result = await action;
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(editProduct ? 'Product updated!' : 'Product created!');
      setModalOpen(false);
    } else {
      toast.error(result.payload || 'Operation failed');
    }
  };

  const onDelete = async () => {
    const result = await dispatch(deleteProduct(deleteModal._id));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Product deleted'); setDeleteModal(null);
    }
  };

  const columns = [
    {
      key: 'name', label: 'Product', sortable: true,
      render: (v, row) => (
        <div className="flex items-center gap-3">
          {row.image ? <img src={row.image} alt={v} className="w-10 h-10 rounded-xl object-cover" /> : <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center"><Package className="w-5 h-5 text-secondary-400" /></div>}
          <div>
            <p className="font-medium text-secondary-900 dark:text-white text-sm">{v}</p>
            <p className="text-xs text-secondary-400">SKU: {row.sku}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price', sortable: true, render: (v) => <span className="font-medium">₹{v?.toLocaleString('en-IN')}</span> },
    {
      key: 'stock', label: 'Stock', sortable: true,
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{v}</span>
          {v <= row.minimumStock && v > 0 && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
          {v === 0 && <span className="text-xs text-red-500">Out</span>}
        </div>
      ),
    },
    { key: 'stockStatus', label: 'Status', render: (_, row) => <Badge status={row.stockStatus || (row.stock === 0 ? 'out_of_stock' : row.stock <= row.minimumStock ? 'low_stock' : 'in_stock')} dot /> },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-secondary-400 hover:text-amber-500 transition-colors"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDeleteModal(row)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-secondary-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="text-secondary-500 text-sm mt-0.5">{pagination?.total || 0} products in catalog</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Add Product</Button>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search products..." className="flex-1" />
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} options={[{ value: '', label: 'All Categories' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]} className="sm:w-48" />
        <Select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} options={[{ value: '', label: 'All Stock' }, { value: 'in_stock', label: 'In Stock' }, { value: 'low_stock', label: 'Low Stock' }, { value: 'out_of_stock', label: 'Out of Stock' }]} className="sm:w-40" />
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={products} loading={loading} emptyMessage="No products found" />
        <div className="p-4 border-t border-secondary-100 dark:border-secondary-700">
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editProduct ? 'Edit Product' : 'Add Product'} size="lg"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={handleSubmit(onSubmit)}>{editProduct ? 'Update' : 'Create'}</Button></>}
      >
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Product Name" required containerClassName="sm:col-span-2" {...register('name', { required: 'Required' })} />
          <Input label="SKU" required {...register('sku', { required: 'Required' })} hint="Unique product identifier" />
          <Input label="Barcode" {...register('barcode')} />
          <Select label="Category" required options={CATEGORIES} placeholder="Select category" {...register('category', { required: 'Required' })} />
          <Select label="Unit" options={UNITS} {...register('unit')} />
          <Input label="Price (₹)" type="number" required {...register('price', { required: 'Required', min: 0 })} />
          <Input label="Stock Quantity" type="number" {...register('stock', { min: 0 })} />
          <Input label="Minimum Stock" type="number" {...register('minimumStock', { min: 0 })} />
          <Input label="Tax Rate (%)" type="number" {...register('taxRate', { min: 0, max: 100 })} />
          <Input label="Description" containerClassName="sm:col-span-2" {...register('description')} />
        </form>
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Product" size="sm"
        footer={<><Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button><Button variant="danger" onClick={onDelete}>Delete</Button></>}
      >
        <p className="text-secondary-600 dark:text-secondary-300">Delete <strong>{deleteModal?.name}</strong>? This cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default Products;
