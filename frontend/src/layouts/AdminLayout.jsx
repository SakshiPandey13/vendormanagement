import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Package, ShoppingCart, Warehouse,
  CreditCard, BarChart3, Bell, Settings, LogOut, Menu, X,
  Sun, Moon,
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { toggleDarkMode, toggleSidebar, selectSidebarOpen, selectDarkMode } from '../store/slices/uiSlice';
import useAuth from '../hooks/useAuth';
import NotificationBell from '../components/common/NotificationBell';

const navItems = [
  { to: '/admin/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/vendors',        icon: Users,           label: 'Vendors' },
  { to: '/admin/products',       icon: Package,         label: 'Products' },
  { to: '/admin/orders',         icon: ShoppingCart,    label: 'Purchase Orders' },
  { to: '/admin/inventory',      icon: Warehouse,       label: 'Inventory' },
  { to: '/admin/payments',       icon: CreditCard,      label: 'Payments' },
  { to: '/admin/reports',        icon: BarChart3,       label: 'Reports' },
  { to: '/admin/notifications',  icon: Bell,            label: 'Notifications' },
  { to: '/admin/settings',       icon: Settings,        label: 'Settings' },
];

// Stitch underline indicator (matches the template exactly)
const StitchIndicator = () => (
  <span style={{
    position: 'absolute', left: 14, right: 14, bottom: 0, height: 6,
    display: 'flex', alignItems: 'center',
  }}>
    <span style={{
      position: 'absolute', left: 0, right: 0, top: 2, height: 2,
      background: 'var(--cyan)', borderRadius: 2,
    }} />
    <span style={{
      position: 'absolute', left: 0, width: 6, height: 6,
      borderRadius: '50%', background: 'var(--cyan)', top: 0,
      boxShadow: '0 0 0 3px var(--cyan-tint)',
    }} />
    <span style={{
      position: 'absolute', right: 0, width: 6, height: 6,
      borderRadius: '50%', background: 'var(--cyan)', top: 0,
      boxShadow: '0 0 0 3px var(--cyan-tint)',
    }} />
  </span>
);

const AdminLayout = () => {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const darkMode    = useSelector(selectDarkMode);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  // Initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  /* ── Desktop topbar nav layout ── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--beige-bg)', color: 'var(--ink)' }}>

      {/* ═══ STICKY TOPBAR ═══ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--beige-card)',
        borderBottom: '1px solid var(--beige-border)',
        backdropFilter: 'blur(6px)',
      }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto',
          display: 'flex', alignItems: 'center', gap: 20,
          padding: '0 24px', height: 64,
        }}>

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--beige-bg)" strokeWidth="2.4" strokeLinecap="round" width={18} height={18}>
                <path d="M9 15L15 9"/><path d="M14 6h4v4"/><path d="M10 18H6v-4"/>
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16.5, letterSpacing: '-0.01em' }}>
                VendorLink
              </span>
              <span style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, marginTop: 1 }}>
                Admin Panel
              </span>
            </div>
          </div>

          {/* Tabs navigation — hidden on mobile */}
          <nav style={{
            display: 'flex', alignItems: 'stretch', gap: 2,
            height: 64, flex: 1, overflowX: 'auto',
            scrollbarWidth: 'none',
          }} className="hide-scrollbar">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '0 13px', height: '100%',
                  fontSize: 13, fontWeight: 600,
                  color: isActive ? 'var(--ink)' : 'var(--ink-soft)',
                  whiteSpace: 'nowrap', position: 'relative', cursor: 'pointer',
                  textDecoration: 'none', borderBottom: 'none',
                  transition: 'color .15s ease',
                })}
              >
                {({ isActive }) => (
                  <>
                    <item.icon width={15} height={15} style={{ opacity: isActive ? 1 : 0.7, color: isActive ? 'var(--cyan-dark)' : 'currentColor', flexShrink: 0 }} />
                    {item.label}
                    {isActive && <StitchIndicator />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {/* Dark mode toggle */}
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="icon-btn"
              title="Toggle dark mode"
            >
              {darkMode ? <Sun width={17} height={17} /> : <Moon width={17} height={17} />}
            </button>

            {/* Notification bell */}
            <NotificationBell />

            {/* Logout */}
            <button onClick={handleLogout} className="icon-btn" title="Logout">
              <LogOut width={17} height={17} />
            </button>

            {/* Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 8, borderLeft: '1px solid var(--beige-border)' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'var(--cyan)', color: '#fff',
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12.5,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {initials}
              </div>
              <div style={{ lineHeight: 1.1 }} className="hidden sm:block">
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)' }}>{user?.name}</div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>Administrator</div>
              </div>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="icon-btn lg:hidden"
            >
              {mobileOpen ? <X width={17} height={17} /> : <Menu width={17} height={17} />}
            </button>
          </div>
        </div>
      </header>

      {/* ═══ MOBILE SLIDE-DOWN MENU ═══ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(23,20,15,0.4)', zIndex: 40 }}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              style={{
                position: 'fixed', left: 0, top: 0, height: '100%', width: 240,
                background: 'var(--beige-card)', borderRight: '1px solid var(--beige-border)',
                zIndex: 50, display: 'flex', flexDirection: 'column', padding: '16px 12px',
                overflowY: 'auto',
              }}
            >
              {/* Logo in mobile drawer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--beige-border)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--beige-bg)" strokeWidth="2.4" strokeLinecap="round" width={16} height={16}>
                    <path d="M9 15L15 9"/><path d="M14 6h4v4"/><path d="M10 18H6v-4"/>
                  </svg>
                </div>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16 }}>VendorLink</span>
              </div>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                {navItems.map(item => (
                  <NavLink key={item.to} to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                  >
                    <item.icon width={16} height={16} />
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <button onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, color: 'var(--neg)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', background: 'none', border: 'none', marginTop: 12 }}>
                <LogOut width={16} height={16} /> Logout
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ PAGE CONTENT ═══ */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px 60px' }}>
        <motion.div
          key={typeof window !== 'undefined' ? window.location.pathname : ''}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default AdminLayout;
