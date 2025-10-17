'use client';

import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, User } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
}

interface ReviewsListProps {
  productId: string;
  className?: string;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  productId,
  className = ''
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reviews?productId=${productId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reviews');
      }

      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load reviews: {error}</p>
        <button
          onClick={fetchReviews}
          className="mt-2 text-[#D4AF37] hover:text-[#B8941F] text-sm font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Reviews Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <StarRating rating={averageRating} size="lg" showNumber={true} />
              <span className="text-sm text-gray-600">
                ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
        </div>
        
        {totalReviews === 0 ? (
          <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter(review => review.rating === star).length;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              
              return (
                <div key={star} className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 w-2">{star}</span>
                  <StarRating rating={1} size="sm" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-6">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Individual Reviews */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-gray-900">All Reviews</h4>
          {reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={review.user?.avatar_url || ''} />
                  <AvatarFallback className="bg-[#D4AF37] text-black">
                    {review.user ? getInitials(review.user.first_name, review.user.last_name) : <User className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">
                      {review.user ? `${review.user.first_name} ${review.user.last_name}` : 'Anonymous'}
                    </span>
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-sm text-gray-500">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  
                  {review.comment && (
                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;




