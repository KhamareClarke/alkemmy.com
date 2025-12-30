'use client';

import { useState, useEffect } from 'react';

interface ProductRating {
  averageRating: number;
  totalReviews: number;
}

interface UseProductRatingsResult {
  ratings: Record<string, ProductRating>;
  loading: boolean;
  error: string | null;
}

export const useProductRatings = (productIds: string[]): UseProductRatingsResult => {
  const [ratings, setRatings] = useState<Record<string, ProductRating>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRatings = async () => {
      if (productIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/reviews/average?productIds=${productIds.join(',')}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch ratings');
        }

        setRatings(data.averages || {});
      } catch (error: any) {
        setError(error.message);
        console.error('Error fetching product ratings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [productIds.join(',')]);

  return { ratings, loading, error };
};




