import { create } from 'zustand';
import type {
  ArticleDraft,
  ArticleBlock,
  BlockType,
  ToastMessage,
} from '../types/article';
import { MAX_BLOCKS, MAX_SUMMARY_LENGTH, MAX_ALERT_LENGTH } from '../types/article';
import { createBlock, reorderBlocks, deepCloneDraft, generateBlockId } from '../utils/blockUtils';

interface EditorStore extends EditorState {
  history: {
    past: ArticleDraft[];
    future: ArticleDraft[];
  };
  setDraft: (draft: ArticleDraft) => void;
  setTitle: (title: string) => void;
  setSummary: (summary: string) => void;
  setCoverImage: (coverImage: string) => void;
  updateBlock: (id: string, updates: Partial<ArticleBlock>) => void;
  addBlock: (type: BlockType) => boolean;
  removeBlock: (id: string) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
  showToast: (type: ToastMessage['type'], message: string) => void;
  hideToast: () => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveDraft: () => Promise<boolean>;
  loadDraft: (id: string) => Promise<void>;
}

interface EditorState {
  draft: ArticleDraft;
  isDirty: boolean;
  isSaving: boolean;
  toast: ToastMessage | null;
  lastSavedDraft: ArticleDraft | null;
}

const HISTORY_LIMIT = 20;

const emptyDraft: ArticleDraft = {
  id: '',
  title: '',
  summary: '',
  coverImage: '',
  blocks: [],
  updatedAt: new Date().toISOString(),
};

const createEmptyBlock = (type: BlockType, order: number): ArticleBlock => {
  return createBlock(type, order);
};

const pushToHistory = (
  past: ArticleDraft[],
  draft: ArticleDraft,
  limit: number
): ArticleDraft[] => {
  const next = [...past, deepCloneDraft(draft)];
  if (next.length > limit) {
    return next.slice(next.length - limit);
  }
  return next;
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  draft: emptyDraft,
  isDirty: false,
  isSaving: false,
  toast: null,
  lastSavedDraft: null,
  history: { past: [], future: [] },
  canUndo: false,
  canRedo: false,

  setDraft: (draft) => {
    set({ draft: deepCloneDraft(draft), lastSavedDraft: deepCloneDraft(draft), isDirty: false });
  },

  setTitle: (title) => {
    const { draft, pushHistory } = get();
    if (draft.title === title) return;
    pushHistory();
    set({
      draft: { ...draft, title, updatedAt: new Date().toISOString() },
      isDirty: true,
    });
  },

  setSummary: (summary) => {
    const { draft, pushHistory } = get();
    if (draft.summary === summary) return;
    if (summary.length > MAX_SUMMARY_LENGTH) {
      summary = summary.slice(0, MAX_SUMMARY_LENGTH);
    }
    pushHistory();
    set({
      draft: { ...draft, summary, updatedAt: new Date().toISOString() },
      isDirty: true,
    });
  },

  setCoverImage: (coverImage) => {
    const { draft, pushHistory } = get();
    if (draft.coverImage === coverImage) return;
    pushHistory();
    set({
      draft: { ...draft, coverImage, updatedAt: new Date().toISOString() },
      isDirty: true,
    });
  },

  updateBlock: (id, updates) => {
    const { draft, pushHistory } = get();
    const blockIndex = draft.blocks.findIndex((b) => b.id === id);
    if (blockIndex === -1) return;

    const block = draft.blocks[blockIndex];
    let finalUpdates = updates;

    if ((block.type === 'tip' || block.type === 'warning') && updates.content !== undefined) {
      let content = updates.content;
      if (content.length > MAX_ALERT_LENGTH) {
        content = content.slice(0, MAX_ALERT_LENGTH);
      }
      finalUpdates = { ...updates, content };
    }

    const newBlocks = [...draft.blocks];
    newBlocks[blockIndex] = { ...block, ...finalUpdates };

    pushHistory();
    set({
      draft: { ...draft, blocks: newBlocks, updatedAt: new Date().toISOString() },
      isDirty: true,
    });
  },

  addBlock: (type) => {
    const { draft, pushHistory, showToast } = get();
    if (draft.blocks.length >= MAX_BLOCKS) {
      showToast('warning', `块数量已达上限（${MAX_BLOCKS}），无法继续添加`);
      return false;
    }
    const newBlock = createEmptyBlock(type, draft.blocks.length);
    pushHistory();
    set({
      draft: {
        ...draft,
        blocks: [...draft.blocks, newBlock],
        updatedAt: new Date().toISOString(),
      },
      isDirty: true,
    });
    return true;
  },

  removeBlock: (id) => {
    const { draft, pushHistory } = get();
    const newBlocks = draft.blocks
      .filter((b) => b.id !== id)
      .map((b, i) => ({ ...b, order: i }));
    pushHistory();
    set({
      draft: { ...draft, blocks: newBlocks, updatedAt: new Date().toISOString() },
      isDirty: true,
    });
  },

  moveBlock: (fromIndex, toIndex) => {
    const { draft, pushHistory } = get();
    const newBlocks = reorderBlocks(draft.blocks, fromIndex, toIndex);
    pushHistory();
    set({
      draft: { ...draft, blocks: newBlocks, updatedAt: new Date().toISOString() },
      isDirty: true,
    });
  },

  setDirty: (dirty) => set({ isDirty: dirty }),
  setSaving: (saving) => set({ isSaving: saving }),

  showToast: (type, message) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    set({ toast: { id, type, message } });
    setTimeout(() => {
      const state = get();
      if (state.toast?.id === id) {
        set({ toast: null });
      }
    }, 3000);
  },

  hideToast: () => set({ toast: null }),

  pushHistory: () => {
    const { draft, history } = get();
    const snapshot = deepCloneDraft(draft);
    const newPast = pushToHistory(history.past, snapshot, HISTORY_LIMIT);
    set({
      history: { past: newPast, future: [] },
      canUndo: newPast.length > 0,
      canRedo: false,
    });
  },

  undo: () => {
    const { draft, history } = get();
    if (history.past.length === 0) return;
    const newPast = [...history.past];
    const previous = deepCloneDraft(newPast.pop()!);
    const newFuture = [deepCloneDraft(draft), ...history.future];
    set({
      draft: previous,
      history: { past: newPast, future: newFuture },
      isDirty: true,
      canUndo: newPast.length > 0,
      canRedo: newFuture.length > 0,
    });
  },

  redo: () => {
    const { draft, history } = get();
    if (history.future.length === 0) return;
    const newFuture = [...history.future];
    const next = deepCloneDraft(newFuture.shift()!);
    const newPast = [...history.past, deepCloneDraft(draft)];
    set({
      draft: next,
      history: { past: newPast, future: newFuture },
      isDirty: true,
      canUndo: newPast.length > 0,
      canRedo: newFuture.length > 0,
    });
  },

  saveDraft: async () => {
    const { draft, showToast, setDirty, setSaving } = get();
    if (!draft.title.trim()) {
      showToast('error', '文章标题不能为空');
      return false;
    }
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const payload = { ...draft, updatedAt: new Date().toISOString() };
      console.log('[Mock API] PUT /api/articles/:id/draft', payload);
      set({ lastSavedDraft: deepCloneDraft(payload), draft: payload });
      setDirty(false);
      showToast('success', '草稿保存成功');
      return true;
    } catch {
      showToast('error', '保存失败，请重试');
      return false;
    } finally {
      setSaving(false);
    }
  },

  loadDraft: async (id: string) => {
    try {
      const res = await fetch(`/mock/articles/sample-draft.json`);
      if (!res.ok) throw new Error('加载失败');
      const data = (await res.json()) as ArticleDraft;
      const draft: ArticleDraft = {
        ...data,
        id: id || data.id,
        blocks: data.blocks.map((b, i) => ({ ...b, order: i, id: b.id || generateBlockId() })),
      };
      set({
        draft: deepCloneDraft(draft),
        lastSavedDraft: deepCloneDraft(draft),
        isDirty: false,
        history: { past: [], future: [] },
        canUndo: false,
        canRedo: false,
      });
    } catch (err) {
      console.error('加载草稿失败:', err);
      const fallback: ArticleDraft = {
        id: id || `draft_${Date.now()}`,
        title: '',
        summary: '',
        coverImage: '',
        blocks: [],
        updatedAt: new Date().toISOString(),
      };
      set({
        draft: fallback,
        lastSavedDraft: deepCloneDraft(fallback),
        isDirty: false,
        history: { past: [], future: [] },
        canUndo: false,
        canRedo: false,
      });
      get().showToast('info', '已创建新草稿');
    }
  },
}));
