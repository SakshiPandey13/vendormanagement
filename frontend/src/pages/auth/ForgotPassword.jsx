import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { forgotPassword, selectAuthLoading } from '../../store/slices/authSlice';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const result = await dispatch(forgotPassword(data.email));
    if (forgotPassword.fulfilled.match(result)) {
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    } else {
      toast.error(result.payload || 'Failed to send reset link');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--beige-bg)] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--secondary)] rounded-2xl mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--surface)" strokeWidth="2.4" strokeLinecap="round" className="w-8 h-8">
              <path d="M9 15L15 9"/><path d="M14 6h4v4"/><path d="M10 18H6v-4"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] font-space tracking-tight">Forgot Password?</h1>
          <p className="text-[var(--text-secondary)] mt-1 font-medium">Enter your email to receive a reset link</p>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-[var(--cyan-dark)] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-space mb-2">Email Sent!</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6">Check your inbox for the password reset link. It expires in 15 minutes.</p>
              <Link to="/login" className="text-[var(--cyan-dark)] hover:underline text-sm font-semibold">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input type="email" placeholder="your@email.com"
                    {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                    className="input-field pl-10 pr-4 py-3"
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-[var(--neg)] font-semibold">{errors.email.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Link'}
              </button>

              <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mt-2">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
