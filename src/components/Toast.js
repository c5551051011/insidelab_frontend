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
          backgroundColor: '#10b981', // Softer green
          textColor: 'white'
        };
      case 'error':
        return {
          icon: <XCircle size={18} />,
          backgroundColor: '#f87171', // Softer red
          textColor: 'white'
        };
      case 'warning':
        return {
          icon: <AlertCircle size={18} />,
          backgroundColor: '#fbbf24', // Softer yellow
          textColor: 'white'
        };
      case 'info':
      default:
        return {
          icon: <Info size={18} />,
          backgroundColor: '#60a5fa', // Softer blue
          textColor: 'white'
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
        backgroundColor: config.backgroundColor,
        borderRadius: '8px',
        padding: `${spacing[3]} ${spacing[4]}`,
        minWidth: '300px',
        maxWidth: '500px',
        animation: 'slideDown 0.3s ease-out',
        fontFamily: 'Inter'
      }}
    >
      <div style={{
        color: config.textColor,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center'
      }}>
        {config.icon}
      </div>

      <div style={{
        flex: 1,
        fontSize: '14px',
        color: config.textColor,
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center'
      }}>
        {message}
      </div>

      <button
        onClick={() => onClose(id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: config.textColor,
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
