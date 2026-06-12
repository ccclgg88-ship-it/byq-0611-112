import type { ArticleBlock } from '../../types/article';
import { useEditorStore } from '../../store/editorStore';

interface HeadingBlockProps {
  block: ArticleBlock;
}

export function HeadingBlock({ block }: HeadingBlockProps) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const isH2 = block.type === 'h2';

  return (
    <input
      type="text"
      value={block.content}
      onChange={(e) => updateBlock(block.id, { content: e.target.value })}
      placeholder={isH2 ? '请输入二级标题...' : '请输入三级标题...'}
      className={`w-full bg-transparent border-none outline-none font-bold text-gray-900 placeholder-gray-400 ${
        isH2 ? 'text-2xl leading-tight py-1' : 'text-xl leading-snug py-0.5'
      }`}
    />
  );
}
