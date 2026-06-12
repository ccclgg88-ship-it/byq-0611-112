import { useState, useCallback, useRef, useEffect } from 'react';
import type { ArticleDraft } from '../types/article';
import { HISTORY_STACK_LIMIT } from '../types/article';
import { deepCloneDraft } from '../utils/blockUtils';

export interface UseEditorHistoryReturn {
  past: ArticleDraft[];
  future: ArticleDraft[];
  canUndo: boolean;
  canRedo: boolean;
  pushHistory: (draft: ArticleDraft) => void;
  undo: (current: ArticleDraft) => ArticleDraft | null;
  redo: (current: ArticleDraft) => ArticleDraft | null;
  clearHistory: () => void;
}

export function useEditorHistory(initial?: ArticleDraft): UseEditorHistoryReturn {
  const [past, setPast] = useState<ArticleDraft[]>([]);
  const [future, setFuture] = useState<ArticleDraft[]>([]);
  const ignoreNextRef = useRef<boolean>(!!initial);

  useEffect(() => {
    if (initial && ignoreNextRef.current) {
      ignoreNextRef.current = false;
    }
  }, [initial]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const pushHistory = useCallback((draft: ArticleDraft) => {
    const snapshot = deepCloneDraft(draft);
    setPast((prev) => {
      const next = [...prev, snapshot];
      if (next.length > HISTORY_STACK_LIMIT) {
        return next.slice(next.length - HISTORY_STACK_LIMIT);
      }
      return next;
    });
    setFuture([]);
  }, []);

  const undo = useCallback((current: ArticleDraft): ArticleDraft | null => {
    if (past.length === 0) return null;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    setPast(newPast);
    setFuture((prev) => [...prev, deepCloneDraft(current)]);
    return deepCloneDraft(previous);
  }, [past]);

  const redo = useCallback((current: ArticleDraft): ArticleDraft | null => {
    if (future.length === 0) return null;
    const next = future[future.length - 1];
    const newFuture = future.slice(0, future.length - 1);
    setFuture(newFuture);
    setPast((prev) => [...prev, deepCloneDraft(current)]);
    return deepCloneDraft(next);
  }, [future]);

  const clearHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  return {
    past,
    future,
    canUndo,
    canRedo,
    pushHistory,
    undo,
    redo,
    clearHistory,
  };
}
