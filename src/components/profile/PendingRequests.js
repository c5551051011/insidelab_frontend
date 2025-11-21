import React, { useState } from 'react';
import { MessageSquare, Check, X } from 'lucide-react';
import { colors, spacing } from '../../theme';
import { formatSimpleDate, getSessionTypeLabel, getInitials } from '../../utils/profileUtils';
import DeclineModal from './DeclineModal';

/**
 * PendingRequests Component
 *
 * Displays pending session requests in a message card style layout.
 * Provides actions to accept or decline requests with appropriate modals.
 *
 * @param {Object} props - Component props
 * @param {Array} props.requests - Array of pending request objects
 * @param {boolean} props.isMobile - Whether to use mobile layout
 * @param {Function} props.onAccept - Callback when request is accepted
 * @param {Function} props.onDecline - Callback when request is declined
 */
const PendingRequests = ({ requests = [], isMobile = false, onAccept, onDecline }) => {
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle accept request
   */
  const handleAcceptClick = async (request) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const requestData = {
        selected_slot: request.preferred_slots?.[0] || {},
        confirmed_time: request.preferred_slots?.[0]?.date + 'T' + request.preferred_slots?.[0]?.time
      };
      await onAccept(request.id, requestData);
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle decline request click
   */
  const handleDeclineClick = (request) => {
    setSelectedRequest(request);
    setDeclineModalOpen(true);
  };

  /**
   * Handle decline confirmation
   */
  const handleDeclineConfirm = async (reason) => {
    if (!selectedRequest || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onDecline(selectedRequest.id, reason);
      setDeclineModalOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error declining request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle decline modal close
   */
  const handleDeclineModalClose = () => {
    if (!isSubmitting) {
      setDeclineModalOpen(false);
      setSelectedRequest(null);
    }
  };

  /**
   * Request Card Component
   */
  const RequestCard = ({ request }) => (
    <div style={{
      padding: spacing[5],
      backgroundColor: colors.background,
      borderRadius: '12px',
      border: `1px solid ${colors.border}`,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      transition: 'all 0.2s ease'
    }}>
      {/* Message Card Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: spacing[3],
        paddingBottom: spacing[3],
        borderBottom: `1px solid ${colors.border}`
      }}>
        {/* Student Avatar */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: colors.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '600',
          fontSize: '16px',
          marginRight: spacing[3],
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
        }}>
          {getInitials(request.student_name)}
        </div>

        {/* Request Info */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[1]
          }}>
            {getSessionTypeLabel(request.session_type)} Request
          </div>
          <div style={{
            fontSize: isMobile ? '12px' : '14px',
            color: colors.textSecondary
          }}>
            From: {request.student_name || 'Anonymous Student'} • {formatSimpleDate(request.created_at)}
          </div>
        </div>

        {/* Status Indicator */}
        <div style={{
          padding: `${spacing[1]} ${spacing[2]}`,
          backgroundColor: `${colors.warning}15`,
          color: colors.warning,
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          Pending
        </div>
      </div>

      {/* Request Details */}
      <div style={{ marginBottom: spacing[4] }}>
        {/* Preferred Time */}
        {request.preferred_slots && request.preferred_slots.length > 0 && (
          <div style={{
            fontSize: '14px',
            color: colors.textSecondary,
            marginBottom: spacing[3],
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2]
          }}>
            <strong>Preferred Time:</strong>
            <span style={{
              backgroundColor: 'white',
              padding: `${spacing[1]} ${spacing[2]}`,
              borderRadius: '6px',
              border: `1px solid ${colors.border}`,
              color: colors.textPrimary
            }}>
              {formatSimpleDate(request.preferred_slots[0].date)} at {request.preferred_slots[0].time}
            </span>
          </div>
        )}

        {/* Focus Areas */}
        {request.focus_areas && (
          <div style={{
            marginBottom: spacing[3]
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              color: colors.textPrimary,
              marginBottom: spacing[2]
            }}>
              Focus Areas:
            </div>
            <div style={{
              fontSize: '14px',
              color: colors.textPrimary,
              padding: spacing[3],
              backgroundColor: 'white',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              lineHeight: '1.5'
            }}>
              {request.focus_areas}
            </div>
          </div>
        )}

        {/* Additional Notes */}
        {request.additional_notes && (
          <div style={{
            marginBottom: spacing[2]
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              color: colors.textPrimary,
              marginBottom: spacing[2]
            }}>
              Message:
            </div>
            <div style={{
              fontSize: '14px',
              color: colors.textSecondary,
              fontStyle: 'italic',
              padding: spacing[3],
              backgroundColor: 'white',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              lineHeight: '1.5'
            }}>
              "{request.additional_notes}"
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: spacing[3],
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={() => handleDeclineClick(request)}
          disabled={isSubmitting}
          style={{
            backgroundColor: 'transparent',
            color: colors.textSecondary,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: `${spacing[2]} ${spacing[4]}`,
            fontSize: '14px',
            fontWeight: '500',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: isSubmitting ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2]
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.target.style.backgroundColor = colors.backgroundSecondary;
              e.target.style.borderColor = colors.danger;
              e.target.style.color = colors.danger;
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = colors.border;
              e.target.style.color = colors.textSecondary;
            }
          }}
        >
          <X size={16} />
          Decline
        </button>

        <button
          onClick={() => handleAcceptClick(request)}
          disabled={isSubmitting}
          style={{
            backgroundColor: isSubmitting ? colors.textTertiary : colors.success,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: `${spacing[2]} ${spacing[4]}`,
            fontSize: '14px',
            fontWeight: '500',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            minWidth: '120px',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }
          }}
        >
          <Check size={16} />
          {isSubmitting ? 'Processing...' : 'Accept Request'}
        </button>
      </div>
    </div>
  );

  /**
   * Empty State Component
   */
  const EmptyState = () => (
    <div style={{
      padding: spacing[8],
      textAlign: 'center',
      color: colors.textSecondary
    }}>
      <MessageSquare
        size={48}
        color={colors.textTertiary}
        style={{ marginBottom: spacing[3] }}
      />
      <div style={{
        fontSize: '16px',
        fontWeight: '500',
        marginBottom: spacing[2]
      }}>
        No pending requests
      </div>
      <div style={{
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        New session requests will appear here for your review
      </div>
    </div>
  );

  return (
    <>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: spacing[6],
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: spacing[5]
        }}>
          <MessageSquare size={24} color={colors.warning} />
          <h3 style={{
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: '700',
            color: colors.textPrimary,
            margin: 0,
            marginLeft: spacing[3]
          }}>
            Pending Requests
          </h3>
          <span style={{
            backgroundColor: `${colors.warning}15`,
            color: colors.warning,
            padding: `${spacing[1]} ${spacing[2]}`,
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            marginLeft: spacing[3]
          }}>
            {requests.length} requests
          </span>
        </div>

        {/* Request List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[4]
        }}>
          {requests.length === 0 ? (
            <EmptyState />
          ) : (
            requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          )}
        </div>
      </div>

      {/* Decline Modal */}
      <DeclineModal
        isOpen={declineModalOpen}
        onClose={handleDeclineModalClose}
        onConfirm={handleDeclineConfirm}
        request={selectedRequest}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default PendingRequests;