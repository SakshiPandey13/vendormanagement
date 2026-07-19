import { forwardRef } from 'react';
import clsx from 'clsx';

const Select = forwardRef(({
  label, error, hint, className = '', options = [], placeholder,
  required, containerClassName = '', ...props
}, ref) => {
  return (
    <div className={clsx('w-full', containerClassName)}>
      {label && (
        <label className="label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={clsx(
          'input-field appearance-none cursor-pointer',
          error && 'border-red-400 focus:ring-red-400',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-secondary-400">{hint}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
