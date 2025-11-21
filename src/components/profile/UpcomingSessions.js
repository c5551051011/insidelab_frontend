import React from 'react';
import { Clock3, ChevronRight, Calendar } from 'lucide-react';
import { colors, spacing } from '../../theme';
import { formatDate, getSessionTypeLabel, getStatusColor } from '../../utils/profileUtils';

/**
 * UpcomingSessions Component
 *
 * Displays upcoming confirmed sessions with calendar-style date display
 * and session details. Shows sessions in a card layout with prominent dates.
 *
 * @param {Object} props - Component props
 * @param {Array} props.sessions - Array of upcoming session objects
 * @param {boolean} props.isMobile - Whether to use mobile layout
 * @param {Function} props.onSessionClick - Callback when session is clicked (optional)
 */
const UpcomingSessions = ({ sessions = [], isMobile = false, onSessionClick }) => {

  /**
   * Session Card Component
   */
  const SessionCard = ({ session }) => {
    const dateInfo = formatDate(session.scheduled_time);

    return (
      <div
        key={session.id}
        style={{
          padding: spacing[4],
          backgroundColor: colors.background,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: spacing[4],
          cursor: onSessionClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          border: '1px solid rgba(0, 0, 0, 0.05)'
        }}
        onClick={() => onSessionClick && onSessionClick(session)}
        onMouseEnter={(e) => {
          if (onSessionClick) {
            e.target.style.backgroundColor = '#F8FAFC';
            e.target.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (onSessionClick) {
            e.target.style.backgroundColor = colors.background;
            e.target.style.transform = 'translateY(0)';
          }
        }}
      >
        {/* Calendar Date Display */}
        <div style={{
          minWidth: isMobile ? '50px' : '60px',
          textAlign: 'center',
          padding: spacing[isMobile ? 2 : 3],
          backgroundColor: colors.primary,
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
        }}>
          <div style={{
            fontSize: isMobile ? '16px' : '20px',
            fontWeight: '700',
            lineHeight: 1
          }}>
            {dateInfo.day}
          </div>
          <div style={{
            fontSize: isMobile ? '10px' : '12px',
            fontWeight: '500',
            opacity: 0.9,
            textTransform: 'uppercase'
          }}>
            {dateInfo.month}
          </div>
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
            marginBottom: spacing[1]
          }}>
            {session.student_name || 'Anonymous Student'} • {dateInfo.time}
          </div>

          {session.focus_areas && (
            <div style={{
              fontSize: '12px',
              color: colors.textSecondary,
              marginBottom: spacing[2],
              lineHeight: '1.4'
            }}>
              Focus: {session.focus_areas}
            </div>
          )}

          {session.notes && (
            <div style={{
              fontSize: '12px',
              color: colors.textSecondary,
              marginBottom: spacing[2],
              lineHeight: '1.4',
              fontStyle: 'italic'
            }}>
              Note: {session.notes}
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2]
          }}>
            <span style={{
              fontSize: '12px',
              padding: `${spacing[1]} ${spacing[2]}`,
              backgroundColor: `${colors.success}15`,
              color: colors.success,
              borderRadius: '8px',
              fontWeight: '500'
            }}>
              Confirmed
            </span>

            {session.duration && (
              <span style={{
                fontSize: '12px',
                color: colors.textTertiary
              }}>
                {session.duration} mins
              </span>
            )}
          </div>
        </div>

        {/* Action Indicator */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: spacing[1],
          minWidth: '40px'
        }}>
          <div style={{
            fontSize: '12px',
            color: colors.textSecondary,
            textAlign: 'center'
          }}>
            {dateInfo.time}
          </div>
          {onSessionClick && <ChevronRight size={16} color={colors.textTertiary} />}
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
      <Calendar
        size={48}
        color={colors.textTertiary}
        style={{ marginBottom: spacing[3] }}
      />
      <div style={{
        fontSize: '16px',
        fontWeight: '500',
        marginBottom: spacing[2]
      }}>
        No upcoming sessions
      </div>
      <div style={{
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        Your confirmed sessions will appear here
      </div>
    </div>
  );

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
        justifyContent: 'space-between',
        marginBottom: spacing[5]
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[3]
        }}>
          <Clock3 size={24} color={colors.primary} />
          <h3 style={{
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: '700',
            color: colors.textPrimary,
            margin: 0
          }}>
            Upcoming Sessions
          </h3>
        </div>

        <span style={{
          backgroundColor: `${colors.primary}15`,
          color: colors.primary,
          padding: `${spacing[1]} ${spacing[2]}`,
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {sessions?.length || 0} sessions
        </span>
      </div>

      {/* Session List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[3]
      }}>
        {sessions?.length === 0 ? (
          <EmptyState />
        ) : (
          sessions?.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingSessions;