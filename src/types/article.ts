export type BlockType =
  | 'h2'
  | 'h3'
  | 'paragraph'
  | 'ordered-list'
  | 'unordered-list'
  | 'image'
  | 'tip'
  | 'warning';

export interface BlockMeta {
  alt?: string;
  items?: string[];
}

export interface ArticleBlock {
  id: string;
  type: BlockType;
  content: string;
  meta: BlockMeta;
  order: number;
}

export interface ArticleDraft {
  id: string;
  title: string;
  summary: string;
  coverImage: string;
  blocks: ArticleBlock[];
  updatedAt: string;
}

export interface EditorState {
  draft: ArticleDraft;
  isDirty: boolean;
  isSaving: boolean;
  toast: ToastMessage | null;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export interface HistoryState {
  past: ArticleDraft[];
  future: ArticleDraft[];
}

export const MAX_BLOCKS = 200;
export const MAX_SUMMARY_LENGTH = 120;
export const MAX_ALERT_LENGTH = 500;
export const HISTORY_STACK_LIMIT = 20;
export const DEBOUNCE_DELAY = 300;

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  'h2': '二级标题',
  'h3': '三级标题',
  'paragraph': '正文段落',
  'ordered-list': '有序列表',
  'unordered-list': '无序列表',
  'image': '图片占位',
  'tip': '温馨提示',
  'warning': '注意事项',
};
