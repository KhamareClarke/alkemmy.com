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

export default function AdminBannersPage() {
  const { authChecked, isAuthenticated, password, setPassword, authError, login } = useAdminGate();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    cta_text: '',
    cta_link: '',
    background_color: '#111111',
    text_color: '#F4EBD0',
    placement: 'announcement_bar',
    status: 'active',
    order_priority: 0,
    start_date: '',
    end_date: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/banners');
      const data = await res.json();
      if (res.ok) setBanners(data.banners || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated]);

  const createBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      }),
    });
    if (res.ok) {
      setForm({
        title: '',
        description: '',
        image_url: '',
        cta_text: '',
        cta_link: '',
        background_color: '#111111',
        text_color: '#F4EBD0',
        placement: 'announcement_bar',
        status: 'active',
        order_priority: 0,
        start_date: '',
        end_date: '',
      });
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
    load();
  };

  if (!authChecked) {
    return <div className="p-8 text-center">Loading…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <form onSubmit={login} className="bg-white p-8 rounded-xl shadow max-w-sm w-full space-y-4">
          <h1 className="text-xl font-bold">Admin — Banners</h1>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          {authError && <p className="text-sm text-red-600">{authError}</p>}
          <Button type="submit" className="w-full">
            Unlock
          </Button>
          <Link href="/admin/orders" className="block text-center text-sm text-gray-600">
            Back to admin
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-1" /> Admin
          </Link>
        </div>

        <h1 className="text-3xl font-bold">Promotional banners</h1>
        <p className="text-gray-600 text-sm">
          CTR uses view_count and click_count from tracking calls. Run SQL migration in Supabase first.
        </p>

        <form onSubmit={createBanner} className="bg-white rounded-xl shadow p-6 grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="md:col-span-2"
          />
          <Input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="md:col-span-2"
          />
          <Input
            placeholder="Image URL"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className="md:col-span-2"
          />
          <Input
            placeholder="CTA text"
            value={form.cta_text}
            onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
          />
          <Input
            placeholder="CTA link"
            value={form.cta_link}
            onChange={(e) => setForm({ ...form, cta_link: e.target.value })}
          />
          <Input
            placeholder="Background"
            value={form.background_color}
            onChange={(e) => setForm({ ...form, background_color: e.target.value })}
          />
          <Input
            placeholder="Text color"
            value={form.text_color}
            onChange={(e) => setForm({ ...form, text_color: e.target.value })}
          />
          <select
            className="border rounded-md px-3 py-2"
            value={form.placement}
            onChange={(e) => setForm({ ...form, placement: e.target.value })}
          >
            <option value="hero">hero</option>
            <option value="sidebar">sidebar</option>
            <option value="footer">footer</option>
            <option value="announcement_bar">announcement_bar</option>
          </select>
          <select
            className="border rounded-md px-3 py-2"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="scheduled">scheduled</option>
          </select>
          <Input
            type="number"
            placeholder="Priority"
            value={form.order_priority}
            onChange={(e) => setForm({ ...form, order_priority: Number(e.target.value) })}
          />
          <Input
            type="datetime-local"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />
          <Input
            type="datetime-local"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
          <Button type="submit" className="md:col-span-2 bg-[#D4AF37] text-black">
            Create banner
          </Button>
        </form>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">All banners</h2>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              Refresh
            </Button>
          </div>
          <div className="divide-y max-h-[480px] overflow-auto">
            {banners.map((b) => (
              <div key={b.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <p className="font-medium">{b.title}</p>
                  <p className="text-xs text-gray-500">
                    {b.placement} · {b.status} · views {b.view_count} · clicks {b.click_count} · CTR{' '}
                    {b.ctr_percent ?? 0}%
                  </p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => remove(b.id)}>
                  Delete
                </Button>
              </div>
            ))}
            {!banners.length && !loading && (
              <p className="p-6 text-gray-500 text-sm">No banners yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
