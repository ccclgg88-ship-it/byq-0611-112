import { useState, useRef } from 'react';
import { Image as ImageIcon, Link2, Upload } from 'lucide-react';
import type { ArticleBlock } from '../../types/article';
import { useEditorStore } from '../../store/editorStore';
import { readFileAsBase64, validateImageFile } from '../../utils/fileUtils';
import { PLACEHOLDER_IMAGE } from '../../utils/blockUtils';

interface ImageBlockProps {
  block: ArticleBlock;
}

export function ImageBlock({ block }: ImageBlockProps) {
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const [imageError, setImageError] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateImageFile(file)) return;
    try {
      const base64 = await readFileAsBase64(file);
      updateBlock(block.id, { content: base64, meta: { ...block.meta, alt: file.name } });
      setImageError(false);
    } catch {
      /* file read error */
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUrlConfirm = () => {
    if (urlValue.trim()) {
      updateBlock(block.id, { content: urlValue.trim() });
      setImageError(false);
    }
    setUrlMode(false);
    setUrlValue('');
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const displaySrc = imageError || !block.content ? PLACEHOLDER_IMAGE : block.content;

  return (
    <div className="space-y-2">
      <div className="relative rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
        <img
          src={displaySrc}
          alt={block.meta.alt || '图片'}
          className="w-full max-h-64 object-contain"
          onError={handleImageError}
        />
        {(!block.content || imageError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <ImageIcon className="w-8 h-8 mb-1" />
            <span className="text-sm">{imageError ? '图片加载失败' : '请添加图片'}</span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          上传
        </button>
        <button
          type="button"
          onClick={() => {
            setUrlMode(!urlMode);
            if (!urlMode) setUrlValue(block.content || '');
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Link2 className="w-3.5 h-3.5" />
          URL
        </button>
      </div>
      {urlMode && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            placeholder="输入图片 URL"
            className="flex-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            onKeyDown={(e) => { if (e.key === 'Enter') handleUrlConfirm(); }}
          />
          <button
            type="button"
            onClick={handleUrlConfirm}
            className="px-3 py-1.5 text-xs font-medium bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
          >
            确定
          </button>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
