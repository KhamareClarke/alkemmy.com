import ProductClientPage from './ProductClientPage';
import { getSoapBySlug, getRelatedSoaps } from '@/lib/category-api';

export default async function SoapProductPage({ params }: { params: { slug: string } }) {
  const product = await getSoapBySlug(params.slug);
  const relatedProducts = await getRelatedSoaps(params.slug);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Soap Not Found</h1>
          <a href="/soaps" className="bg-[#D4AF37] hover:bg-[#B8941F] text-black px-6 py-2 rounded-full font-semibold">
            Back to Soaps
          </a>
        </div>
      </div>
    );
  }

  return <ProductClientPage product={product} relatedProducts={relatedProducts} />;
}
