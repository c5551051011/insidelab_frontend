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
          icon: <CheckCircle size={18} />,
          backgroundColor: colors.success
        };
      case 'error':
        return {
          icon: <XCircle size={18} />,
          backgroundColor: colors.error
        };
      case 'warning':
        return {
          icon: <AlertCircle size={18} />,
          backgroundColor: colors.warning
        };
      case 'info':
      default:
        return {
          icon: <Info size={18} />,
          backgroundColor: colors.primary
        };
    }
  };

  const config = getToastConfig();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2],
        backgroundColor: config.backgroundColor,
        borderRadius: '8px',
        padding: `${spacing[2]} ${spacing[3]}`,
        minWidth: '300px',
        maxWidth: '500px',
        animation: 'slideDown 0.3s ease-out',
        fontFamily: 'Inter'
      }}
    >
      <div style={{ color: 'white', flexShrink: 0 }}>
        {config.icon}
      </div>

      <div style={{ flex: 1, fontSize: '14px', color: 'white', fontWeight: '500' }}>
        {message}
      </div>

      <button
        onClick={() => onClose(id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'white',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          flexShrink: 0,
          opacity: 0.8
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.opacity = '0.8';
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
