import { forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef(({
  label, error, hint, icon: Icon, iconRight, className = '',
  containerClassName = '', required, ...props
}, ref) => {
  return (
    <div className={clsx('w-full', containerClassName)}>
      {label && (
        <label className="label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            'input-field',
            Icon && 'pl-10',
            iconRight && 'pr-10',
            error && 'border-red-400 focus:ring-red-400',
            className
          )}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400">
            <iconRight className="w-4 h-4" />
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-secondary-400">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
