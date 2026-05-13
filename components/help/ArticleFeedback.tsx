'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function ArticleFeedback({ articleId }: { articleId: string }) {
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  const send = async (isHelpful: boolean) => {
    setErr('');
    try {
      const res = await fetch('/api/help/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article_id: articleId, is_helpful: isHelpful }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr((j as { error?: string }).error || 'Could not save feedback');
        return;
      }
      setDone(true);
    } catch {
      setErr('Network error');
    }
  };

  if (done) {
    return <p className="text-sm text-slate-600">Thanks for your feedback.</p>;
  }

  return (
    <div className="mt-10 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-800 mb-2">Was this article helpful?</p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => send(true)}>
          Yes
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => send(false)}>
          No
        </Button>
      </div>
      {err ? <p className="text-sm text-red-600 mt-2">{err}</p> : null}
    </div>
  );
}
