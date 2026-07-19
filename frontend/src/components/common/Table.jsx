import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import clsx from 'clsx';

const SortIcon = ({ field, sortBy, sortDir }) => {
  if (sortBy !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-secondary-300" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3.5 h-3.5 text-primary-600" />
    : <ChevronDown className="w-3.5 h-3.5 text-primary-600" />;
};

const Table = ({
  columns = [], data = [], loading = false, emptyMessage = 'No data found',
  onSort, sortBy, sortDir, onRowClick, rowKey = '_id',
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-secondary-100 dark:border-secondary-700">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-secondary-50 dark:bg-secondary-900/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'table-header first:rounded-tl-2xl last:rounded-tr-2xl',
                  col.sortable && onSort && 'cursor-pointer hover:bg-secondary-100 dark:hover:bg-secondary-800 select-none'
                )}
                style={{ width: col.width }}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <div className="flex items-center gap-1.5">
                  {col.label}
                  {col.sortable && onSort && <SortIcon field={col.key} sortBy={sortBy} sortDir={sortDir} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-secondary-800">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {columns.map((col) => (
                  <td key={col.key} className="table-cell">
                    <div className="h-4 bg-secondary-100 dark:bg-secondary-700 rounded skeleton-shimmer" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-16 text-secondary-400">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center">
                    <span className="text-2xl">📭</span>
                  </div>
                  <p className="text-sm">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <motion.tr
                key={row[rowKey] || i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => onRowClick?.(row)}
                className={clsx(
                  'hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className="table-cell">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
