import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { resetPassword, selectAuthLoading } from '../../store/slices/authSlice';

const ResetPassword = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectAuthLoading);
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const result = await dispatch(resetPassword({ token, password: data.password }));
    if (resetPassword.fulfilled.match(result)) {
      toast.success('Password reset successfully! Please login.');
      navigate('/login');
    } else {
      toast.error(result.payload || 'Invalid or expired reset token');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--beige-bg)] flex items-center justify-center p-4 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--secondary)] rounded-2xl mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--surface)" strokeWidth="2.4" strokeLinecap="round" className="w-8 h-8">
              <path d="M9 15L15 9"/><path d="M14 6h4v4"/><path d="M10 18H6v-4"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] font-space tracking-tight">Set New Password</h1>
          <p className="text-[var(--text-secondary)] mt-1 font-medium">Choose a strong password</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input type={showPass ? 'text' : 'password'} placeholder="Minimum 6 characters"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  className="input-field pl-10 pr-12 py-3"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-[var(--neg)] font-semibold">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input type={showPass ? 'text' : 'password'} placeholder="Repeat password"
                  {...register('confirmPassword', { required: 'Please confirm password', validate: (v) => v === watch('password') || 'Passwords do not match' })}
                  className="input-field pl-10 pr-4 py-3"
                />
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-[var(--neg)] font-semibold">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
            </button>

            <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mt-2">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
