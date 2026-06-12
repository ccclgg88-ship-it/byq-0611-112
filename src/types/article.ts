export type BlockType =
  | 'h2'
  | 'h3'
  | 'paragraph'
  | 'ordered-list'
  | 'unordered-list'
  | 'image'
  | 'tip'
  | 'warning';

export type DraftStatus = 'draft' | 'published' | 'archived';

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
  status: DraftStatus;
  wordCount: number;
  blockCount: number;
  updatedAt: string;
  createdAt: string;
}

export interface DraftListItem {
  id: string;
  title: string;
  summary: string;
  coverImage: string;
  status: DraftStatus;
  blockCount: number;
  wordCount: number;
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

export interface DraftListQuery {
  keyword: string;
  status: DraftStatus | 'all';
  sortBy: 'updatedAt' | 'title' | 'wordCount';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface DraftListResult {
  items: DraftListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export const MAX_BLOCKS = 200;
export const MAX_SUMMARY_LENGTH = 120;
export const MAX_ALERT_LENGTH = 500;
export const HISTORY_STACK_LIMIT = 20;
export const DEBOUNCE_DELAY = 300;
export const DEFAULT_PAGE_SIZE = 10;

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

export const DRAFT_STATUS_LABELS: Record<DraftStatus, string> = {
  'draft': '草稿',
  'published': '已发布',
  'archived': '已归档',
};

export const DRAFT_STATUS_COLORS: Record<DraftStatus, string> = {
  'draft': 'bg-gray-100 text-gray-700 border-gray-200',
  'published': 'bg-green-50 text-green-700 border-green-200',
  'archived': 'bg-amber-50 text-amber-700 border-amber-200',
};
