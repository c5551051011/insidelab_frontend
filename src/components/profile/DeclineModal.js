import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { colors, spacing } from '../../theme';

/**
 * DeclineModal Component
 *
 * Modal component for declining session requests with a reason.
 * Provides a text area for entering decline reason and confirmation buttons.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Function} props.onConfirm - Callback when decline is confirmed with reason
 * @param {Object} props.request - Request data being declined
 * @param {boolean} props.isSubmitting - Whether the decline is being processed
 */
const DeclineModal = ({ isOpen, onClose, onConfirm, request, isSubmitting = false }) => {
  const [reason, setReason] = useState('');

  // Reset reason when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setReason('');
    }
  }, [isOpen]);

  /**
   * Handle decline confirmation
   */
  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: spacing[4]
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: spacing[6],
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing[4]
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3]
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: `${colors.danger}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={20} color={colors.danger} />
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: colors.textPrimary,
              margin: 0
            }}>
              Decline Request
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            style={{
              background: 'none',
              border: 'none',
              color: colors.textSecondary,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              padding: spacing[1],
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isSubmitting ? 0.5 : 1,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.target.style.backgroundColor = colors.backgroundSecondary;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Request Info */}
        {request && (
          <div style={{
            padding: spacing[4],
            backgroundColor: colors.background,
            borderRadius: '12px',
            marginBottom: spacing[5],
            border: `1px solid ${colors.border}`
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[2]
            }}>
              Session Request
            </div>
            <div style={{
              fontSize: '14px',
              color: colors.textSecondary,
              lineHeight: '1.5'
            }}>
              <div>Student: {request.student_name || 'Anonymous Student'}</div>
              <div>Type: {request.session_type || 'Session'}</div>
              {request.preferred_time && (
                <div>Preferred Time: {new Date(request.preferred_time).toLocaleDateString()}</div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        <div style={{
          fontSize: '14px',
          color: colors.textSecondary,
          marginBottom: spacing[4],
          lineHeight: '1.5'
        }}>
          Please provide a reason for declining this request. This will help the student understand and potentially improve future requests.
        </div>

        {/* Reason Input */}
        <div style={{ marginBottom: spacing[5] }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: colors.textPrimary,
            marginBottom: spacing[2]
          }}>
            Reason for declining *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please explain why you are declining this request..."
            disabled={isSubmitting}
            style={{
              width: '100%',
              minHeight: '120px',
              padding: spacing[3],
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              backgroundColor: isSubmitting ? colors.backgroundSecondary : 'white',
              opacity: isSubmitting ? 0.6 : 1
            }}
            onFocus={(e) => {
              if (!isSubmitting) {
                e.target.style.borderColor = colors.primary;
              }
            }}
            onBlur={(e) => {
              if (!isSubmitting) {
                e.target.style.borderColor = colors.border;
              }
            }}
          />
          <div style={{
            fontSize: '12px',
            color: colors.textTertiary,
            marginTop: spacing[1]
          }}>
            {reason.length}/500 characters
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: spacing[3],
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            style={{
              backgroundColor: 'transparent',
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: `${spacing[3]} ${spacing[4]}`,
              fontSize: '14px',
              fontWeight: '500',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: isSubmitting ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.target.style.backgroundColor = colors.backgroundSecondary;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason.trim() || isSubmitting}
            style={{
              backgroundColor: (!reason.trim() || isSubmitting)
                ? colors.textTertiary
                : colors.danger,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: `${spacing[3]} ${spacing[4]}`,
              fontSize: '14px',
              fontWeight: '500',
              cursor: (!reason.trim() || isSubmitting)
                ? 'not-allowed'
                : 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '140px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[2]
            }}
            onMouseEnter={(e) => {
              if (reason.trim() && !isSubmitting) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (reason.trim() && !isSubmitting) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {isSubmitting ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Declining...
              </>
            ) : (
              'Confirm Decline'
            )}
          </button>
        </div>
      </div>

      {/* Add spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default DeclineModal;