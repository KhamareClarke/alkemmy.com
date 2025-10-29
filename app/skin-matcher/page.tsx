import SkinMatcherQuiz from '@/components/SkinMatcherQuiz';

// Force dynamic rendering - this page should not be statically generated
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function SkinMatcherPage() {
  return <SkinMatcherQuiz />;
}

