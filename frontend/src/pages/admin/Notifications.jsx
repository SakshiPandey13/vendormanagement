import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification, selectNotifications, selectUnreadCount } from '../../store/slices/notificationSlice';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const typeEmoji = { order_assigned: '📦', order_approved: '✅', payment_completed: '💳', low_stock: '⚠️', system: '🔔', info: 'ℹ️', order_rejected: '❌' };

const Notifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);

  useEffect(() => { dispatch(fetchNotifications({ limit: 50 })); }, [dispatch]);

  const handleMarkRead = (id) => dispatch(markAsRead(id));
  const handleMarkAll = () => dispatch(markAllAsRead()).then(() => toast.success('All marked as read'));
  const handleDelete = (id) => dispatch(deleteNotification(id));

  const handleNotifClick = (n) => {
    if (!n.isRead) handleMarkRead(n._id);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="text-secondary-500 text-sm mt-0.5">{unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" icon={CheckCheck} onClick={handleMarkAll} size="sm">Mark All Read</Button>
        )}
      </div>

      <div className="card divide-y divide-secondary-100 dark:divide-secondary-700">
        {notifications.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
            <p className="text-secondary-500">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n, i) => (
            <motion.div key={n._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              onClick={() => handleNotifClick(n)}
              className={`flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-700/30 transition-colors ${!n.isRead ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{typeEmoji[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.isRead ? 'font-semibold text-secondary-900 dark:text-white' : 'text-secondary-700 dark:text-secondary-300'}`}>{n.title}</p>
                <p className="text-sm text-secondary-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-secondary-400 mt-1">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!n.isRead && (
                  <button onClick={(e) => { e.stopPropagation(); handleMarkRead(n._id); }} className="p-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/20 text-secondary-400 hover:text-primary-600 transition-colors" title="Mark as read">
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-secondary-400 hover:text-red-500 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-600 ml-1" />}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
