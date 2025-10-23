import React from 'react';
import { colors, spacing } from '../theme';

const RatingSlider = ({
  rating,
  onRatingChange,
  label = null,
  showLabels = false,
  min = 0.5,
  max = 5.0,
  step = 0.5
}) => {
  const handleSliderChange = (e) => {
    const value = parseFloat(e.target.value);
    onRatingChange(value);
  };

  const getSliderBackground = () => {
    const percentage = ((rating - min) / (max - min)) * 100;
    return `linear-gradient(to right, ${colors.primary} 0%, ${colors.primary} ${percentage}%, ${colors.border} ${percentage}%, ${colors.border} 100%)`;
  };

  const sliderLabels = [];
  for (let i = min; i <= max; i += 1) {
    sliderLabels.push(i);
  }

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
        flexDirection: 'column',
        gap: spacing[2]
      }}>
        {/* Slider */}
        <div style={{ position: 'relative' }}>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={rating}
            onChange={handleSliderChange}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: getSliderBackground(),
              outline: 'none',
              appearance: 'none',
              cursor: 'pointer'
            }}
          />

          <style>{`
            input[type="range"]::-webkit-slider-thumb {
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: ${colors.primary};
              cursor: pointer;
              border: 2px solid white;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
            }

            input[type="range"]::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: ${colors.primary};
              cursor: pointer;
              border: 2px solid white;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
            }
          `}</style>
        </div>

        {/* Labels */}
        {showLabels && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: spacing[1]
          }}>
            {sliderLabels.map((labelValue) => (
              <span
                key={labelValue}
                style={{
                  fontSize: '12px',
                  color: colors.textTertiary,
                  fontWeight: '400'
                }}
              >
                {labelValue.toFixed(1)}
              </span>
            ))}
          </div>
        )}

        {/* Current Value Display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{
            fontSize: '14px',
            color: colors.textSecondary
          }}>
            Fine-tune your rating
          </span>
          <span style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.primary
          }}>
            {rating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RatingSlider;