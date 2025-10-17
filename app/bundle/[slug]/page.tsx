import BundleClientPage from './BundleClientPage';
import { getBundleBySlug, getRelatedBundles } from '@/lib/admin-api';

// Dynamic route for bundle pages
export default async function BundlePage({ params }: { params: { slug: string } }) {
  const bundle = await getBundleBySlug(params.slug);
  const relatedBundles = await getRelatedBundles(params.slug);

  if (!bundle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bundle Not Found</h1>
          <a href="/bundles" className="bg-[#D4AF37] hover:bg-[#B8941F] text-black px-6 py-2 rounded-full font-semibold">
            Back to Bundles
          </a>
        </div>
      </div>
    );
  }

  return <BundleClientPage bundle={bundle} relatedBundles={relatedBundles} />;
}

