import { Copy, Trash2, Edit3, FileText, Hash, Clock, Eye } from 'lucide-react';
import type { DraftListItem } from '../../types/article';
import { DRAFT_STATUS_LABELS, DRAFT_STATUS_COLORS } from '../../types/article';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { PLACEHOLDER_IMAGE } from '../../utils/fileUtils';

interface DraftCardProps {
  item: DraftListItem;
  onCopy: (id: string, title: string) => void;
  onDelete: (id: string, title: string) => void;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return '刚刚';
    if (mins < 60) return `${mins} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;

    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  } catch {
    return '';
  }
}

export function DraftCard({ item, onCopy, onDelete }: DraftCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-orange-200 transition-all cursor-pointer"
      onClick={() => navigate(`/editor/${item.id}`)}
    >
      <div className="relative aspect-[16/9] bg-gradient-to-br from-orange-100 to-amber-100 overflow-hidden">
        {item.coverImage ? (
          <img
            src={item.coverImage}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="w-12 h-12 text-orange-300" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full border',
              DRAFT_STATUS_COLORS[item.status]
            )}
          >
            {DRAFT_STATUS_LABELS[item.status]}
          </span>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/editor/${item.id}`);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/95 text-gray-700 text-sm font-medium rounded-lg shadow-sm hover:bg-white transition-colors"
            >
              <Eye className="w-4 h-4" />
              预览
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/editor/${item.id}`);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-orange-600 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              编辑
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1.5 line-clamp-1 group-hover:text-orange-600 transition-colors">
          {item.title || '未命名草稿'}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3 min-h-[2.5rem]">
          {item.summary || '暂无摘要'}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {item.blockCount} 块
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {item.wordCount} 字
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(item.updatedAt)}
          </span>
        </div>

        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy(item.id, item.title);
            }}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            复制
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id, item.title);
            }}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            删除
          </button>
        </div>
      </div>
    </div>
  );
}
