import Link from 'next/link';
import { EMPIRE_SKILLS, CATEGORY_LABELS } from '@/lib/empire-os/skills';
import { getEmpireMetrics } from '@/lib/empire-os/metrics';

export const metadata = {
  title: 'Empire OS | Alkhemmy',
  description: 'Autonomous commerce skills — signals, webhooks, and metrics.',
};

export default async function EmpireOsDashboardPage() {
  const metrics = await getEmpireMetrics();

  const byCat = ['A', 'B', 'C', 'D', 'E'] as const;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Empire OS</p>
            <h1 className="text-2xl font-bold text-white">Alkhemmy control plane</h1>
            <p className="mt-1 max-w-xl text-sm text-zinc-400">
              33 autonomous skills across engagement, inventory, revenue, retention, and marketing. Events
              log to Supabase; outbound webhooks fan out with retry.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
            >
              Storefront
            </Link>
            <Link
              href="/admin"
              className="rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#B8941F]"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-10">
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-xs uppercase text-zinc-500">Skills defined</p>
            <p className="mt-1 text-3xl font-bold text-white">{metrics.skillsTotal}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-xs uppercase text-zinc-500">Events (sample window)</p>
            <p className="mt-1 text-3xl font-bold text-white">{metrics.totalEvents}</p>
            <p className="text-xs text-zinc-500">Last 5000 rows for dashboard</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-xs uppercase text-zinc-500">Last 24h</p>
            <p className="mt-1 text-3xl font-bold text-[#D4AF37]">{metrics.last24h}</p>
            <p className="text-xs text-zinc-500">Requires empire_os_events table</p>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-semibold text-white">API</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            <li>
              <code className="text-[#D4AF37]">POST /api/empire-os/webhook</code> — Bearer{' '}
              <code className="text-zinc-400">EMPIRE_OS_INBOUND_SECRET</code>
            </li>
            <li>
              <code className="text-[#D4AF37]">POST /api/empire-os/recommendations</code> — optional Bearer{' '}
              <code className="text-zinc-400">EMPIRE_OS_RECOMMENDATIONS_SECRET</code>
            </li>
            <li className="text-zinc-500">
              Outbound: set <code className="text-zinc-400">EMPIRE_OS_OUTBOUND_WEBHOOKS</code> (comma list or JSON
              array) and optional <code className="text-zinc-400">EMPIRE_OS_OUTBOUND_AUTH</code>
            </li>
          </ul>
        </section>

        {byCat.map((cat) => (
          <section key={cat}>
            <div className="mb-4 flex items-baseline gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4AF37] text-sm font-bold text-black">
                {cat}
              </span>
              <h2 className="text-lg font-semibold text-white">{CATEGORY_LABELS[cat]}</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {EMPIRE_SKILLS.filter((s) => s.category === cat).map((skill) => {
                const fired = metrics.bySkill[skill.id] ?? 0;
                return (
                  <article
                    key={skill.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-4 transition hover:border-[#D4AF37]/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-white">{skill.title}</h3>
                      <span className="shrink-0 rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                        {fired} evt
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">{skill.summary}</p>
                    <p className="mt-2 font-mono text-[10px] text-zinc-600">{skill.id}</p>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
