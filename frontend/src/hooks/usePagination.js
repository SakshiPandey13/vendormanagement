import { useState, useCallback } from 'react';

/**
 * Pagination state management hook
 */
const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const goToPage = useCallback((newPage) => setPage(newPage), []);
  const nextPage = useCallback(() => setPage((p) => p + 1), []);
  const prevPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const reset = useCallback(() => setPage(1), []);

  return { page, limit, setPage: goToPage, nextPage, prevPage, setLimit, reset };
};

export default usePagination;
