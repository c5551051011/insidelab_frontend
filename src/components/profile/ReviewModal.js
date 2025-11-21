import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { colors, spacing } from '../../theme';
import { getSessionTypeLabel } from '../../utils/profileUtils';

/**
 * ReviewModal Component
 *
 * Modal component for creating reviews after completed sessions.
 * Allows users to rate different aspects of the session and leave comments.
 *
 * @param {Object} props - Component props
 * @param {Object} props.session - Session data to review
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Function} props.onSubmit - Callback when review is submitted
 */
const ReviewModal = ({ session, onClose, onSubmit }) => {
  const [ratings, setRatings] = useState({
    overall_rating: 0,
    communication_rating: 0,
    preparation_rating: 0,
    helpfulness_rating: 0
  });
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Rating categories with labels
  const ratingLabels = {
    overall_rating: 'Overall Rating',
    communication_rating: 'Communication',
    preparation_rating: 'Preparation',
    helpfulness_rating: 'Helpfulness'
  };

  /**
   * Handle rating change for specific category
   */
  const handleRatingChange = (ratingType, value) => {
    setRatings(prev => ({
      ...prev,
      [ratingType]: value
    }));
  };

  /**
   * Handle review submission
   */
  const handleSubmit = async () => {
    // Validate that all ratings are provided
    const allRatingsProvided = Object.values(ratings).every(rating => rating > 0);
    if (!allRatingsProvided) {
      alert('Please provide all ratings before submitting');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...ratings,
        comment: comment.trim() || null
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Star Rating Component
   */
  const StarRating = ({ value, onChange, label }) => (
    <div style={{ marginBottom: spacing[4] }}>
      <div style={{
        fontSize: '14px',
        fontWeight: '500',
        color: colors.textPrimary,
        marginBottom: spacing[2]
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: spacing[1], alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.1s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            <Star
              size={24}
              color={star <= value ? colors.warning : colors.textTertiary}
              fill={star <= value ? colors.warning : 'none'}
            />
          </button>
        ))}
        <span style={{
          marginLeft: spacing[2],
          fontSize: '14px',
          color: colors.textSecondary,
          minWidth: '30px'
        }}>
          {value}/5
        </span>
      </div>
    </div>
  );

  // Check if all ratings are provided
  const allRatingsProvided = Object.values(ratings).every(rating => rating > 0);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: spacing[4]
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: spacing[6],
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing[4],
          paddingBottom: spacing[4],
          borderBottom: `1px solid ${colors.border}`
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: colors.textPrimary,
            margin: 0
          }}>
            Leave Review
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: colors.textSecondary,
              cursor: 'pointer',
              padding: 0,
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = colors.backgroundSecondary}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        {/* Session Info */}
        <div style={{
          fontSize: '16px',
          color: colors.textPrimary,
          marginBottom: spacing[5],
          padding: spacing[4],
          backgroundColor: colors.background,
          borderRadius: '12px',
          border: `1px solid ${colors.border}`
        }}>
          <div style={{
            fontWeight: '600',
            marginBottom: spacing[2]
          }}>
            {getSessionTypeLabel(session?.session_type)}
          </div>
          <div style={{
            fontSize: '14px',
            color: colors.textSecondary
          }}>
            Student: {session?.student_name || 'Anonymous Student'}
          </div>
        </div>

        {/* Rating Categories */}
        <div style={{ marginBottom: spacing[5] }}>
          {Object.entries(ratingLabels).map(([key, label]) => (
            <StarRating
              key={key}
              value={ratings[key]}
              onChange={(value) => handleRatingChange(key, value)}
              label={label}
            />
          ))}
        </div>

        {/* Comment Section */}
        <div style={{ marginBottom: spacing[5] }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '500',
            color: colors.textPrimary,
            marginBottom: spacing[2]
          }}>
            Comment (Optional)
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience and feedback..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: spacing[3],
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = colors.primary}
            onBlur={(e) => e.target.style.borderColor = colors.border}
          />
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: spacing[3],
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              backgroundColor: 'transparent',
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: `${spacing[3]} ${spacing[4]}`,
              fontSize: '14px',
              fontWeight: '500',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: submitting ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.target.style.backgroundColor = colors.backgroundSecondary;
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !allRatingsProvided}
            style={{
              backgroundColor: (submitting || !allRatingsProvided)
                ? colors.textTertiary
                : colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: `${spacing[3]} ${spacing[4]}`,
              fontSize: '14px',
              fontWeight: '500',
              cursor: (submitting || !allRatingsProvided)
                ? 'not-allowed'
                : 'pointer',
              transition: 'all 0.2s ease',
              opacity: (submitting || !allRatingsProvided) ? 0.6 : 1,
              minWidth: '120px'
            }}
            onMouseEnter={(e) => {
              if (!submitting && allRatingsProvided) {
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting && allRatingsProvided) {
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;