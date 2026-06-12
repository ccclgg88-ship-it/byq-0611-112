import type { ArticleDraft, DraftListItem, DraftListQuery, DraftListResult, DraftStatus } from '../types/article';
import { generateBlockId, deepCloneDraft } from '../utils/blockUtils';
import { sampleDraft } from '../mock/sampleDraft';

const STORAGE_KEY = 'article_drafts_mock';
const LATENCY_MS = 300;

const loadFromStorage = (): ArticleDraft[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* storage read error */
  }
  const initial = seedDrafts();
  saveToStorage(initial);
  return initial;
};

const saveToStorage = (drafts: ArticleDraft[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    /* storage write error */
  }
};

const seedDrafts = (): ArticleDraft[] => {
  const drafts: ArticleDraft[] = [];
  const now = Date.now();

  drafts.push({
    ...sampleDraft,
    status: 'draft',
    wordCount: 650,
    blockCount: sampleDraft.blocks.length,
    createdAt: new Date(now - 7 * 24 * 3600 * 1000).toISOString(),
  });

  const titles = [
    { title: '家居收纳整理完全指南：让家变大一倍的20个技巧', status: 'published' as DraftStatus, words: 2300, blocks: 18 },
    { title: '厨房清洁全攻略：油污克星大揭秘', status: 'published' as DraftStatus, words: 1500, blocks: 12 },
    { title: '衣物保养小百科：不同面料的洗护方法', status: 'draft' as DraftStatus, words: 800, blocks: 8 },
    { title: '绿植养护入门：新手也能养活的10种植物', status: 'draft' as DraftStatus, words: 420, blocks: 5 },
    { title: '家电选购指南：买前必看的避坑清单', status: 'archived' as DraftStatus, words: 3200, blocks: 25 },
    { title: '卫生间除味除湿全方案', status: 'archived' as DraftStatus, words: 680, blocks: 7 },
    { title: '夏日清凉生活：省电又降温的生活妙招', status: 'published' as DraftStatus, words: 1100, blocks: 10 },
    { title: '冬季保暖小物推荐：从脚暖到心', status: 'draft' as DraftStatus, words: 280, blocks: 3 },
    { title: '宠物家庭清洁：毛发异味一网打尽', status: 'draft' as DraftStatus, words: 520, blocks: 6 },
    { title: '租房改造：低成本打造温馨小窝', status: 'published' as DraftStatus, words: 1800, blocks: 15 },
    { title: '断舍离实践：极简生活从这里开始', status: 'archived' as DraftStatus, words: 980, blocks: 9 },
    { title: '厨房收纳：调料罐与锅具的黄金布局', status: 'draft' as DraftStatus, words: 340, blocks: 4 },
  ];

  for (let i = 0; i < titles.length; i++) {
    const t = titles[i];
    const draft: ArticleDraft = {
      id: `mock_draft_${String(i + 1).padStart(3, '0')}`,
      title: t.title,
      summary: `本文整理了${t.title}的实用技巧，帮助你轻松应对生活中的各种小问题，让居家生活更舒适、更高效。`,
      coverImage: '',
      blocks: generateMockBlocks(t.blocks),
      status: t.status,
      wordCount: t.words,
      blockCount: t.blocks,
      updatedAt: new Date(now - (i + 1) * 12 * 3600 * 1000).toISOString(),
      createdAt: new Date(now - (i + 5) * 24 * 3600 * 1000).toISOString(),
    };
    drafts.push(draft);
  }

  return drafts;
};

const generateMockBlocks = (count: number): ArticleDraft['blocks'] => {
  const blocks: ArticleDraft['blocks'] = [];
  for (let i = 0; i < count; i++) {
    blocks.push({
      id: generateBlockId(),
      type: i % 3 === 0 ? 'h2' : 'paragraph',
      content: `第${i + 1}段内容的示例文字，用于展示列表效果。`,
      meta: {},
      order: i,
    });
  }
  return blocks;
};

const calcWordCount = (draft: ArticleDraft): number => {
  let count = 0;
  for (const block of draft.blocks) {
    count += block.content.length;
    if (block.meta.items) {
      count += block.meta.items.reduce((s, item) => s + item.length, 0);
    }
  }
  return count;
};

const toListItem = (draft: ArticleDraft): DraftListItem => ({
  id: draft.id,
  title: draft.title,
  summary: draft.summary,
  coverImage: draft.coverImage,
  status: draft.status,
  blockCount: draft.blockCount || draft.blocks.length,
  wordCount: draft.wordCount || calcWordCount(draft),
  updatedAt: draft.updatedAt,
});

const delay = <T>(data: T, ms = LATENCY_MS): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

export const articleApi = {
  async list(query: DraftListQuery): Promise<DraftListResult> {
    const drafts = loadFromStorage();
    let filtered = drafts;

    if (query.keyword.trim()) {
      const kw = query.keyword.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(kw) ||
          d.summary.toLowerCase().includes(kw)
      );
    }

    if (query.status !== 'all') {
      filtered = filtered.filter((d) => d.status === query.status);
    }

    const sorted = [...filtered].sort((a, b) => {
      let va: string | number = '';
      let vb: string | number = '';
      switch (query.sortBy) {
        case 'title':
          va = a.title;
          vb = b.title;
          break;
        case 'wordCount':
          va = a.wordCount;
          vb = b.wordCount;
          break;
        case 'updatedAt':
        default:
          va = new Date(a.updatedAt).getTime();
          vb = new Date(b.updatedAt).getTime();
      }
      if (va < vb) return query.sortOrder === 'asc' ? -1 : 1;
      if (va > vb) return query.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = sorted.length;
    const start = (query.page - 1) * query.pageSize;
    const pageItems = sorted.slice(start, start + query.pageSize).map(toListItem);

    return delay({
      items: pageItems,
      total,
      page: query.page,
      pageSize: query.pageSize,
    });
  },

  async get(id: string): Promise<ArticleDraft | null> {
    const drafts = loadFromStorage();
    const draft = drafts.find((d) => d.id === id) || null;
    return delay(draft ? deepCloneDraft(draft) : null);
  },

  async save(id: string, data: Partial<ArticleDraft>): Promise<ArticleDraft> {
    const drafts = loadFromStorage();
    const idx = drafts.findIndex((d) => d.id === id);

    if (idx === -1) {
      const now = new Date().toISOString();
      const newDraft: ArticleDraft = {
        id,
        title: data.title || '',
        summary: data.summary || '',
        coverImage: data.coverImage || '',
        blocks: data.blocks || [],
        status: data.status || 'draft',
        wordCount: data.wordCount || 0,
        blockCount: data.blockCount || (data.blocks?.length ?? 0),
        updatedAt: now,
        createdAt: data.createdAt || now,
      };
      drafts.unshift(newDraft);
      saveToStorage(drafts);
      return delay(deepCloneDraft(newDraft));
    }

    const updated: ArticleDraft = {
      ...drafts[idx],
      ...data,
      id: drafts[idx].id,
      updatedAt: new Date().toISOString(),
    };
    updated.blockCount = updated.blocks.length;
    updated.wordCount = calcWordCount(updated);

    drafts[idx] = updated;
    saveToStorage(drafts);
    return delay(deepCloneDraft(updated));
  },

  async create(title = '未命名草稿'): Promise<ArticleDraft> {
    const id = `draft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const draft: ArticleDraft = {
      id,
      title,
      summary: '',
      coverImage: '',
      blocks: [],
      status: 'draft',
      wordCount: 0,
      blockCount: 0,
      updatedAt: now,
      createdAt: now,
    };
    const drafts = loadFromStorage();
    drafts.unshift(draft);
    saveToStorage(drafts);
    return delay(deepCloneDraft(draft));
  },

  async copy(id: string): Promise<ArticleDraft> {
    const drafts = loadFromStorage();
    const source = drafts.find((d) => d.id === id);
    if (!source) throw new Error('草稿不存在');

    const newId = `draft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const copied: ArticleDraft = {
      ...deepCloneDraft(source),
      id: newId,
      title: `${source.title} - 副本`,
      status: 'draft',
      updatedAt: now,
      createdAt: now,
    };
    drafts.unshift(copied);
    saveToStorage(drafts);
    return delay(copied);
  },

  async remove(id: string): Promise<void> {
    const drafts = loadFromStorage();
    const filtered = drafts.filter((d) => d.id !== id);
    saveToStorage(filtered);
    return delay(undefined);
  },
};
