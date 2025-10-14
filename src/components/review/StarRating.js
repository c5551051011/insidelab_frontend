import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { colors, spacing } from '../../theme';

const StarRating = ({
  value = 0,
  onChange,
  size = 'medium',
  interactive = true,
  showSlider = true,
  showDescription = true,
  className = '',
  style = {}
}) => {
  const [hoverValue, setHoverValue] = useState(0);
  const [sliderValue, setSliderValue] = useState(value);

  // Update slider when value changes
  useEffect(() => {
    setSliderValue(value);
  }, [value]);

  // Size configurations
  const sizes = {
    small: { star: 16, gap: 2 },
    medium: { star: 20, gap: 4 },
    large: { star: 24, gap: 6 }
  };

  const config = sizes[size] || sizes.medium;

  // Get rating description
  const getRatingDescription = (rating) => {
    if (rating >= 4.5) return { text: 'Excellent', color: colors.success };
    if (rating >= 3.5) return { text: 'Good', color: colors.info };
    if (rating >= 2.5) return { text: 'Average', color: colors.warning };
    if (rating >= 1.5) return { text: 'Below Average', color: '#F97316' };
    if (rating > 0) return { text: 'Poor', color: colors.error };
    return { text: 'No rating', color: colors.textTertiary };
  };

  // Handle star click
  const handleStarClick = (starValue) => {
    if (!interactive || !onChange) return;

    // Calculate rating based on click position
    const newValue = starValue * 0.5; // 0.5 increments
    onChange(newValue);
  };

  // Handle star hover
  const handleStarHover = (starValue) => {
    if (!interactive) return;
    setHoverValue(starValue * 0.5);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoverValue(0);
  };

  // Handle slider change
  const handleSliderChange = (e) => {
    if (!interactive || !onChange) return;

    const newValue = parseFloat(e.target.value);
    setSliderValue(newValue);
    onChange(newValue);
  };

  // Get star fill percentage
  const getStarFill = (starIndex) => {
    const currentValue = hoverValue || value;
    const starValue = starIndex + 1;

    if (currentValue >= starValue) {
      return 100; // Full star
    } else if (currentValue >= starValue - 0.5) {
      return 50; // Half star
    }
    return 0; // Empty star
  };

  // Render individual star
  const renderStar = (index) => {
    const fill = getStarFill(index);
    const starIndex = index + 1;

    return (
      <div
        key={index}
        style={{
          position: 'relative',
          cursor: interactive ? 'pointer' : 'default',
          display: 'inline-block'
        }}
        onClick={() => handleStarClick(starIndex * 2)} // *2 because we have half-star increments
        onMouseEnter={() => handleStarHover(starIndex * 2)}
      >
        {/* Background star (empty) */}
        <Star
          size={config.star}
          color={colors.border}
          fill="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />

        {/* Filled star */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            width: `${fill}%`,
            height: `${config.star}px`
          }}
        >
          <Star
            size={config.star}
            color={colors.warning}
            fill={colors.warning}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${config.star}px`
            }}
          />
        </div>
      </div>
    );
  };

  const description = getRatingDescription(value);

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[2],
        ...style
      }}
      onMouseLeave={handleMouseLeave}
    >
      {/* Stars Display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2]
        }}
      >
        {/* Star Icons */}
        <div
          style={{
            display: 'flex',
            gap: `${config.gap}px`,
            alignItems: 'center'
          }}
        >
          {[0, 1, 2, 3, 4].map(renderStar)}
        </div>

        {/* Numeric Value */}
        <span
          style={{
            fontSize: size === 'small' ? '14px' : '16px',
            fontWeight: '600',
            color: colors.textPrimary,
            fontFamily: 'Inter',
            minWidth: '30px'
          }}
        >
          {value.toFixed(1)}
        </span>

        {/* Rating Description */}
        {showDescription && (
          <span
            style={{
              fontSize: size === 'small' ? '12px' : '14px',
              color: description.color,
              fontWeight: '500',
              fontFamily: 'Inter'
            }}
          >
            {description.text}
          </span>
        )}
      </div>

      {/* Fine-tuning Slider */}
      {showSlider && interactive && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            marginTop: spacing[1]
          }}
        >
          <span
            style={{
              fontSize: '12px',
              color: colors.textSecondary,
              fontFamily: 'Inter'
            }}
          >
            0.5
          </span>

          <input
            type="range"
            min="0.5"
            max="5.0"
            step="0.5"
            value={sliderValue}
            onChange={handleSliderChange}
            style={{
              flex: 1,
              height: '4px',
              background: `linear-gradient(to right, ${colors.warning} 0%, ${colors.warning} ${((sliderValue - 0.5) / 4.5) * 100}%, ${colors.border} ${((sliderValue - 0.5) / 4.5) * 100}%, ${colors.border} 100%)`,
              borderRadius: '2px',
              outline: 'none',
              cursor: 'pointer',
              WebkitAppearance: 'none',
              MozAppearance: 'none'
            }}
          />

          <span
            style={{
              fontSize: '12px',
              color: colors.textSecondary,
              fontFamily: 'Inter'
            }}
          >
            5.0
          </span>
        </div>
      )}
    </div>
  );
};

// Simple star display component (non-interactive)
export const StarDisplay = ({ value, size = 'small', showValue = true }) => {
  return (
    <StarRating
      value={value}
      size={size}
      interactive={false}
      showSlider={false}
      showDescription={false}
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing[1]
      }}
    />
  );
};

export default StarRating;