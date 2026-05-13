import type { Product } from '@/lib/supabase';
import { getSiteUrl } from '@/lib/seo/site-url';

export function organizationJsonLd() {
  const url = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Alkhemmy',
    url,
    logo: `${url}/favicon.ico`,
    description: 'Luxury herbal skincare — Alkhemmy blends ancestral herbal wisdom with modern skincare.',
  };
}

export function productJsonLd(product: Product, opts?: { ratingValue?: number; reviewCount?: number }) {
  const base = getSiteUrl();
  const image = (product.images || []).map((img) =>
    img.startsWith('http') ? img : `${base}${img}`
  );
  const offers = {
    '@type': 'Offer',
    url: `${base}/product/${product.slug}`,
    priceCurrency: 'GBP',
    price: product.price,
    availability: product.in_stock
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
  };

  const aggregateRating =
    opts?.ratingValue != null && opts.reviewCount != null && opts.reviewCount > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: opts.ratingValue,
          reviewCount: opts.reviewCount,
        }
      : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.short_description || product.description?.replace(/<[^>]+>/g, '').slice(0, 500),
    image: image.length ? image : undefined,
    sku: product.slug,
    brand: { '@type': 'Brand', name: 'Alkhemmy' },
    offers,
    aggregateRating,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  const base = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${base}${it.path.startsWith('/') ? it.path : `/${it.path}`}`,
    })),
  };
}

export function faqPageJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}
