import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total, limit } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pages = [];
  const delta = 2;
  for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-1">
      <p className="text-sm text-secondary-500 dark:text-secondary-400">
        Showing <span className="font-medium text-secondary-700 dark:text-secondary-200">{start}–{end}</span> of{' '}
        <span className="font-medium text-secondary-700 dark:text-secondary-200">{total}</span> results
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!pagination.hasPrevPage}
          className="p-2 rounded-lg text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* First page */}
        <PageBtn page={1} current={page} onClick={onPageChange} />
        {pages[0] > 2 && <span className="px-2 text-secondary-400 text-sm">…</span>}

        {pages.map((p) => <PageBtn key={p} page={p} current={page} onClick={onPageChange} />)}

        {pages[pages.length - 1] < totalPages - 1 && <span className="px-2 text-secondary-400 text-sm">…</span>}
        {totalPages > 1 && <PageBtn page={totalPages} current={page} onClick={onPageChange} />}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!pagination.hasNextPage}
          className="p-2 rounded-lg text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const PageBtn = ({ page, current, onClick }) => (
  <button
    onClick={() => onClick(page)}
    className={clsx(
      'min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-all duration-150',
      page === current
        ? 'bg-primary-600 text-white shadow-sm'
        : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700'
    )}
  >
    {page}
  </button>
);

export default Pagination;
