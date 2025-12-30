import ProductClientPage from './ProductClientPage';
import { getLotionBySlug, getRelatedLotions } from '@/lib/category-api';

export default async function LotionProductPage({ params }: { params: { slug: string } }) {
  const product = await getLotionBySlug(params.slug);
  const relatedProducts = await getRelatedLotions(params.slug);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lotion Not Found</h1>
          <a href="/lotions" className="bg-[#D4AF37] hover:bg-[#B8941F] text-black px-6 py-2 rounded-full font-semibold">
            Back to Lotions
          </a>
        </div>
      </div>
    );
  }

  return <ProductClientPage product={product} relatedProducts={relatedProducts} />;
}
