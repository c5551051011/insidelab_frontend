import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { colors, spacing, borderRadius } from '../theme';

export const FormInput = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  required = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const isPassword = type === 'password';
  const actualType = isPassword && showPassword ? 'text' : type;
  const isMobile = window.innerWidth < 768;

  return (
    <div style={{ marginBottom: spacing[4] }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: '500',
            color: colors.textPrimary,
            marginBottom: spacing[2],
            fontFamily: 'Inter',
          }}
        >
          {label}
          {required && (
            <span style={{ color: colors.error, marginLeft: '4px' }}>*</span>
          )}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon
            size={20}
            style={{
              position: 'absolute',
              left: spacing[3],
              top: '50%',
              transform: 'translateY(-50%)',
              color: focused ? colors.primary : colors.textTertiary,
              zIndex: 1,
              transition: 'color 0.2s ease',
            }}
          />
        )}

        <input
          type={actualType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            height: '48px',
            padding: Icon
              ? `0 ${isPassword ? '48px' : spacing[3]} 0 48px`
              : `0 ${isPassword ? '48px' : spacing[3]}`,
            fontSize: isMobile ? '14px' : '16px',
            border: `2px solid ${error ? colors.error : (focused ? colors.primary : colors.border)}`,
            borderRadius: borderRadius.base,
            outline: 'none',
            backgroundColor: colors.background,
            color: colors.textPrimary,
            fontFamily: 'Inter',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box',
          }}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: spacing[3],
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.textTertiary} />
            ) : (
              <Eye size={20} color={colors.textTertiary} />
            )}
          </button>
        )}
      </div>

      {error && (
        <p
          style={{
            fontSize: isMobile ? '12px' : '14px',
            color: colors.error,
            marginTop: spacing[1],
            marginBottom: 0,
            fontFamily: 'Inter',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export const FormButton = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  icon: Icon,
  ...props
}) => {
  const isMobile = window.innerWidth < 768;

  const variants = {
    primary: {
      backgroundColor: disabled || loading ? colors.textTertiary : colors.primary + ' !important',
      color: 'white !important',
      border: 'none !important',
      borderRadius: '6px !important',
      boxShadow: disabled || loading ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.05) !important',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: colors.textPrimary,
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
    },
    google: {
      backgroundColor: 'white',
      color: colors.textPrimary,
      border: `1px solid ${colors.textTertiary}`,
      borderRadius: '8px',
    }
  };

  const variantStyle = variants[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        // 강제로 primary 스타일 적용
        backgroundColor: variant === 'primary'
          ? (disabled || loading ? colors.textTertiary : colors.primary)
          : variantStyle.backgroundColor,
        color: variant === 'primary' ? 'white' : variantStyle.color,
        border: variant === 'primary' ? 'none' : variantStyle.border,
        borderRadius: variant === 'primary' ? '6px' : variantStyle.borderRadius,
        boxShadow: variant === 'primary'
          ? (disabled || loading ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.05)')
          : variantStyle.boxShadow,
        // 공통 스타일
        width: '100%',
        height: '48px',
        padding: `0 ${spacing[6]}`,
        fontSize: isMobile ? '14px' : '16px',
        fontWeight: variant === 'primary' ? '600' : '500',
        fontFamily: 'Inter',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[2],
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading && variant === 'primary') {
          e.target.style.backgroundColor = colors.primaryHover;
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
        } else if (!disabled && !loading && variant === 'secondary') {
          e.target.style.backgroundColor = colors.backgroundLight;
          e.target.style.borderColor = colors.textSecondary;
        } else if (!disabled && !loading && variant === 'google') {
          e.target.style.backgroundColor = colors.backgroundLight;
          e.target.style.borderColor = colors.textSecondary;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading && variant === 'primary') {
          e.target.style.backgroundColor = colors.primary;
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
        } else if (!disabled && !loading && variant === 'secondary') {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.borderColor = colors.border;
        } else if (!disabled && !loading && variant === 'google') {
          e.target.style.backgroundColor = 'white';
          e.target.style.borderColor = colors.textTertiary;
        }
      }}
      {...props}
    >
      {loading ? (
        <div
          style={{
            width: '20px',
            height: '20px',
            border: '2px solid transparent',
            borderTop: variant === 'primary' ? '2px solid white' : `2px solid ${colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      ) : (
        <>
          {Icon && <Icon size={20} />}
          {children}
        </>
      )}
    </button>
  );
};