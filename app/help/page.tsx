import Link from 'next/link';
import type { Metadata } from 'next';
import { listHelpCategories, listPublishedArticles, searchHelpArticles } from '@/lib/help/queries';

export const metadata: Metadata = {
  title: 'Help Center | Alkhemmy',
  description: 'Browse support articles by category.',
};

export default async function HelpHomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q || '').trim();
  const category = (sp.category || '').trim();

  const [categories, articles] = await Promise.all([
    listHelpCategories(),
    q ? searchHelpArticles(q) : listPublishedArticles(category || undefined),
  ]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <h1 className="text-2xl font-semibold tracking-tight">Help center</h1>
          <p className="mt-2 text-sm text-slate-600">Search articles or browse by category.</p>
          <form className="mt-6 flex gap-2" action="/help" method="get">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search…"
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-md bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black">
              Search
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-8">
        {!q && categories.length > 0 ? (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Categories</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/help?category=${encodeURIComponent(c.slug)}`}
                    className="inline-block rounded-full border border-slate-200 px-3 py-1 text-sm hover:border-[#D4AF37]"
                  >
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {q ? 'Search results' : category ? `Articles: ${category}` : 'All articles'}
          </h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {articles.length === 0 ? (
              <li className="py-6 text-sm text-slate-500">No articles yet. Add content in Admin → Help.</li>
            ) : (
              articles.map((a) => (
                <li key={a.id} className="py-4">
                  <Link href={`/help/${a.slug}`} className="text-base font-medium text-slate-900 hover:text-[#B8860B]">
                    {a.title}
                  </Link>
                  {a.excerpt ? <p className="mt-1 text-sm text-slate-600 line-clamp-2">{a.excerpt}</p> : null}
                </li>
              ))
            )}
          </ul>
        </section>

        <p className="text-center text-sm text-slate-500 pb-8">
          <Link href="/" className="underline">
            Back to shop
          </Link>
        </p>
      </main>
    </div>
  );
}
