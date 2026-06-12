import { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X, Link2 } from 'lucide-react';
import { readFileAsBase64, validateImageFile } from '../../utils/fileUtils';
import { PLACEHOLDER_IMAGE } from '../../utils/blockUtils';
import { cn } from '../../lib/utils';

interface CoverUploaderProps {
  value: string;
  onChange: (value: string) => void;
}

export function CoverUploader({ value, onChange }: CoverUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlMode, setUrlMode] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [imageError, setImageError] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateImageFile(file)) {
      alert('请上传小于 5MB 的图片文件');
      return;
    }
    try {
      setUploading(true);
      const base64 = await readFileAsBase64(file);
      onChange(base64);
      setImageError(false);
    } catch {
      alert('文件读取失败');
    } finally {
      setUploading(false);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlConfirm = () => {
    if (urlValue.trim()) {
      onChange(urlValue.trim());
      setImageError(false);
    }
    setUrlMode(false);
    setUrlValue('');
  };

  const handleRemove = () => {
    onChange('');
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const displayUrl = imageError || !value ? PLACEHOLDER_IMAGE : value;
  const hasValue = !!value && !imageError;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">封面图</label>
      <div className="flex gap-4 items-start">
        <div
          className={cn(
            'w-48 h-28 rounded-lg border-2 border-dashed overflow-hidden flex items-center justify-center bg-gray-50 relative',
            hasValue ? 'border-gray-200' : 'border-gray-300'
          )}
        >
          {uploading ? (
            <div className="text-sm text-gray-500">上传中...</div>
          ) : hasValue ? (
            <>
              <img
                src={displayUrl}
                alt="封面图"
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity"
                aria-label="删除封面图"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <ImageIcon className="w-8 h-8" />
              <span className="text-xs">暂无封面</span>
            </div>
          )}
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              disabled={uploading}
            >
              <Upload className="w-4 h-4" />
              本地上传
            </button>
            <button
              type="button"
              onClick={() => {
                setUrlMode(!urlMode);
                if (!urlMode) setUrlValue(value || '');
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Link2 className="w-4 h-4" />
              链接输入
            </button>
          </div>
          {urlMode && (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                placeholder="请输入图片 URL"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUrlConfirm();
                }}
              />
              <button
                type="button"
                onClick={handleUrlConfirm}
                className="px-3 py-2 text-sm font-medium bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                确定
              </button>
            </div>
          )}
          <p className="text-xs text-gray-500">
            支持 JPG/PNG/GIF/WebP/SVG，单张最大 5MB
          </p>
        </div>
      </div>
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
