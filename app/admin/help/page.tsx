'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function useAdminGate() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const authStatus = localStorage.getItem('admin_authenticated');
    const authTime = localStorage.getItem('admin_auth_time');
    if (authStatus === 'true' && authTime) {
      const ts = parseInt(authTime, 10);
      if (Date.now() - ts < 24 * 60 * 60 * 1000) setIsAuthenticated(true);
      else {
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_auth_time');
      }
    }
    setAuthChecked(true);
  }, []);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'alkemmy2024';
    if (password === expected) {
      localStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('admin_auth_time', Date.now().toString());
      setIsAuthenticated(true);
      setAuthError('');
    } else setAuthError('Invalid password');
  };

  return { authChecked, isAuthenticated, password, setPassword, authError, login };
}

export default function AdminHelpPage() {
  const { authChecked, isAuthenticated, password, setPassword, authError, login } = useAdminGate();
  const [rows, setRows] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    slug: '',
    title: '',
    excerpt: '',
    body: '',
    status: 'draft' as 'draft' | 'published',
    category_id: '' as string,
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/help-articles');
      const data = await res.json();
      if (res.ok) {
        setRows(data.articles || []);
        setCategories(data.categories || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/help-articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: form.slug,
        title: form.title,
        excerpt: form.excerpt || null,
        body: form.body,
        status: form.status,
        category_id: form.category_id || null,
      }),
    });
    if (res.ok) {
      setForm({ slug: '', title: '', excerpt: '', body: '', status: 'draft', category_id: '' });
      load();
    }
  };

  const publish = async (id: string) => {
    await fetch('/api/admin/help-articles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'published' }),
    });
    load();
  };

  if (!authChecked) return <div className="p-8 text-center text-slate-500">Loading…</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <form onSubmit={login} className="w-full max-w-sm space-y-4 rounded-xl border bg-white p-6 shadow">
          <h1 className="text-xl font-semibold">Admin — Help center</h1>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          {authError ? <p className="text-sm text-red-600">{authError}</p> : null}
          <Button type="submit" className="w-full">
            Unlock
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/discounts" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" /> Admin tools
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Help articles</h1>
        <p className="text-sm text-slate-600">Public site: /help — Crisp/Intercom for chat.</p>

        <form onSubmit={create} className="rounded-xl border bg-white p-6 shadow space-y-3">
          <h2 className="font-semibold">New article</h2>
          <Input placeholder="slug-url" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          <textarea
            className="w-full min-h-[120px] rounded-md border border-slate-300 p-2 text-sm"
            placeholder="Body (plain text)"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            required
          />
          <select
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          >
            <option value="">No category</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <select
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'published' })}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <Button type="submit">Save</Button>
        </form>

        <div className="rounded-xl border bg-white p-6 shadow">
          <h2 className="font-semibold mb-3">Existing ({loading ? '…' : rows.length})</h2>
          <ul className="divide-y">
            {rows.map((a: any) => (
              <li key={a.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{a.title}</div>
                  <div className="text-xs text-slate-500">
                    /help/{a.slug} — {a.status}
                  </div>
                </div>
                {a.status !== 'published' ? (
                  <Button size="sm" variant="outline" type="button" onClick={() => publish(a.id)}>
                    Publish
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
