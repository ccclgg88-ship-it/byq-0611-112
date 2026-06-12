import { Plus, Minus } from 'lucide-react';
import type { ArticleBlock } from '../../types/article';
import { useEditorStore } from '../../store/editorStore';

interface ListBlockProps {
  block: ArticleBlock;
}

export function ListBlock({ block }: ListBlockProps) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const items = block.meta.items || [''];
  const isOrdered = block.type === 'ordered-list';

  const updateItem = (idx: number, value: string) => {
    const newItems = [...items];
    newItems[idx] = value;
    updateBlock(block.id, { meta: { ...block.meta, items: newItems } });
  };

  const addItem = () => {
    updateBlock(block.id, { meta: { ...block.meta, items: [...items, ''] } });
  };

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== idx);
    updateBlock(block.id, { meta: { ...block.meta, items: newItems } });
  };

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-2 group">
          <span className="flex-shrink-0 w-6 text-gray-500 text-sm pt-2">
            {isOrdered ? `${idx + 1}.` : '•'}
          </span>
          <input
            type="text"
            value={item}
            onChange={(e) => updateItem(idx, e.target.value)}
            placeholder={`列表项 ${idx + 1}`}
            className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 py-1"
          />
          <button
            type="button"
            onClick={() => removeItem(idx)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 mt-1"
            disabled={items.length <= 1}
            title="删除此项"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 transition-colors ml-8"
      >
        <Plus className="w-3.5 h-3.5" />
        添加列表项
      </button>
    </div>
  );
}
