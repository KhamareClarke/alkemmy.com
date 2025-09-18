import ProductClientPage from './ProductClientPage';
import { getProductData, getRelatedProducts, generateStaticParams as getStaticParams } from './product-data';

// Re-export generateStaticParams from the utility file
export const generateStaticParams = getStaticParams;

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductData(params.slug);
  const relatedProducts = getRelatedProducts(params.slug);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <a href="/shop" className="bg-[#D4AF37] hover:bg-[#B8941F] text-black px-6 py-2 rounded-full font-semibold">
            Back to Shop
          </a>
        </div>
      </div>
    );
  }

  return <ProductClientPage product={product} relatedProducts={relatedProducts} />;
}