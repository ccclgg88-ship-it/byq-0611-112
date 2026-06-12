import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileX, Plus, Loader2 } from 'lucide-react';
import { useDraftListStore } from '../../store/draftListStore';
import { SearchBar } from './SearchBar';
import { DraftCard } from './DraftCard';
import { Pagination } from './Pagination';
import { Toast } from '../common/Toast';
import { useEditorStore } from '../../store/editorStore';

export function DraftList() {
  const navigate = useNavigate();
  const fetchList = useDraftListStore((s) => s.fetchList);
  const items = useDraftListStore((s) => s.items);
  const loading = useDraftListStore((s) => s.loading);
  const createDraft = useDraftListStore((s) => s.createDraft);
  const copyDraft = useDraftListStore((s) => s.copyDraft);
  const deleteDraft = useDraftListStore((s) => s.deleteDraft);
  const query = useDraftListStore((s) => s.query);

  const showToast = useEditorStore((s) => s.showToast);
  const toast = useEditorStore((s) => s.toast);
  const hideToast = useEditorStore((s) => s.hideToast);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleCreate = async () => {
    const id = await createDraft();
    if (id) {
      showToast('success', '草稿创建成功');
      navigate(`/editor/${id}`);
    } else {
      showToast('error', '创建失败，请重试');
    }
  };

  const handleCopy = async (id: string, title: string) => {
    const newId = await copyDraft(id);
    if (newId) {
      showToast('success', `已复制「${title || '未命名草稿'}」`);
    } else {
      showToast('error', '复制失败，请重试');
    }
  };

  const handleDeleteRequest = (id: string, title: string) => {
    setDeleteConfirm({ id, title });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const ok = await deleteDraft(deleteConfirm.id);
    if (ok) {
      showToast('success', `已删除「${deleteConfirm.title || '未命名草稿'}」`);
    } else {
      showToast('error', '删除失败，请重试');
    }
    setDeleteConfirm(null);
  };

  const emptyMessage = query.keyword || query.status !== 'all'
    ? '没有找到匹配的草稿，试试调整搜索条件'
    : '还没有草稿，点击右上方「新建草稿」开始创作';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">文章草稿管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理所有生活技巧文章草稿，支持搜索、筛选、排序</p>
        </div>

        <SearchBar onCreate={handleCreate} />

        {loading && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-orange-400" />
            <p className="text-sm">加载中...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
            <FileX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">{emptyMessage}</p>
            {!query.keyword && query.status === 'all' && (
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                新建草稿
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((item) => (
                <DraftCard
                  key={item.id}
                  item={item}
                  onCopy={handleCopy}
                  onDelete={handleDeleteRequest}
                />
              ))}
            </div>
            <Pagination />
          </>
        )}
      </div>

      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-xl p-6 w-[400px] max-w-[90vw] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              确认删除
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              确定要删除「
              <span className="font-medium text-gray-800">
                {deleteConfirm.title || '未命名草稿'}
              </span>
              」吗？删除后无法恢复。
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          toast={toast}
          onClose={hideToast}
        />
      )}
    </div>
  );
}
