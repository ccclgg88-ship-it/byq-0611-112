import { useEffect } from 'react';
import { useParams, useBlocker } from 'react-router-dom';
import { useEditorStore } from '../store/editorStore';
import { ArticleEditor } from '../components/ArticleEditor/ArticleEditor';

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const loadDraft = useEditorStore((s) => s.loadDraft);
  const isDirty = useEditorStore((s) => s.isDirty);
  const setDirty = useEditorStore((s) => s.setDirty);

  const blocker = useBlocker(isDirty);

  useEffect(() => {
    loadDraft(id || 'draft_default');
  }, [id, loadDraft]);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const confirmed = window.confirm('有未保存的变更，确定要离开吗？');
      if (confirmed) {
        setDirty(false);
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker, setDirty]);

  return <ArticleEditor />;
}
