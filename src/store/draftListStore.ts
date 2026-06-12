import { create } from 'zustand';
import type {
  DraftListItem,
  DraftListQuery,
  DraftListResult,
  DraftStatus,
} from '../types/article';
import { DEFAULT_PAGE_SIZE } from '../types/article';
import { articleApi } from '../api/articleApi';

interface DraftListStore {
  items: DraftListItem[];
  total: number;
  loading: boolean;
  query: DraftListQuery;
  fetchList: () => Promise<void>;
  setKeyword: (keyword: string) => void;
  setStatus: (status: DraftStatus | 'all') => void;
  setSort: (sortBy: DraftListQuery['sortBy'], sortOrder?: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  createDraft: (title?: string) => Promise<string | null>;
  copyDraft: (id: string) => Promise<string | null>;
  deleteDraft: (id: string) => Promise<boolean>;
}

const defaultQuery: DraftListQuery = {
  keyword: '',
  status: 'all',
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

export const useDraftListStore = create<DraftListStore>((set, get) => ({
  items: [],
  total: 0,
  loading: false,
  query: defaultQuery,

  fetchList: async () => {
    set({ loading: true });
    try {
      const result: DraftListResult = await articleApi.list(get().query);
      set({ items: result.items, total: result.total });
    } finally {
      set({ loading: false });
    }
  },

  setKeyword: (keyword) => {
    set({ query: { ...get().query, keyword, page: 1 } });
    get().fetchList();
  },

  setStatus: (status) => {
    set({ query: { ...get().query, status, page: 1 } });
    get().fetchList();
  },

  setSort: (sortBy, sortOrder) => {
    const current = get().query;
    let order = sortOrder;
    if (!order) {
      order = current.sortBy === sortBy && current.sortOrder === 'desc' ? 'asc' : 'desc';
    }
    set({ query: { ...current, sortBy, sortOrder: order } });
    get().fetchList();
  },

  setPage: (page) => {
    set({ query: { ...get().query, page } });
    get().fetchList();
  },

  setPageSize: (pageSize) => {
    set({ query: { ...get().query, pageSize, page: 1 } });
    get().fetchList();
  },

  createDraft: async (title) => {
    try {
      const draft = await articleApi.create(title);
      get().fetchList();
      return draft.id;
    } catch {
      return null;
    }
  },

  copyDraft: async (id) => {
    try {
      const copied = await articleApi.copy(id);
      get().fetchList();
      return copied.id;
    } catch {
      return null;
    }
  },

  deleteDraft: async (id) => {
    try {
      await articleApi.remove(id);
      const { query, total, fetchList } = get();
      const remainingAfterDelete = total - 1;
      const maxPage = Math.max(1, Math.ceil(remainingAfterDelete / query.pageSize));
      if (query.page > maxPage) {
        set({ query: { ...query, page: maxPage } });
      }
      fetchList();
      return true;
    } catch {
      return false;
    }
  },
}));
