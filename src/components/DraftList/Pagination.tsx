import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDraftListStore } from '../../store/draftListStore';
import { cn } from '../../lib/utils';

export function Pagination() {
  const query = useDraftListStore((s) => s.query);
  const total = useDraftListStore((s) => s.total);
  const setPage = useDraftListStore((s) => s.setPage);
  const loading = useDraftListStore((s) => s.loading);

  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));

  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const current = query.page;
    const max = totalPages;
    const delta = 2;

    for (let i = 1; i <= max; i++) {
      if (
        i === 1 ||
        i === max ||
        (i >= current - delta && i <= current + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== -1) {
        pages.push(-1);
      }
    }
    return pages;
  };

  if (totalPages <= 1 && !loading) return null;

  return (
    <div className="flex items-center justify-center gap-1 mt-6 py-2">
      <button
        onClick={() => setPage(query.page - 1)}
        disabled={query.page <= 1 || loading}
        className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500"
        title="上一页"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {getPageNumbers().map((page, idx) =>
        page === -1 ? (
          <span
            key={`ellipsis-${idx}`}
            className="px-2 py-1 text-gray-400 text-sm select-none"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => setPage(page)}
            disabled={loading}
            className={cn(
              'min-w-[36px] h-9 px-2 text-sm font-medium rounded-lg transition-all',
              page === query.page
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
            )}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => setPage(query.page + 1)}
        disabled={query.page >= totalPages || loading}
        className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500"
        title="下一页"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
