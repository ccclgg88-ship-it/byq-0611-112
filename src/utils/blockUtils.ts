import type { ArticleBlock, BlockType } from '../types/article';

export const generateBlockId = (): string => {
  return `block_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};

export const createBlock = (type: BlockType, order: number): ArticleBlock => {
  const block: ArticleBlock = {
    id: generateBlockId(),
    type,
    content: '',
    meta: {},
    order,
  };

  if (type === 'ordered-list' || type === 'unordered-list') {
    block.meta.items = [''];
  }

  if (type === 'image') {
    block.meta.alt = '';
  }

  return block;
};

export const reorderBlocks = (
  blocks: ArticleBlock[],
  fromIndex: number,
  toIndex: number
): ArticleBlock[] => {
  const newBlocks = [...blocks];
  const [removed] = newBlocks.splice(fromIndex, 1);
  newBlocks.splice(toIndex, 0, removed);
  return newBlocks.map((block, index) => ({ ...block, order: index }));
};

export const deepCloneDraft = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const validateImageUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) || url.startsWith('data:image/');
  } catch {
    return url.startsWith('data:image/');
  }
};

export const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22450%22%20viewBox%3D%220%200%20800%20450%22%3E%3Crect%20fill%3D%22%23f3f4f6%22%20width%3D%22800%22%20height%3D%22450%22%2F%3E%3Ctext%20fill%3D%22%239ca3af%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3E%E5%9B%BE%E7%89%87%E5%8A%A0%E8%BD%BD%E5%A4%B1%E8%B4%A5%3C%2Ftext%3E%3C%2Fsvg%3E';
