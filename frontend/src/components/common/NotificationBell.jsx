import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNotifications, markAsRead, markAllAsRead, selectNotifications, selectUnreadCount } from '../../store/slices/notificationSlice';
import { useNavigate } from 'react-router-dom';

const typeIcons = {
  order_assigned: '📦', order_approved: '✅', order_accepted: '🤝',
  order_rejected: '❌', payment_completed: '💳', low_stock: '⚠️',
  vendor_registered: '👤', system: '🔔', info: 'ℹ️',
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const ref = useRef();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);

  useEffect(() => {
    dispatch(fetchNotifications({ limit: 10 }));
  }, [dispatch]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = (notif) => {
    dispatch(markAsRead(notif._id));
    if (notif.link) navigate(notif.link);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="icon-btn relative"
        aria-label="Notifications"
      >
        <Bell width={17} height={17} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--cyan)',
            boxShadow: '0 0 0 2px var(--beige-card)',
          }} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            style={{
              position: 'absolute', right: 0, top: '100%', marginTop: 8,
              width: 320, background: 'var(--beige-card)',
              border: '1px solid var(--beige-border)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow)', zIndex: 50,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--beige-border)' }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => dispatch(markAllAsRead())}
                  style={{ fontSize: 12, fontWeight: 600, color: 'var(--cyan-dark)', display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <CheckCheck width={13} height={13} /> Mark all read
                </button>
              )}
            </div>

            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--ink-faint)', fontSize: 13 }}>No notifications yet</div>
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <div
                    key={n._id}
                    onClick={() => handleClick(n)}
                    style={{
                      display: 'flex', gap: 12, padding: '12px 16px', cursor: 'pointer',
                      borderTop: '1px solid var(--beige-border)',
                      background: !n.isRead ? 'var(--cyan-tint)' : 'transparent',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--beige-card-2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = !n.isRead ? 'var(--cyan-tint)' : 'transparent'; }}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 2 }}>{typeIcons[n.type] || '🔔'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: n.isRead ? 500 : 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</p>
                      <p style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</p>
                      <p style={{ fontSize: 10.5, color: 'var(--ink-faint)', marginTop: 3 }}>{new Date(n.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    {!n.isRead && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--cyan)', flexShrink: 0, marginTop: 6 }} />}
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--beige-border)' }}>
              <button
                onClick={() => { navigate('/admin/notifications'); setOpen(false); }}
                style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--cyan-dark)', width: '100%', textAlign: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
