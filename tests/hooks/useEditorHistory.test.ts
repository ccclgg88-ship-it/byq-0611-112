import { renderHook, act } from '@testing-library/react';
import { useEditorHistory } from '../../src/hooks/useEditorHistory';
import type { ArticleDraft } from '../../src/types/article';

const createDraft = (title: string, blocks?: ArticleDraft['blocks']): ArticleDraft => ({
  id: 'test-draft',
  title,
  summary: '',
  coverImage: '',
  blocks: blocks || [],
  updatedAt: new Date().toISOString(),
});

describe('useEditorHistory', () => {
  it('should push history and undo to restore previous state', () => {
    const { result } = renderHook(() => useEditorHistory());

    const draft1 = createDraft('First');
    const draft2 = createDraft('Second');

    act(() => {
      result.current.pushHistory(draft1);
    });

    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);

    let restored: ArticleDraft | null = null;
    act(() => {
      restored = result.current.undo(draft2);
    });

    expect(restored).not.toBeNull();
    expect(restored!.title).toBe('First');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it('should redo after undo to restore forward state', () => {
    const { result } = renderHook(() => useEditorHistory());

    const draft1 = createDraft('First');
    const draft2 = createDraft('Second');
    const draft3 = createDraft('Third');

    act(() => {
      result.current.pushHistory(draft1);
      result.current.pushHistory(draft2);
    });

    act(() => {
      const restored = result.current.undo(draft3);
      expect(restored!.title).toBe('Second');
    });

    expect(result.current.canRedo).toBe(true);

    act(() => {
      const restored = result.current.redo(draft3);
      expect(restored!.title).toBe('Third');
    });

    expect(result.current.canRedo).toBe(false);
  });

  it('should return null when undo with empty past', () => {
    const { result } = renderHook(() => useEditorHistory());

    expect(result.current.canUndo).toBe(false);

    let restored: ArticleDraft | null = null;
    act(() => {
      restored = result.current.undo(createDraft('Current'));
    });

    expect(restored).toBeNull();
  });

  it('should return null when redo with empty future', () => {
    const { result } = renderHook(() => useEditorHistory());

    expect(result.current.canRedo).toBe(false);

    let restored: ArticleDraft | null = null;
    act(() => {
      restored = result.current.redo(createDraft('Current'));
    });

    expect(restored).toBeNull();
  });

  it('should clear history', () => {
    const { result } = renderHook(() => useEditorHistory());

    act(() => {
      result.current.pushHistory(createDraft('A'));
      result.current.pushHistory(createDraft('B'));
    });

    expect(result.current.past.length).toBe(2);

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.past.length).toBe(0);
    expect(result.current.future.length).toBe(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('should limit history stack to 20 entries', () => {
    const { result } = renderHook(() => useEditorHistory());

    act(() => {
      for (let i = 0; i < 25; i++) {
        result.current.pushHistory(createDraft(`Draft ${i}`));
      }
    });

    expect(result.current.past.length).toBe(20);
  });

  it('should clear future when pushing new history after undo', () => {
    const { result } = renderHook(() => useEditorHistory());

    act(() => {
      result.current.pushHistory(createDraft('A'));
      result.current.pushHistory(createDraft('B'));
    });

    act(() => {
      result.current.undo(createDraft('C'));
    });

    expect(result.current.future.length).toBe(1);

    act(() => {
      result.current.pushHistory(createDraft('D'));
    });

    expect(result.current.future.length).toBe(0);
    expect(result.current.canRedo).toBe(false);
  });

  it('should deep clone snapshots to prevent mutation', () => {
    const { result } = renderHook(() => useEditorHistory());

    const draft = createDraft('Original', [{ id: 'b1', type: 'paragraph', content: 'Hello', meta: {}, order: 0 }]);

    act(() => {
      result.current.pushHistory(draft);
    });

    draft.title = 'Mutated';
    draft.blocks[0].content = 'Mutated';

    const pastEntry = result.current.past[0];
    expect(pastEntry.title).toBe('Original');
    expect(pastEntry.blocks[0].content).toBe('Hello');
  });
});
