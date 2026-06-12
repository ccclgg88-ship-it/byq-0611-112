import type { ArticleBlock } from '../../types/article';
import { useEditorStore } from '../../store/editorStore';

interface ParagraphBlockProps {
  block: ArticleBlock;
}

export function ParagraphBlock({ block }: ParagraphBlockProps) {
  const updateBlock = useEditorStore((s) => s.updateBlock);

  return (
    <textarea
      value={block.content}
      onChange={(e) => updateBlock(block.id, { content: e.target.value })}
      placeholder="请输入正文内容..."
      rows={Math.max(3, block.content.split('\n').length)}
      className="w-full bg-transparent border-none outline-none resize-none text-gray-700 leading-relaxed placeholder-gray-400 text-base py-1"
    />
  );
}
