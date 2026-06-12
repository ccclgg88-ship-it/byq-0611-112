import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { ToastMessage } from '../../types/article';
import { cn } from '../../lib/utils';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconStyles = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
};

interface ToastProps {
  toast: ToastMessage | null;
  onClose?: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (toast) {
      setCurrent(toast);
      setVisible(true);
    }
  }, [toast]);

  useEffect(() => {
    if (!visible && current) {
      const timer = setTimeout(() => {
        setCurrent(null);
        if (onClose) onClose();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [visible, current, onClose]);

  if (!current) return null;

  const Icon = icons[current.type];

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 transition-all duration-200',
        visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      )}
    >
      <div
        className={cn(
          'flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-sm',
          styles[current.type]
        )}
      >
        <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', iconStyles[current.type])} />
        <p className="flex-1 text-sm font-medium">{current.message}</p>
        <button
          onClick={() => setVisible(false)}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="关闭提示"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
