import React from 'react';
import { colors, spacing, borderRadius } from '../theme';

// Primary Button Component
export const PrimaryButton = ({
  children,
  onClick,
  to,
  icon: Icon,
  size = 'medium',
  variant = 'solid',
  disabled = false,
  ...props
}) => {
  const sizes = {
    small: {
      padding: `${spacing[2]} ${spacing[4]}`,
      fontSize: window.innerWidth < 768 ? '12px' : '14px',
      iconSize: window.innerWidth < 768 ? 14 : 16,
    },
    medium: {
      padding: `${spacing[4]} ${spacing[8]}`,
      fontSize: '16px',
      iconSize: 20,
    },
    large: {
      padding: `${spacing[5]} ${spacing[10]}`,
      fontSize: '18px',
      iconSize: 24,
    }
  };

  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    padding: sizes[size].padding,
    backgroundColor: variant === 'outline' ? 'rgba(255, 255, 255, 0.1)' : (disabled ? colors.textTertiary : colors.primary),
    color: variant === 'outline' ? colors.heroText : 'white',
    border: variant === 'outline' ? `2px solid ${colors.heroText}` : 'none',
    borderRadius: borderRadius.base,
    fontSize: sizes[size].fontSize,
    fontWeight: '600',
    fontFamily: 'Inter',
    textDecoration: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: disabled ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.2)',
    backdropFilter: variant === 'outline' ? 'blur(10px)' : 'none',
    whiteSpace: 'nowrap',
    ...props.style
  };

  const handleMouseEnter = (e) => {
    if (!disabled) {
      if (variant === 'outline') {
        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        e.target.style.borderColor = 'rgba(255, 255, 255, 0.9)';
      } else {
        e.target.style.backgroundColor = colors.primaryHover;
      }
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)';
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled) {
      if (variant === 'outline') {
        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        e.target.style.borderColor = colors.heroText;
      } else {
        e.target.style.backgroundColor = colors.primary;
      }
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    }
  };

  const content = (
    <>
      {Icon && <Icon size={sizes[size].iconSize} />}
      {children}
    </>
  );

  if (to) {
    return (
      <a
        href={to}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      style={buttonStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      {...props}
    >
      {content}
    </button>
  );
};

// Secondary Button Component
export const SecondaryButton = ({
  children,
  onClick,
  to,
  icon: Icon,
  size = 'medium',
  variant = 'outline', // 'outline' or 'ghost'
  disabled = false,
  ...props
}) => {
  const sizes = {
    small: {
      padding: `${spacing[2]} ${spacing[4]}`,
      fontSize: window.innerWidth < 768 ? '12px' : '14px',
      iconSize: window.innerWidth < 768 ? 14 : 16,
    },
    medium: {
      padding: `${spacing[4]} ${spacing[8]}`,
      fontSize: '16px',
      iconSize: 20,
    },
    large: {
      padding: `${spacing[5]} ${spacing[10]}`,
      fontSize: '18px',
      iconSize: 24,
    }
  };

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    padding: sizes[size].padding,
    border: variant === 'outline' ? `2px solid ${colors.heroText}` : 'none',
    borderRadius: borderRadius.base,
    fontSize: sizes[size].fontSize,
    fontWeight: '600',
    fontFamily: 'Inter',
    textDecoration: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    color: colors.heroText,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    whiteSpace: 'nowrap',
    ...props.style
  };

  const handleMouseEnter = (e) => {
    if (!disabled) {
      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)';
      if (variant === 'outline') {
        e.target.style.borderColor = 'rgba(255, 255, 255, 0.9)';
      }
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled) {
      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
      if (variant === 'outline') {
        e.target.style.borderColor = colors.heroText;
      }
    }
  };

  const content = (
    <>
      {Icon && <Icon size={sizes[size].iconSize} />}
      {children}
    </>
  );

  if (to) {
    return (
      <a
        href={to}
        style={baseStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      style={baseStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      {...props}
    >
      {content}
    </button>
  );
};