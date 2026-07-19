import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Building2, Phone, Mail, MapPin, FileText, TrendingUp, ShoppingCart, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import vendorService from '../../services/vendorService';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

const StarRating = ({ value }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} className={`w-4 h-4 ${s <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-secondary-200'}`} />
    ))}
    <span className="ml-1 text-sm font-medium text-secondary-700 dark:text-secondary-300">{(value || 0).toFixed(1)}</span>
  </div>
);

const VendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [vRes, sRes] = await Promise.all([
          vendorService.getVendor(id),
          vendorService.getVendorStats(id),
        ]);
        setVendor(vRes.data);
        setStats(sRes.data);
      } catch { toast.error('Failed to load vendor'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <Spinner size="lg" text="Loading vendor..." />;
  if (!vendor) return <div className="text-center py-16 text-secondary-400">Vendor not found</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/vendors')} className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors">
          <ArrowLeft className="w-5 h-5 text-secondary-600" />
        </button>
        <h1 className="page-title">Vendor Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 space-y-5">
          <div className="text-center">
            <Avatar src={vendor.profileImage} name={vendor.companyName} size="xl" className="mx-auto mb-3" />
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white">{vendor.companyName}</h2>
            <p className="text-secondary-500 text-sm">{vendor.ownerName}</p>
            <div className="mt-2 flex justify-center">
              <Badge status={vendor.status} dot />
            </div>
          </div>

          <div className="space-y-3 border-t border-secondary-100 dark:border-secondary-700 pt-4">
            {[
              { icon: Mail, value: vendor.email },
              { icon: Phone, value: vendor.phone },
              { icon: MapPin, value: `${vendor.city}, ${vendor.state}` },
              { icon: Building2, value: vendor.category },
            ].map(({ icon: Icon, value }) => value && (
              <div key={value} className="flex items-center gap-3 text-sm text-secondary-600 dark:text-secondary-300">
                <Icon className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                <span>{value}</span>
              </div>
            ))}
          </div>

          {vendor.gstNumber && (
            <div className="bg-secondary-50 dark:bg-secondary-700/50 rounded-xl p-3 space-y-1 text-sm">
              <p className="text-secondary-500">GST: <span className="font-medium text-secondary-800 dark:text-secondary-200">{vendor.gstNumber}</span></p>
              {vendor.panNumber && <p className="text-secondary-500">PAN: <span className="font-medium text-secondary-800 dark:text-secondary-200">{vendor.panNumber}</span></p>}
            </div>
          )}
        </motion.div>

        {/* Stats & Ratings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-4">
          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Orders', value: stats?.orderStats?.total || 0, icon: ShoppingCart, color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' },
              { label: 'Completed', value: stats?.orderStats?.completed || 0, icon: TrendingUp, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
              { label: 'Revenue', value: `₹${((stats?.paymentStats?.paid || 0) / 1000).toFixed(0)}k`, icon: CreditCard, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
              { label: 'Completion Rate', value: `${vendor.completionRate || 0}%`, icon: Star, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
            ].map((s) => (
              <div key={s.label} className="card p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <p className="text-xl font-bold text-secondary-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-secondary-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Performance Ratings */}
          <div className="card p-6">
            <h3 className="section-title mb-5">Performance Ratings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Overall Rating', value: vendor.rating?.overall },
                { label: 'Delivery', value: vendor.rating?.delivery },
                { label: 'Quality', value: vendor.rating?.quality },
                { label: 'Communication', value: vendor.rating?.communication },
                { label: 'Support', value: vendor.rating?.support },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-secondary-600 dark:text-secondary-300 flex-shrink-0">{label}</span>
                  <StarRating value={value || 0} />
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          {vendor.documents?.length > 0 && (
            <div className="card p-6">
              <h3 className="section-title mb-4">Documents</h3>
              <div className="space-y-2">
                {vendor.documents.map((doc, i) => (
                  <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors group">
                    <FileText className="w-5 h-5 text-primary-600" />
                    <span className="text-sm text-secondary-700 dark:text-secondary-300 group-hover:text-primary-600 transition-colors">{doc.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default VendorDetail;
