import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectIsAuthenticated, selectAuthLoading, logout } from '../store/slices/authSlice';

/**
 * Custom hook for auth state and actions
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);

  const isAdmin = user?.role === 'admin';
  const isVendor = user?.role === 'vendor';

  const handleLogout = () => dispatch(logout());

  return { user, isAuthenticated, loading, isAdmin, isVendor, logout: handleLogout };
};

export default useAuth;
