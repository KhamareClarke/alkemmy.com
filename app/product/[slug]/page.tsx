import type { Metadata } from 'next';
import ProductClientPage from './ProductClientPage';
import { getProductBySlug, getRelatedProducts } from '@/lib/products';
import { buildProductMetadata } from '@/lib/seo/product-metadata';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: 'Product | Alkhemmy', description: 'Product not found.' };
  }
  return buildProductMetadata(product);
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const relatedProducts = product ? await getRelatedProducts(slug) : [];

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
