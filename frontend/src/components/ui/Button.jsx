import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
  outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 font-semibold px-4 py-2.5 rounded-xl transition-all duration-150',
};

const sizes = {
  sm: 'text-sm px-3 py-1.5 !rounded-lg',
  md: '',
  lg: 'text-base px-6 py-3',
  icon: '!px-2.5 !py-2.5',
};

const Button = ({
  children, variant = 'primary', size = 'md', loading = false,
  disabled = false, icon: Icon, iconRight, className = '', onClick, type = 'button', ...props
}) => {
  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.96 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(variants[variant], sizes[size], 'inline-flex items-center justify-center gap-2', className)}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
      {iconRight && !loading && <iconRight className="w-4 h-4" />}
    </motion.button>
  );
};

export default Button;
