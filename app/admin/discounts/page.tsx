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

export default function AdminDiscountsPage() {
  const { authChecked, isAuthenticated, password, setPassword, authError, login } = useAdminGate();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 10,
    max_uses: '' as string | number,
    minimum_order_amount: 0,
    applicable_categories: '' as string,
    expiry_date: '',
    status: 'active',
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/discounts');
      const data = await res.json();
      if (res.ok) setRows(data.discounts || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const cats = form.applicable_categories
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await fetch('/api/admin/discounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: form.value,
        max_uses: form.max_uses === '' ? null : Number(form.max_uses),
        minimum_order_amount: form.minimum_order_amount,
        applicable_categories: cats,
        expiry_date: form.expiry_date || null,
        status: form.status,
      }),
    });
    if (res.ok) {
      setForm({
        code: '',
        type: 'percentage',
        value: 10,
        max_uses: '',
        minimum_order_amount: 0,
        applicable_categories: '',
        expiry_date: '',
        status: 'active',
      });
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this code?')) return;
    await fetch(`/api/admin/discounts/${id}`, { method: 'DELETE' });
    load();
  };

  if (!authChecked) return <div className="p-8 text-center">Loading…</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <form onSubmit={login} className="bg-white p-8 rounded-xl shadow max-w-sm w-full space-y-4">
          <h1 className="text-xl font-bold">Admin — Discount codes</h1>
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
        <Link href="/admin/orders" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-1" /> Admin
        </Link>
        <h1 className="text-3xl font-bold">Discount codes</h1>

        <form onSubmit={create} className="bg-white rounded-xl shadow p-6 grid gap-3 md:grid-cols-2">
          <Input
            placeholder="CODE"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            required
          />
          <select
            className="border rounded-md px-3 py-2"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as 'percentage' | 'fixed' })}
          >
            <option value="percentage">percentage</option>
            <option value="fixed">fixed (£)</option>
          </select>
          <Input
            type="number"
            placeholder="Value (% or £)"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
          />
          <Input
            type="number"
            placeholder="Max uses (empty = unlimited)"
            value={form.max_uses}
            onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Minimum order £"
            value={form.minimum_order_amount}
            onChange={(e) => setForm({ ...form, minimum_order_amount: Number(e.target.value) })}
          />
          <Input
            placeholder="Categories (comma, slugs e.g. soaps,teas)"
            value={form.applicable_categories}
            onChange={(e) => setForm({ ...form, applicable_categories: e.target.value })}
            className="md:col-span-2"
          />
          <Input
            type="datetime-local"
            value={form.expiry_date}
            onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
          />
          <select
            className="border rounded-md px-3 py-2"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="expired">expired</option>
          </select>
          <Button type="submit" className="md:col-span-2 bg-[#D4AF37] text-black">
            Create code
          </Button>
        </form>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 border-b flex justify-between">
            <h2 className="font-semibold">Codes</h2>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              Refresh
            </Button>
          </div>
          <div className="divide-y max-h-[520px] overflow-auto text-sm">
            {rows.map((r) => (
              <div key={r.id} className="p-4 flex flex-col md:flex-row md:justify-between gap-2">
                <div>
                  <p className="font-mono font-bold">{r.code}</p>
                  <p className="text-gray-600">
                    {r.type} {r.value} · uses {r.current_uses}
                    {r.max_uses != null ? ` / ${r.max_uses}` : ''} · orders {r.orders_with_code ?? 0} · revenue
                    on orders £{r.revenue_on_discounted_orders ?? 0}
                  </p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => remove(r.id)}>
                  Delete
                </Button>
              </div>
            ))}
            {!rows.length && !loading && <p className="p-6 text-gray-500">No codes.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
