import { useRef } from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import type { ArticleBlock } from '../../types/article';
import { useEditorStore } from '../../store/editorStore';

interface BlockWrapperProps {
  block: ArticleBlock;
  index: number;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (index: number) => void;
  isDragging: boolean;
  isDragOver: boolean;
  children: React.ReactNode;
}

export function BlockWrapper({
  block,
  index,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isDragOver,
  children,
}: BlockWrapperProps) {
  const removeBlock = useEditorStore((s) => s.removeBlock);
  const dragEnabledRef = useRef(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (!dragEnabledRef.current) {
      e.preventDefault();
      return;
    }
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'BUTTON' ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('select') ||
      target.closest('button')
    ) {
      e.preventDefault();
      return;
    }
    onDragStart(index);
  };

  return (
    <div
      draggable={dragEnabledRef.current}
      onDragStart={handleDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e, index);
      }}
      onDrop={(e) => {
        e.preventDefault();
        dragEnabledRef.current = false;
        onDrop(index);
      }}
      onDragEnd={() => {
        dragEnabledRef.current = false;
      }}
      className={`group relative flex gap-2 p-3 rounded-lg transition-all ${
        isDragging ? 'opacity-50' : ''
      } ${isDragOver ? 'border-2 border-dashed border-orange-400 bg-orange-50' : 'border border-transparent hover:border-gray-200'}`}
    >
      <div className="flex flex-col gap-1 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          draggable
          onDragStart={(e) => {
            dragEnabledRef.current = true;
            handleDragStart(e);
          }}
          className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 select-none"
          title="拖拽排序"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => removeBlock(block.id)}
          className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"
          title="删除块"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 min-w-0 select-text">{children}</div>
    </div>
  );
}
