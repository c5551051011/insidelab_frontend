import React from 'react';
import { Star } from 'lucide-react';
import { colors, spacing } from '../theme';

const StarRating = ({
  rating,
  onRatingChange,
  size = 24,
  interactive = true,
  showNumber = true,
  label = null
}) => {
  const handleStarClick = (starIndex) => {
    if (!interactive || !onRatingChange) return;

    const clickedRating = starIndex + 1;

    // If clicking on a filled star, toggle to half rating
    if (clickedRating === Math.ceil(rating)) {
      onRatingChange(clickedRating - 0.5);
    } else {
      onRatingChange(clickedRating);
    }
  };

  const getStarFill = (index) => {
    const starValue = index + 1;

    if (rating >= starValue) {
      return 'full';
    } else if (rating >= starValue - 0.5) {
      return 'half';
    } else {
      return 'empty';
    }
  };

  const getRatingDescription = () => {
    if (rating >= 4.5) {
      return { text: 'Excellent Experience', color: colors.success };
    } else if (rating >= 3.5) {
      return { text: 'Good Experience', color: colors.primary };
    } else if (rating >= 2.5) {
      return { text: 'Average Experience', color: colors.warning };
    } else if (rating >= 1.5) {
      return { text: 'Below Average', color: colors.error };
    } else {
      return { text: 'Poor Experience', color: colors.error };
    }
  };

  const description = getRatingDescription();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[2]
    }}>
      {label && (
        <label style={{
          fontSize: '14px',
          fontWeight: '500',
          color: colors.textPrimary
        }}>
          {label}
        </label>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2]
      }}>
        {/* Stars */}
        <div style={{
          display: 'flex',
          gap: spacing[1]
        }}>
          {[0, 1, 2, 3, 4].map((index) => {
            const fill = getStarFill(index);

            return (
              <div
                key={index}
                onClick={() => handleStarClick(index)}
                style={{
                  cursor: interactive ? 'pointer' : 'default',
                  position: 'relative',
                  display: 'inline-block'
                }}
              >
                {/* Base star (empty) */}
                <Star
                  size={size}
                  color={colors.border}
                  fill="transparent"
                  style={{ display: 'block' }}
                />

                {/* Half star overlay */}
                {fill === 'half' && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '50%',
                    height: '100%',
                    overflow: 'hidden'
                  }}>
                    <Star
                      size={size}
                      color="#FFA726"
                      fill="#FFA726"
                    />
                  </div>
                )}

                {/* Full star overlay */}
                {fill === 'full' && (
                  <Star
                    size={size}
                    color="#FFA726"
                    fill="#FFA726"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Rating Number */}
        {showNumber && (
          <span style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.textPrimary,
            minWidth: '30px'
          }}>
            {rating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Rating Description */}
      {interactive && (
        <div style={{
          display: 'inline-block',
          padding: `${spacing[1]} ${spacing[3]}`,
          backgroundColor: `${description.color}10`,
          color: description.color,
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: '500',
          alignSelf: 'flex-start'
        }}>
          {description.text}
        </div>
      )}
    </div>
  );
};

export default StarRating;