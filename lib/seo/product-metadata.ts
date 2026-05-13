import type { Metadata } from 'next';
import type { Product } from '@/lib/supabase';
import { getSiteUrl } from '@/lib/seo/site-url';

export function buildProductMetadata(product: Product): Metadata {
  const base = getSiteUrl();
  const desc =
    product.short_description?.slice(0, 160) ||
    product.description?.replace(/<[^>]+>/g, '').slice(0, 160) ||
    `${product.title} — Alkhemmy luxury herbal skincare.`;
  const image = product.images?.[0]
    ? product.images[0].startsWith('http')
      ? product.images[0]
      : `${base}${product.images[0]}`
    : `${base}/favicon.ico`;

  return {
    title: `${product.title} | Alkhemmy`,
    description: desc,
    keywords: [...(product.tags || []), product.category, 'Alkhemmy', 'skincare'].filter(Boolean),
    openGraph: {
      title: `${product.title} | Alkhemmy`,
      description: desc,
      url: `${base}/product/${product.slug}`,
      siteName: 'Alkhemmy',
      images: [{ url: image, width: 1200, height: 630, alt: product.title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | Alkhemmy`,
      description: desc,
      images: [image],
    },
    alternates: {
      canonical: `${base}/product/${product.slug}`,
    },
  };
}
