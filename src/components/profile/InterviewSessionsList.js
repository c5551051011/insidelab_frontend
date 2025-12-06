import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { colors, spacing } from '../../theme';
import { InterviewService } from '../../services/interviewService';
import { formatDate, getSessionTypeLabel, getStatusColor } from '../../utils/profileUtils';

/**
 * InterviewSessionsList Component
 *
 * Displays interview sessions for regular users (non-providers).
 * Shows upcoming, pending, and completed sessions in a clean layout.
 *
 * @param {Object} props - Component props
 * @param {Object} props.user - User object
 * @param {boolean} props.isMobile - Whether to use mobile layout
 */
const InterviewSessionsList = ({ user, isMobile = false }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for development/demo - using useMemo to fix ESLint warning
  const mockSessions = useMemo(() => [
    {
      id: 1,
      scheduled_time: '2025-11-25T15:00:00Z',
      provider_name: 'Dr. Smith',
      session_type: 'mock_interview',
      status: 'confirmed',
      focus_areas: 'Technical interview preparation'
    },
    {
      id: 2,
      scheduled_time: '2025-11-22T10:00:00Z',
      provider_name: 'Prof. Johnson',
      session_type: 'cv_review',
      status: 'pending',
      focus_areas: 'Resume optimization'
    },
    {
      id: 3,
      scheduled_time: '2025-11-15T14:00:00Z',
      provider_name: 'Dr. Brown',
      session_type: 'research_consultation',
      status: 'completed',
      focus_areas: 'Research methodology discussion'
    }
  ], []);

  /**
   * Fetch user's interview sessions
   */
  const fetchSessions = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch user's sessions from API
      const response = await InterviewService.getUserSessions();
      setSessions(response.results || []);

    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError(error.message);
      // Show structure even on error
      setSessions(mockSessions);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mockSessions]);

  // Load sessions on mount
  useEffect(() => {
    fetchSessions();
  }, [user, fetchSessions]);

  /**
   * Handle manual refresh
   */
  const handleRefresh = () => {
    fetchSessions(true);
  };

  /**
   * Session Card Component
   */
  const SessionCard = ({ session }) => {
    const dateInfo = formatDate(session.scheduled_time);
    const statusColor = getStatusColor(session.status);

    return (
      <div style={{
        padding: spacing[4],
        backgroundColor: colors.background,
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: spacing[4],
        transition: 'all 0.2s ease'
      }}>
        {/* Date/Status Icon */}
        <div style={{
          minWidth: isMobile ? '50px' : '60px',
          textAlign: 'center',
          padding: spacing[isMobile ? 2 : 3],
          backgroundColor: `${statusColor}15`,
          borderRadius: '12px',
          color: statusColor
        }}>
          {session.status === 'completed' ? (
            <Clock size={24} />
          ) : (
            <>
              <div style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                lineHeight: 1
              }}>
                {dateInfo.day}
              </div>
              <div style={{
                fontSize: isMobile ? '10px' : '12px',
                fontWeight: '500',
                textTransform: 'uppercase'
              }}>
                {dateInfo.month}
              </div>
            </>
          )}
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
            {session.provider_name} • {dateInfo.time}
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

          <span style={{
            fontSize: '12px',
            padding: `${spacing[1]} ${spacing[2]}`,
            backgroundColor: `${statusColor}15`,
            color: statusColor,
            borderRadius: '8px',
            fontWeight: '500',
            textTransform: 'capitalize'
          }}>
            {session.status}
          </span>
        </div>

        {/* Additional Info */}
        <div style={{
          textAlign: 'right',
          minWidth: '80px'
        }}>
          <div style={{
            fontSize: '12px',
            color: colors.textTertiary,
            textAlign: 'center'
          }}>
            {session.status !== 'completed' && dateInfo.time}
            {session.status === 'completed' && 'Finished'}
          </div>
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
        No interview sessions yet
      </div>
      <div style={{
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        Book your first session to get started with personalized guidance
      </div>
    </div>
  );

  /**
   * Error Component
   */
  const ErrorComponent = () => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: spacing[6],
      textAlign: 'center'
    }}>
      <AlertCircle size={48} color={colors.danger} style={{ marginBottom: spacing[3] }} />
      <div style={{
        fontSize: '16px',
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing[2]
      }}>
        Error Loading Sessions
      </div>
      <div style={{
        fontSize: '14px',
        color: colors.textSecondary,
        marginBottom: spacing[4]
      }}>
        {error || 'Unable to load your interview sessions.'}
      </div>
      <button
        onClick={handleRefresh}
        style={{
          backgroundColor: colors.primary,
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: `${spacing[2]} ${spacing[4]}`,
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2],
          margin: '0 auto'
        }}
      >
        <RefreshCw size={16} />
        Try Again
      </button>
    </div>
  );

  /**
   * Loading Component
   */
  const LoadingComponent = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing[8],
      fontSize: '16px',
      color: colors.textSecondary
    }}>
      Loading your sessions...
    </div>
  );


  if (loading) return <LoadingComponent />;
  if (error && sessions.length === 0) return <ErrorComponent />;

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
          <h3 style={{
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: '700',
            color: colors.textPrimary,
            margin: 0
          }}>
            My Interview Sessions
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <span style={{
            backgroundColor: `${colors.primary}15`,
            color: colors.primary,
            padding: `${spacing[1]} ${spacing[2]}`,
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {sessions.length} sessions
          </span>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              backgroundColor: 'transparent',
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: spacing[2],
              color: colors.textSecondary,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <RefreshCw size={16} style={{
              animation: refreshing ? 'spin 1s linear infinite' : 'none'
            }} />
          </button>
        </div>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[3]
        }}>
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}

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

export default InterviewSessionsList;