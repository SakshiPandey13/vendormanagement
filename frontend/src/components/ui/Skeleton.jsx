import clsx from 'clsx';

const Skeleton = ({ className = '', width, height }) => (
  <div
    className={clsx('skeleton-shimmer rounded-lg', className)}
    style={{ width, height }}
  />
);

export const SkeletonCard = () => (
  <div className="card p-6 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-3 w-1/4" />
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="card overflow-hidden">
    <div className="p-4 border-b border-secondary-100 dark:border-secondary-700">
      <Skeleton className="h-4 w-1/4" />
    </div>
    <div className="divide-y divide-secondary-100 dark:divide-secondary-700">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonDashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="card p-6"><Skeleton className="h-48 w-full" /></div>
      <div className="card p-6"><Skeleton className="h-48 w-full" /></div>
    </div>
  </div>
);

export default Skeleton;
