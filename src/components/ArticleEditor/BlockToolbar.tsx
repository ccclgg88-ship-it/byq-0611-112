import { Heading2, Heading3, Type, List, ListOrdered, Image, Lightbulb, AlertTriangle } from 'lucide-react';
import type { BlockType } from '../../types/article';
import { BLOCK_TYPE_LABELS, MAX_BLOCKS } from '../../types/article';
import { useEditorStore } from '../../store/editorStore';

interface ToolbarItem {
  type: BlockType;
  icon: React.ReactNode;
}

const toolbarItems: ToolbarItem[] = [
  { type: 'h2', icon: <Heading2 className="w-4 h-4" /> },
  { type: 'h3', icon: <Heading3 className="w-4 h-4" /> },
  { type: 'paragraph', icon: <Type className="w-4 h-4" /> },
  { type: 'ordered-list', icon: <ListOrdered className="w-4 h-4" /> },
  { type: 'unordered-list', icon: <List className="w-4 h-4" /> },
  { type: 'image', icon: <Image className="w-4 h-4" /> },
  { type: 'tip', icon: <Lightbulb className="w-4 h-4" /> },
  { type: 'warning', icon: <AlertTriangle className="w-4 h-4" /> },
];

export function BlockToolbar() {
  const addBlock = useEditorStore((s) => s.addBlock);
  const blockCount = useEditorStore((s) => s.draft.blocks.length);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {toolbarItems.map((item) => (
        <button
          key={item.type}
          type="button"
          onClick={() => addBlock(item.type)}
          disabled={blockCount >= MAX_BLOCKS}
          title={`插入${BLOCK_TYPE_LABELS[item.type]}`}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {item.icon}
          {BLOCK_TYPE_LABELS[item.type]}
        </button>
      ))}
      <span className="ml-auto text-xs text-gray-400">
        {blockCount}/{MAX_BLOCKS}
      </span>
    </div>
  );
}
