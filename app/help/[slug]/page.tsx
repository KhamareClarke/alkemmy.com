import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getHelpArticleBySlug } from '@/lib/help/queries';
import { ArticleFeedback } from '@/components/help/ArticleFeedback';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getHelpArticleBySlug(slug);
  if (!article) return { title: 'Help | Alkhemmy' };
  return {
    title: `${article.title} | Help`,
    description: article.excerpt || article.title,
  };
}

export default async function HelpArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getHelpArticleBySlug(slug);
  if (!article) notFound();

  return (
    <article className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-slate-500">
          <Link href="/help" className="underline">
            Help center
          </Link>
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{article.title}</h1>
        {article.excerpt ? <p className="mt-3 text-lg text-slate-600">{article.excerpt}</p> : null}
        <div className="mt-8 whitespace-pre-wrap text-slate-800 leading-relaxed">{article.body}</div>
        <ArticleFeedback articleId={article.id} />
      </div>
    </article>
  );
}
