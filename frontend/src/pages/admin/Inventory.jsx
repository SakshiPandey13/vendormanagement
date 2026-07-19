import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Package, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';
import inventoryService from '../../services/inventoryService';
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

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [adjustModal, setAdjustModal] = useState(null);
  const [adjustAction, setAdjustAction] = useState('added');
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustNote, setAdjustNote] = useState('');
  const { page, setPage } = usePagination();
  const debouncedSearch = useDebounce(search);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getInventory({ page, limit: 15, stockStatus: stockFilter, search: debouncedSearch });
      setInventory(res.data || []);
      setPagination(res.pagination);
    } catch { toast.error('Failed to load inventory'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadInventory(); }, [page, debouncedSearch, stockFilter]);

  const handleAdjust = async () => {
    try {
      await inventoryService.adjustStock(adjustModal.product._id, { action: adjustAction, quantity: parseInt(adjustQty), note: adjustNote });
      toast.success('Stock adjusted');
      setAdjustModal(null);
      setAdjustQty(1); setAdjustNote('');
      loadInventory();
    } catch { toast.error('Adjustment failed'); }
  };

  const columns = [
    {
      key: 'product', label: 'Product',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          {v?.image ? <img src={v.image} alt={v.name} className="w-10 h-10 rounded-xl object-cover" /> :
            <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-700 rounded-xl flex items-center justify-center"><Package className="w-5 h-5 text-secondary-400" /></div>}
          <div>
            <p className="text-sm font-medium text-secondary-900 dark:text-white">{v?.name}</p>
            <p className="text-xs text-secondary-400">{v?.sku}</p>
          </div>
        </div>
      ),
    },
    { key: 'product', label: 'Category', render: (v) => <span className="text-sm">{v?.category}</span> },
    {
      key: 'currentStock', label: 'Current Stock', sortable: true,
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-secondary-900 dark:text-white">{v}</span>
          {v <= (row.minimumStock || 10) && v > 0 && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
        </div>
      ),
    },
    { key: 'reservedStock', label: 'Reserved', render: (v) => <span className="text-sm text-secondary-500">{v || 0}</span> },
    { key: 'availableStock', label: 'Available', render: (v) => <span className="text-sm font-medium text-green-600">{v || 0}</span> },
    { key: 'stockStatus', label: 'Status', render: (_, row) => <Badge status={row.stockStatus} dot /> },
    {
      key: 'actions', label: 'Adjust',
      render: (_, row) => (
        <button onClick={() => setAdjustModal(row)} className="btn-ghost text-xs flex items-center gap-1">
          <ArrowUpDown className="w-3.5 h-3.5" /> Adjust
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="text-secondary-500 text-sm mt-0.5">Track and manage stock levels</p>
        </div>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search products..." className="flex-1" />
        <Select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}
          options={[{ value: '', label: 'All Stock' }, { value: 'in_stock', label: 'In Stock' }, { value: 'low_stock', label: 'Low Stock' }, { value: 'out_of_stock', label: 'Out of Stock' }, { value: 'reorder_needed', label: 'Reorder Needed' }]}
          className="sm:w-44" />
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={inventory} loading={loading} emptyMessage="No inventory records found" />
        <div className="p-4 border-t border-secondary-100 dark:border-secondary-700">
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>

      <Modal isOpen={!!adjustModal} onClose={() => setAdjustModal(null)} title={`Adjust Stock — ${adjustModal?.product?.name}`} size="sm"
        footer={<><Button variant="secondary" onClick={() => setAdjustModal(null)}>Cancel</Button><Button onClick={handleAdjust}>Apply Adjustment</Button></>}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[['Current', adjustModal?.currentStock, 'blue'], ['Reserved', adjustModal?.reservedStock, 'amber'], ['Available', adjustModal?.availableStock, 'green']].map(([l, v, c]) => (
              <div key={l} className={`bg-${c}-50 dark:bg-${c}-900/20 rounded-xl p-3`}>
                <p className="text-xl font-bold text-secondary-900 dark:text-white">{v || 0}</p>
                <p className="text-xs text-secondary-500">{l}</p>
              </div>
            ))}
          </div>
          <Select label="Action" value={adjustAction} onChange={(e) => setAdjustAction(e.target.value)}
            options={[{ value: 'added', label: '+ Add Stock' }, { value: 'removed', label: '- Remove Stock' }, { value: 'adjusted', label: '= Set Exact' }]} />
          <Input label="Quantity" type="number" value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)} min={0} />
          <Input label="Note (optional)" value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)} placeholder="Reason for adjustment..." />
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
