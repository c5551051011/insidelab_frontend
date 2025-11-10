import React from 'react';
import { colors, spacing } from '../theme';

const overlayBaseStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  zIndex: 1000,
};

export const Modal = ({
  children,
  onClose,
  maxWidth = '500px',
  maxHeight = '90vh',
  padding = spacing[6],
  backgroundColor = colors.surface,
  borderRadius = '12px',
  boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  overlayStyle = {},
  contentStyle = {},
  align = 'center',
  justify = 'center',
  closeOnBackdrop = true,
  role = 'dialog',
  ariaLabelledBy,
  ariaDescribedBy,
}) => {
  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget && closeOnBackdrop && onClose) {
      onClose();
    }
  };

  return (
    <div
      style={{
        ...overlayBaseStyle,
        alignItems: align,
        justifyContent: justify,
        padding: spacing[4],
        ...overlayStyle,
      }}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        role={role}
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        style={{
          width: '100%',
          maxWidth,
          maxHeight,
          padding,
          backgroundColor,
          borderRadius,
          overflowY: 'auto',
          boxShadow,
          ...contentStyle,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
