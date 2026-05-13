import Link from 'next/link';
import { getCheckoutFunnelReport } from '@/lib/analytics/funnel';
import { adminSupabase } from '@/lib/admin-supabase';

export const metadata = {
  title: 'Analytics | Alkhemmy',
  description: 'First-party funnel + GA4 guidance.',
};

async function getEventTotals() {
  try {
    const { count, error } = await adminSupabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true });
    if (error) return { total: 0 };
    return { total: count ?? 0 };
  } catch {
    return { total: 0 };
  }
}

export default async function AnalyticsDashboardPage() {
  const funnel = await getCheckoutFunnelReport(168);
  const { total } = await getEventTotals();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analytics & tracking</h1>
            <p className="text-sm text-slate-600">
              GA4 for acquisition + first-party <code className="text-xs">analytics_events</code> for funnels.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/empire-os" className="rounded-lg border px-3 py-2 text-sm">
              Empire OS
            </Link>
            <Link href="/admin" className="rounded-lg bg-[#D4AF37] px-3 py-2 text-sm font-semibold text-black">
              Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">GA4 dashboards (console)</h2>
          <p className="mt-2 text-sm text-slate-600">
            In Google Analytics: <strong>Reports → Monetization → Ecommerce purchases</strong>,{' '}
            <strong>Advertising → Attribution</strong> for source/medium, and <strong>Explore</strong> for funnels,
            cohorts, and AOV. Set <code className="text-xs">NEXT_PUBLIC_GA_MEASUREMENT_ID</code> in env.
          </p>
          <ul className="mt-3 list-inside list-disc text-sm text-slate-600">
            <li>Revenue by source / medium</li>
            <li>Conversion funnel (Explore)</li>
            <li>Cart abandonment (begin_checkout vs purchase)</li>
            <li>Average order value (AOV)</li>
            <li>CAC requires ad cost import (Google Ads link)</li>
          </ul>
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">First-party events (7d funnel sample)</h2>
          <p className="text-sm text-slate-600">Rows in DB (all time): {total}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {funnel.steps.map((s) => (
              <div key={s.step} className="flex justify-between rounded-lg bg-slate-100 px-3 py-2 text-sm">
                <span className="font-mono text-slate-700">{s.step}</span>
                <span className="font-semibold">{s.count}</span>
              </div>
            ))}
          </div>
          {funnel.conversionRateViewToPurchase != null && (
            <p className="mt-4 text-sm text-slate-700">
              View → purchase (rough): <strong>{funnel.conversionRateViewToPurchase}%</strong>
            </p>
          )}
          {funnel.dropoff.length > 0 && (
            <div className="mt-3 text-sm text-amber-800">
              Drop-offs: {funnel.dropoff.map((d) => `${d.step} (${d.count})`).join(' · ')}
            </div>
          )}
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Sentry</h2>
          <p className="text-sm text-slate-600">
            Set <code className="text-xs">SENTRY_DSN</code> and <code className="text-xs">NEXT_PUBLIC_SENTRY_DSN</code>.
            Server SDK loads via <code className="text-xs">instrumentation.ts</code>. For full Next.js wiring (source
            maps, tunneling), run <code className="text-xs">npx @sentry/wizard@latest -i nextjs</code>.
          </p>
        </section>
      </main>
    </div>
  );
}
