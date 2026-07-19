import { Search, X } from 'lucide-react';
import clsx from 'clsx';

const SearchBar = ({
  value, onChange, onClear, placeholder = 'Search...', className = '', autoFocus = false,
}) => {
  return (
    <div className={clsx('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-600
          rounded-xl text-sm text-secondary-900 dark:text-secondary-100 placeholder-secondary-400
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
      />
      {value && (
        <button
          onClick={() => { onChange(''); onClear?.(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
