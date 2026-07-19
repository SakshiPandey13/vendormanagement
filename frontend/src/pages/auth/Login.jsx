import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { login, selectIsAuthenticated, selectAuthLoading, selectAuthError, clearError } from '../../store/slices/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      const user = JSON.parse(localStorage.getItem('vendorlink_user') || '{}');
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/vendor/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const onSubmit = async (data) => {
    const result = await dispatch(login(data));
    if (login.fulfilled.match(result)) {
      toast.success('Welcome back! 👋');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--beige-bg)] flex items-center justify-center p-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--secondary)] rounded-2xl mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--surface)" strokeWidth="2.4" strokeLinecap="round" className="w-8 h-8">
              <path d="M9 15L15 9"/><path d="M14 6h4v4"/><path d="M10 18H6v-4"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] font-space tracking-tight">VendorLink</h1>
          <p className="text-[var(--text-secondary)] mt-1 font-medium">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  placeholder="admin@vendorlink.com"
                  {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                  className="input-field pl-10 pr-4 py-3"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-[var(--neg)] font-semibold">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                  className="input-field pl-10 pr-12 py-3"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-[var(--neg)] font-semibold">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm font-semibold text-[var(--cyan-dark)] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-[var(--beige-card-2)] rounded-xl border border-[var(--border)]">
            <p className="text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">Demo credentials:</p>
            <div className="space-y-1.5">
              <p className="text-xs text-[var(--text-secondary)]">Admin: <span className="font-semibold text-[var(--text-primary)]">admin@vendorlink.com / Admin@123</span></p>
              <p className="text-xs text-[var(--text-secondary)]">Vendor: <span className="font-semibold text-[var(--text-primary)]">vendor@vendorlink.com / Vendor@123</span></p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
