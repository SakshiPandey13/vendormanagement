import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { PageLoader } from '../components/ui/Spinner';
import ProtectedRoute from './ProtectedRoute';

// Auth
const Login = lazy(() => import('../pages/auth/Login'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));

// Admin
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const Vendors = lazy(() => import('../pages/admin/Vendors'));
const VendorDetail = lazy(() => import('../pages/admin/VendorDetail'));
const Products = lazy(() => import('../pages/admin/Products'));
const PurchaseOrders = lazy(() => import('../pages/admin/PurchaseOrders'));
const OrderDetail = lazy(() => import('../pages/admin/OrderDetail'));
const Inventory = lazy(() => import('../pages/admin/Inventory'));
const Payments = lazy(() => import('../pages/admin/Payments'));
const Reports = lazy(() => import('../pages/admin/Reports'));
const AdminNotifications = lazy(() => import('../pages/admin/Notifications'));
const Settings = lazy(() => import('../pages/admin/Settings'));

// Vendor
const VendorLayout = lazy(() => import('../layouts/VendorLayout'));
const VendorDashboard = lazy(() => import('../pages/vendor/VendorDashboard'));
const VendorOrders = lazy(() => import('../pages/vendor/VendorOrders'));
const VendorPayments = lazy(() => import('../pages/vendor/VendorPayments'));
const VendorPerformance = lazy(() => import('../pages/vendor/VendorPerformance'));
const VendorProfile = lazy(() => import('../pages/vendor/VendorProfile'));

const AppRoutes = () => (
  <BrowserRouter>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="vendors/:id" element={<VendorDetail />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<PurchaseOrders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Vendor */}
        <Route path="/vendor" element={
          <ProtectedRoute role="vendor"><VendorLayout /></ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="orders" element={<VendorOrders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="payments" element={<VendorPayments />} />
          <Route path="performance" element={<VendorPerformance />} />
          <Route path="profile" element={<VendorProfile />} />
        </Route>

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRoutes;
