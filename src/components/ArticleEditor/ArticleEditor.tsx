import { useState, useCallback, useEffect } from 'react';
import { Save, Undo2, Redo2 } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useDebounce } from '../../hooks/useDebounce';
import { MAX_SUMMARY_LENGTH } from '../../types/article';
import { CoverUploader } from '../common/CoverUploader';
import { BlockToolbar } from './BlockToolbar';
import { BlockWrapper } from '../blocks/BlockWrapper';
import { HeadingBlock } from '../blocks/HeadingBlock';
import { ParagraphBlock } from '../blocks/ParagraphBlock';
import { ListBlock } from '../blocks/ListBlock';
import { ImageBlock } from '../blocks/ImageBlock';
import { AlertBlock } from '../blocks/AlertBlock';
import { ArticleRenderer } from './ArticleRenderer';
import { Toast } from '../common/Toast';
import { cn } from '../../lib/utils';
import type { ArticleBlock } from '../../types/article';

export function ArticleEditor() {
  const draft = useEditorStore((s) => s.draft);
  const isDirty = useEditorStore((s) => s.isDirty);
  const isSaving = useEditorStore((s) => s.isSaving);
  const toast = useEditorStore((s) => s.toast);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const setTitle = useEditorStore((s) => s.setTitle);
  const setSummary = useEditorStore((s) => s.setSummary);
  const setCoverImage = useEditorStore((s) => s.setCoverImage);
  const moveBlock = useEditorStore((s) => s.moveBlock);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const saveDraft = useEditorStore((s) => s.saveDraft);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const debouncedDraft = useDebounce(draft, 300);

  const summaryLen = draft.summary.length;
  const summaryOver = summaryLen > MAX_SUMMARY_LENGTH * 0.9;

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((toIndex: number) => {
    if (dragIndex !== null && dragIndex !== toIndex) {
      moveBlock(dragIndex, toIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  }, [dragIndex, moveBlock]);

  const renderBlock = (block: ArticleBlock, index: number) => {
    let editor: React.ReactNode;
    switch (block.type) {
      case 'h2':
      case 'h3':
        editor = <HeadingBlock block={block} />;
        break;
      case 'paragraph':
        editor = <ParagraphBlock block={block} />;
        break;
      case 'ordered-list':
      case 'unordered-list':
        editor = <ListBlock block={block} />;
        break;
      case 'image':
        editor = <ImageBlock block={block} />;
        break;
      case 'tip':
      case 'warning':
        editor = <AlertBlock block={block} />;
        break;
      default:
        editor = null;
    }

    return (
      <BlockWrapper
        key={block.id}
        block={block}
        index={index}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        isDragging={dragIndex === index}
        isDragOver={dragOverIndex === index}
      >
        {editor}
      </BlockWrapper>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-[55%] h-full overflow-y-auto border-r border-gray-200 bg-white">
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <h1 className="text-lg font-bold text-gray-900">文章编辑器</h1>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                title="撤销 (Ctrl+Z)"
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                title="重做 (Ctrl+Y)"
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Redo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={saveDraft}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? '保存中...' : '保存'}
              </button>
              {isDirty && (
                <span className="text-xs text-orange-500 font-medium">未保存</span>
              )}
            </div>
          </div>

          <div>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入文章标题"
              className="w-full text-2xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none bg-transparent py-1"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">摘要</label>
              <span className={cn(
                'text-xs',
                summaryOver ? 'text-red-500 font-medium' : 'text-gray-400'
              )}>
                {summaryLen}/{MAX_SUMMARY_LENGTH}
              </span>
            </div>
            <textarea
              value={draft.summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="请输入文章摘要，120字以内"
              rows={3}
              className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none placeholder-gray-400"
            />
          </div>

          <CoverUploader value={draft.coverImage} onChange={setCoverImage} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">正文内容</label>
            <BlockToolbar />
          </div>

          <div className="space-y-1">
            {draft.blocks.map((block, index) => renderBlock(block, index))}
            {draft.blocks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-sm font-medium">暂无内容块</p>
                <p className="text-xs mt-1">点击上方工具栏按钮添加内容</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-[45%] h-full overflow-y-auto bg-stone-50">
        <div className="sticky top-0 z-10 bg-stone-50/90 backdrop-blur-sm border-b border-gray-200 px-6 py-3">
          <span className="text-sm font-semibold text-gray-600">实时预览</span>
        </div>
        <div className="p-6">
          <ArticleRenderer draft={debouncedDraft} />
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
