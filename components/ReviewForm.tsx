'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import StarRating from './StarRating';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted?: () => void;
  className?: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  onReviewSubmitted,
  className = ''
}) => {
  const { user, session } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !session) {
      setError('Please log in to submit a review');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim() || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccess('Review submitted successfully!');
      setRating(0);
      setComment('');
      
      // Call the callback to refresh reviews
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className={`bg-gray-50 p-6 rounded-lg text-center ${className}`}>
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Write a Review</h3>
        <p className="text-gray-600 mb-4">Please log in to write a review for this product.</p>
        <Button 
          onClick={() => {
            // Store the current page URL to redirect back after login
            localStorage.setItem('redirectAfterLogin', window.location.pathname);
            window.location.href = '/auth/login';
          }}
          className="bg-[#D4AF37] hover:bg-[#B8941F] text-black"
        >
          Log In to Review
        </Button>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <StarRating
            rating={rating}
            interactive={true}
            onRatingChange={setRating}
            size="lg"
            showNumber={true}
          />
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Comment (Optional)
          </label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={4}
            className="w-full"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 characters
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Review
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default ReviewForm;
