import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { colors, spacing } from '../theme';

const Toast = ({
  id,
  message,
  type = 'info', // 'success', 'error', 'warning', 'info'
  duration = 3000,
  onClose
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle size={20} />,
          backgroundColor: colors.success,
          borderColor: colors.success
        };
      case 'error':
        return {
          icon: <XCircle size={20} />,
          backgroundColor: colors.error,
          borderColor: colors.error
        };
      case 'warning':
        return {
          icon: <AlertCircle size={20} />,
          backgroundColor: colors.warning,
          borderColor: colors.warning
        };
      case 'info':
      default:
        return {
          icon: <Info size={20} />,
          backgroundColor: colors.primary,
          borderColor: colors.primary
        };
    }
  };

  const config = getToastConfig();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[3],
        backgroundColor: 'white',
        border: `2px solid ${config.borderColor}`,
        borderRadius: '8px',
        padding: `${spacing[3]} ${spacing[4]}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        minWidth: '300px',
        maxWidth: '500px',
        animation: 'slideDown 0.3s ease-out',
        fontFamily: 'Inter'
      }}
    >
      <div style={{ color: config.backgroundColor, flexShrink: 0 }}>
        {config.icon}
      </div>

      <div style={{ flex: 1, fontSize: '14px', color: colors.textPrimary }}>
        {message}
      </div>

      <button
        onClick={() => onClose(id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: colors.textSecondary,
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.background;
          e.currentTarget.style.color = colors.textPrimary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = colors.textSecondary;
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
