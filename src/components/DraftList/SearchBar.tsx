import { Search, Plus, ArrowUpDown, Filter } from 'lucide-react';
import { useDraftListStore } from '../../store/draftListStore';
import {
  DRAFT_STATUS_LABELS,
} from '../../types/article';
import type { DraftStatus } from '../../types/article';
import { cn } from '../../lib/utils';

const STATUS_OPTIONS: Array<{ value: DraftStatus | 'all'; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'draft', label: DRAFT_STATUS_LABELS.draft },
  { value: 'published', label: DRAFT_STATUS_LABELS.published },
  { value: 'archived', label: DRAFT_STATUS_LABELS.archived },
];

const SORT_OPTIONS: Array<{ value: 'updatedAt' | 'title' | 'wordCount'; label: string }> = [
  { value: 'updatedAt', label: '更新时间' },
  { value: 'title', label: '标题' },
  { value: 'wordCount', label: '字数' },
];

const PAGE_SIZES = [10, 20, 50];

interface SearchBarProps {
  onCreate: () => void;
}

export function SearchBar({ onCreate }: SearchBarProps) {
  const query = useDraftListStore((s) => s.query);
  const setKeyword = useDraftListStore((s) => s.setKeyword);
  const setStatus = useDraftListStore((s) => s.setStatus);
  const setSort = useDraftListStore((s) => s.setSort);
  const setPageSize = useDraftListStore((s) => s.setPageSize);
  const total = useDraftListStore((s) => s.total);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索标题或摘要..."
            value={query.keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-gray-500" />
          <div className="flex items-center bg-gray-50 rounded-lg p-0.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                  query.status === opt.value
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-gray-500" />
          <select
            value={query.sortBy}
            onChange={(e) => setSort(e.target.value as typeof query.sortBy)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                按{opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setSort(query.sortBy, query.sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
            title={query.sortOrder === 'desc' ? '降序' : '升序'}
          >
            <ArrowUpDown
              className={cn(
                'w-4 h-4 transition-transform',
                query.sortOrder === 'asc' ? 'rotate-180' : ''
              )}
            />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>每页</span>
          <select
            value={query.pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border border-gray-200 rounded-md px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white cursor-pointer"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>条</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400">
            共 <span className="font-medium text-gray-600">{total}</span> 篇
          </span>
          <button
            onClick={onCreate}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            新建草稿
          </button>
        </div>
      </div>
    </div>
  );
}
