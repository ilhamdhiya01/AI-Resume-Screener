import React from 'react';

import Button from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  currentCount: number;
  onPageChange: (page: number) => void;
}

/**
 * @description Generate visible page numbers with ellipsis.
 * @param {number} currentPage - Current active page.
 * @param {number} totalPages - Total number of pages.
 * @returns {(number | string)[]} Array of page numbers and '...' strings.
 */
const getVisiblePages = (
  currentPage: number,
  totalPages: number
): (number | string)[] => {
  const pages: (number | string)[] = [];

  if (totalPages <= 3) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  if (currentPage <= 3) {
    pages.push(1, 2, 3, '...', totalPages);
  } else if (currentPage >= totalPages - 2) {
    pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push(
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      totalPages
    );
  }

  return pages;
};

const Pagination = React.memo<PaginationProps>(
  ({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    currentCount,
    onPageChange,
  }) => {
    if (totalPages <= 1) return null;

    const visiblePages = getVisiblePages(currentPage, totalPages);
    const from = (currentPage - 1) * pageSize + 1;
    const to = from + currentCount - 1;

    return (
      <div className="flex items-center justify-between py-4">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold">{from}</span> to{' '}
          <span className="font-semibold">{to}</span> of{' '}
          <span className="font-semibold">{totalItems}</span> entries
        </p>
        <div className="inline-flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outlined"
            iconButton="TbChevronLeft"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          />

          {visiblePages.map((page, index) =>
            typeof page === 'string' ? (
              <span
                key={`ellipsis-${index}`}
                className="flex size-9 items-end justify-center font-bold text-slate-400"
              >
                ...
              </span>
            ) : (
              <Button
                key={page}
                size="sm"
                variant={currentPage === page ? 'contained' : 'ghost'}
                label={String(page)}
                type="button"
                onClick={() => onPageChange(page)}
                className="aspect-square h-10 w-10 min-w-0! p-2! md:h-11 md:w-11 md:p-2.5!"
              />
            )
          )}

          <Button
            type="button"
            size="sm"
            variant="outlined"
            iconButton="TbChevronRight"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          />
        </div>
      </div>
    );
  }
);

Pagination.displayName = 'Pagination';

export default Pagination;
