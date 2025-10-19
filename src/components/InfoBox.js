import React from 'react';
import { colors, spacing } from '../theme';

const InfoBox = ({
  type = 'info',
  title,
  children,
  icon,
  className = '',
  style = {}
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'info':
        return {
          backgroundColor: colors.info + '1A',
          borderColor: colors.info + '4D',
          iconColor: colors.info
        };
      case 'warning':
        return {
          backgroundColor: colors.warning + '1A',
          borderColor: colors.warning + '33',
          iconColor: colors.warning
        };
      case 'success':
        return {
          backgroundColor: colors.success + '1A',
          borderColor: colors.success + '33',
          iconColor: colors.success
        };
      case 'error':
        return {
          backgroundColor: colors.error + '1A',
          borderColor: colors.error + '33',
          iconColor: colors.error
        };
      default:
        return {
          backgroundColor: colors.info + '1A',
          borderColor: colors.info + '4D',
          iconColor: colors.info
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        padding: spacing[4],
        backgroundColor: typeStyles.backgroundColor,
        border: `1px solid ${typeStyles.borderColor}`,
        borderRadius: '12px',
        gap: spacing[3],
        ...style
      }}
    >
      {/* Icon */}
      {icon && (
        <div style={{
          flexShrink: 0,
          fontSize: '20px',
          color: typeStyles.iconColor
        }}>
          {icon}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[1],
            fontFamily: 'Inter'
          }}>
            {title}
          </div>
        )}

        <div style={{
          fontSize: '14px',
          color: colors.textSecondary,
          fontFamily: 'Inter',
          lineHeight: '1.4'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Pre-configured specific InfoBox types
export const PrivacyInfoBox = ({ children, ...props }) => (
  <InfoBox
    type="info"
    title="Privacy Recommendation"
    icon="ℹ️"
    {...props}
  >
    {children}
  </InfoBox>
);

export const AnonymousInfoBox = ({ children, ...props }) => (
  <InfoBox
    type="info"
    icon="ℹ️"
    {...props}
  >
    {children}
  </InfoBox>
);

export const CommunityGuidelinesBox = ({ children, ...props }) => (
  <InfoBox
    type="warning"
    title="Community Guidelines"
    icon="🛡️"
    {...props}
  >
    {children}
  </InfoBox>
);

export default InfoBox;