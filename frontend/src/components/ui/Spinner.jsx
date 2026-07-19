import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

const Spinner = ({ size = 'md', className = '', text }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' };

  if (text) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8">
        <Loader2 className={clsx(sizes[size], 'animate-spin text-primary-600', className)} />
        <p className="text-sm text-secondary-500">{text}</p>
      </div>
    );
  }

  return <Loader2 className={clsx(sizes[size], 'animate-spin text-primary-600', className)} />;
};

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-secondary-900">
    <div className="text-center">
      <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
        <span className="text-white font-bold text-2xl">V</span>
      </div>
      <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
      <p className="mt-3 text-sm text-secondary-500">Loading VendorLink...</p>
    </div>
  </div>
);

export default Spinner;
