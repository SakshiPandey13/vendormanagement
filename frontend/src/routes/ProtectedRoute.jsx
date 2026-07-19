import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { PageLoader } from '../components/ui/Spinner';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/vendor/dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;
