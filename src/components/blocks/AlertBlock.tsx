import type { ArticleBlock } from '../../types/article';
import { useEditorStore } from '../../store/editorStore';
import { MAX_ALERT_LENGTH } from '../../types/article';
import { cn } from '../../lib/utils';

interface AlertBlockProps {
  block: ArticleBlock;
}

export function AlertBlock({ block }: AlertBlockProps) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const isTip = block.type === 'tip';
  const charCount = block.content.length;
  const isOverLimit = charCount > MAX_ALERT_LENGTH;

  return (
    <div
      className={cn(
        'rounded-lg border-l-4 p-3',
        isTip
          ? 'bg-blue-50 border-blue-400'
          : 'bg-amber-50 border-amber-400'
      )}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className={cn('text-sm font-bold', isTip ? 'text-blue-700' : 'text-amber-700')}>
          {isTip ? '💡 温馨提示' : '⚠️ 注意事项'}
        </span>
      </div>
      <textarea
        value={block.content}
        onChange={(e) => {
          let val = e.target.value;
          if (val.length > MAX_ALERT_LENGTH) {
            val = val.slice(0, MAX_ALERT_LENGTH);
          }
          updateBlock(block.id, { content: val });
        }}
        placeholder={isTip ? '请输入温馨提示内容...' : '请输入注意事项内容...'}
        rows={Math.max(2, block.content.split('\n').length)}
        className={cn(
          'w-full bg-transparent border-none outline-none resize-none text-sm leading-relaxed placeholder-gray-400',
          isTip ? 'text-blue-900' : 'text-amber-900'
        )}
      />
      <div className={cn(
        'text-right text-xs mt-1',
        isOverLimit ? 'text-red-500 font-medium' : 'text-gray-400'
      )}>
        {charCount}/{MAX_ALERT_LENGTH}
      </div>
    </div>
  );
}
