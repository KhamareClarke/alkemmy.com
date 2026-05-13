import Link from 'next/link';
import ProductClientPage from './ProductClientPage';
import { getLotionBySlug, getRelatedLotions } from '@/lib/category-api';

export default async function LotionProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getLotionBySlug(slug);
  const relatedProducts = await getRelatedLotions(slug);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lotion Not Found</h1>
          <Link href="/lotions" className="bg-[#D4AF37] hover:bg-[#B8941F] text-black px-6 py-2 rounded-full font-semibold">
            Back to Lotions
          </Link>
        </div>
      </div>
    );
  }

  return <ProductClientPage product={product} relatedProducts={relatedProducts} />;
}
