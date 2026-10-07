import React, { useState } from 'react';
import { Star, X, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import API from '../../services/api';

const ReviewModal = ({ isOpen, onClose, order, onReviewSubmitted }) => {
  if (!isOpen || !order) return null;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      setError('Please write a review comment');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const res = await API.post('/reviews', {
        orderId: order._id,
        rating,
        reviewText
      });

      if (res.data.success) {
        setSuccess('Review and rating submitted successfully!');
        setTimeout(() => {
          if (onReviewSubmitted) onReviewSubmitted(res.data.review);
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit product review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="card-surface animate-scale-in" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '2rem',
        borderRadius: '20px',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: '0.4rem',
            borderRadius: '50%'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            display: 'inline-flex',
            padding: '0.75rem',
            borderRadius: '14px',
            backgroundColor: '#FEF3C7',
            color: '#D97706',
            marginBottom: '0.75rem'
          }}>
            <Star size={28} fill="#D97706" />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Rate & Review Product
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
            Share your experience for order <strong>#{order.orderId}</strong> ({order.productName})
          </p>
        </div>

        {error && (
          <div className="error-banner animate-fade-in" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-banner animate-fade-in" style={{ marginBottom: '1rem', backgroundColor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', padding: '0.75rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Star Selection */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Your Star Rating
            </label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.2rem',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <Star
                      size={32}
                      fill={isFilled ? '#F59E0B' : 'none'}
                      color={isFilled ? '#F59E0B' : '#CBD5E1'}
                      strokeWidth={1.5}
                    />
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D97706', display: 'block', marginTop: '0.3rem' }}>
              {rating === 5 ? '5 Stars - Excellent!' : rating === 4 ? '4 Stars - Good' : rating === 3 ? '3 Stars - Average' : rating === 2 ? '2 Stars - Poor' : '1 Star - Terrible'}
            </span>
          </div>

          {/* Text Review */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Review Comments
            </label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="Tell other shoppers about product quality, performance, packaging..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              required
              style={{ fontSize: '0.9rem', resize: 'vertical' }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <MessageSquare size={18} />
            <span>{loading ? 'Submitting Review...' : 'Submit Review'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
