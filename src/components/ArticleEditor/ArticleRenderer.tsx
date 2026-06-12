import { useState } from 'react';
import type { ArticleDraft, ArticleBlock } from '../../types/article';
import { PLACEHOLDER_IMAGE } from '../../utils/blockUtils';
import { cn } from '../../lib/utils';
import { FileText } from 'lucide-react';

interface ArticleRendererProps {
  draft: ArticleDraft;
}

export function ArticleRenderer({ draft }: ArticleRendererProps) {
  return (
    <div className="article-renderer mx-auto" style={{ maxWidth: '720px' }}>
      {draft.coverImage && (
        <div className="mb-6 rounded-xl overflow-hidden shadow-sm">
          <img
            src={draft.coverImage}
            alt="封面图"
            className="w-full h-auto object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
            }}
          />
        </div>
      )}

      {draft.title && (
        <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-3">
          {draft.title}
        </h1>
      )}

      {draft.summary && (
        <p className="text-sm text-gray-500 leading-relaxed mb-6 pl-3 border-l-2 border-orange-300">
          {draft.summary}
        </p>
      )}

      {draft.blocks.length === 0 ? (
        <EmptyPreview />
      ) : (
        <div className="space-y-4">
          {draft.blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyPreview() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <FileText className="w-12 h-12 mb-3 stroke-1" />
      <p className="text-sm font-medium">暂无正文内容</p>
      <p className="text-xs mt-1">在左侧编辑器中添加内容块，即可在此预览</p>
    </div>
  );
}

function BlockRenderer({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case 'h2':
      return <H2Renderer content={block.content} />;
    case 'h3':
      return <H3Renderer content={block.content} />;
    case 'paragraph':
      return <ParagraphRenderer content={block.content} />;
    case 'ordered-list':
      return <OrderedListRenderer items={block.meta.items || []} />;
    case 'unordered-list':
      return <UnorderedListRenderer items={block.meta.items || []} />;
    case 'image':
      return <ImageRenderer content={block.content} alt={block.meta.alt || ''} />;
    case 'tip':
      return <AlertRenderer type="tip" content={block.content} />;
    case 'warning':
      return <AlertRenderer type="warning" content={block.content} />;
    default:
      return null;
  }
}

function H2Renderer({ content }: { content: string }) {
  if (!content) return null;
  return (
    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3 pb-2 border-b border-gray-100">
      {content}
    </h2>
  );
}

function H3Renderer({ content }: { content: string }) {
  if (!content) return null;
  return (
    <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
      {content}
    </h3>
  );
}

function ParagraphRenderer({ content }: { content: string }) {
  if (!content) return null;
  return (
    <p className="text-base text-gray-700 leading-relaxed">
      {content.split('\n').map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {line}
        </span>
      ))}
    </p>
  );
}

function OrderedListRenderer({ items }: { items: string[] }) {
  const validItems = items.filter((item) => item.trim());
  if (validItems.length === 0) return null;
  return (
    <ol className="list-decimal list-inside space-y-1.5 text-base text-gray-700 pl-1">
      {validItems.map((item, i) => (
        <li key={i} className="leading-relaxed">{item}</li>
      ))}
    </ol>
  );
}

function UnorderedListRenderer({ items }: { items: string[] }) {
  const validItems = items.filter((item) => item.trim());
  if (validItems.length === 0) return null;
  return (
    <ul className="list-disc list-inside space-y-1.5 text-base text-gray-700 pl-1">
      {validItems.map((item, i) => (
        <li key={i} className="leading-relaxed">{item}</li>
      ))}
    </ul>
  );
}

function ImageRenderer({ content, alt }: { content: string; alt: string }) {
  const [error, setError] = useState(false);

  if (!content) return null;

  return (
    <div className="rounded-lg overflow-hidden my-2">
      <img
        src={error ? PLACEHOLDER_IMAGE : content}
        alt={alt || '图片'}
        className="w-full h-auto"
        onError={() => setError(true)}
      />
    </div>
  );
}

function AlertRenderer({ type, content }: { type: 'tip' | 'warning'; content: string }) {
  if (!content) return null;
  const isTip = type === 'tip';

  return (
    <div
      className={cn(
        'rounded-lg border-l-4 p-4 my-3',
        isTip ? 'bg-blue-50 border-blue-400' : 'bg-amber-50 border-amber-400'
      )}
    >
      <div className={cn(
        'text-sm font-bold mb-1',
        isTip ? 'text-blue-700' : 'text-amber-700'
      )}>
        {isTip ? '💡 温馨提示' : '⚠️ 注意事项'}
      </div>
      <div className={cn(
        'text-sm leading-relaxed',
        isTip ? 'text-blue-800' : 'text-amber-800'
      )}>
        {content.split('\n').map((line, i) => (
          <span key={i}>
            {i > 0 && <br />}
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}
