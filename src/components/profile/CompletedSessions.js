import React from 'react';
import { CheckCircle, Star } from 'lucide-react';
import { colors, spacing } from '../../theme';
import { formatDate, getSessionTypeLabel, getInitials } from '../../utils/profileUtils';

/**
 * CompletedSessions Component
 *
 * Displays completed sessions with review functionality.
 * Shows sessions that have been finished and allows leaving reviews for those that don't have one yet.
 *
 * @param {Object} props - Component props
 * @param {Array} props.sessions - Array of completed session objects
 * @param {boolean} props.isMobile - Whether to use mobile layout
 * @param {Function} props.onLeaveReview - Callback when leave review is clicked
 */
const CompletedSessions = ({ sessions = [], isMobile = false, onLeaveReview }) => {

  /**
   * Session Card Component
   */
  const SessionCard = ({ session }) => {
    const dateInfo = formatDate(session.scheduled_time);

    return (
      <div style={{
        padding: spacing[4],
        backgroundColor: colors.background,
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing[4],
        transition: 'all 0.2s ease'
      }}>
        {/* Session Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[3],
          flex: 1
        }}>
          {/* Student Avatar */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: colors.success,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: '16px',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
          }}>
            {getInitials(session.student_name)}
          </div>

          {/* Session Details */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[1]
            }}>
              {getSessionTypeLabel(session.session_type)}
            </div>
            <div style={{
              fontSize: isMobile ? '12px' : '14px',
              color: colors.textSecondary,
              marginBottom: spacing[2]
            }}>
              {session.student_name || 'Anonymous Student'} • {dateInfo.shortDate} at {dateInfo.time}
            </div>

            {/* Session Details */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[3],
              flexWrap: 'wrap'
            }}>
              <span style={{
                fontSize: '12px',
                padding: `${spacing[1]} ${spacing[2]}`,
                backgroundColor: `${colors.success}15`,
                color: colors.success,
                borderRadius: '8px',
                fontWeight: '500'
              }}>
                Completed
              </span>

              {session.duration && (
                <span style={{
                  fontSize: '12px',
                  color: colors.textTertiary
                }}>
                  {session.duration} mins
                </span>
              )}

              {session.completion_date && (
                <span style={{
                  fontSize: '12px',
                  color: colors.textTertiary
                }}>
                  Completed {formatDate(session.completion_date).shortDate}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[3]
        }}>
          {session.has_review ? (
            // Review already submitted
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              color: colors.success,
              fontSize: '14px',
              fontWeight: '500',
              padding: `${spacing[2]} ${spacing[3]}`,
              backgroundColor: `${colors.success}15`,
              borderRadius: '8px'
            }}>
              <CheckCircle size={16} />
              Review Submitted
            </div>
          ) : (
            // Leave review button
            <button
              onClick={() => onLeaveReview(session)}
              style={{
                backgroundColor: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: `${spacing[2]} ${spacing[3]}`,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2]
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.primaryDark || '#1D4ED8';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = colors.primary;
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <Star size={16} />
              Leave Review
            </button>
          )}
        </div>
      </div>
    );
  };

  /**
   * Empty State Component
   */
  const EmptyState = () => (
    <div style={{
      padding: spacing[8],
      textAlign: 'center',
      color: colors.textSecondary
    }}>
      <CheckCircle
        size={48}
        color={colors.textTertiary}
        style={{ marginBottom: spacing[3] }}
      />
      <div style={{
        fontSize: '16px',
        fontWeight: '500',
        marginBottom: spacing[2]
      }}>
        No completed sessions yet
      </div>
      <div style={{
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        Sessions you've completed will appear here
      </div>
    </div>
  );

  /**
   * Sessions List Component
   */
  const SessionsList = () => {
    if (sessions.length === 0) {
      return <EmptyState />;
    }

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[3]
      }}>
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    );
  };

  return (
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
        <CheckCircle size={24} color={colors.success} />
        <h3 style={{
          fontSize: isMobile ? '18px' : '20px',
          fontWeight: '700',
          color: colors.textPrimary,
          margin: 0,
          marginLeft: spacing[3]
        }}>
          Completed Sessions
        </h3>
        <span style={{
          backgroundColor: `${colors.success}15`,
          color: colors.success,
          padding: `${spacing[1]} ${spacing[2]}`,
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          marginLeft: spacing[3]
        }}>
          {sessions?.length || 0} sessions
        </span>
      </div>

      {/* Sessions List */}
      <SessionsList />
    </div>
  );
};

export default CompletedSessions;