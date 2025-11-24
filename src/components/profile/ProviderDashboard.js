import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { colors, spacing } from '../../theme';
import { InterviewService } from '../../services/interviewService';
import { isServiceProvider } from '../../utils/profileUtils';
import PerformanceOverview from './PerformanceOverview';
import UpcomingSessions from './UpcomingSessions';
import PendingRequests from './PendingRequests';
import CompletedSessions from './CompletedSessions';
import ReviewModal from './ReviewModal';

/**
 * ProviderDashboard Component
 *
 * Main dashboard component for service providers that combines all provider-specific
 * features including performance metrics, session management, and requests handling.
 *
 * @param {Object} props - Component props
 * @param {Object} props.user - User object
 * @param {boolean} props.isMobile - Whether to use mobile layout
 */
const ProviderDashboard = ({ user, isMobile = false }) => {
  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const userIsProvider = isServiceProvider(user);

  // Mock data fallback for development/demo - using useMemo to fix ESLint warning
  const mockDashboardData = useMemo(() => ({
    this_month_bookings: 12,
    average_rating: 4.8,
    total_earnings: 2400,
    completed_services: 45,
    monthly_booking_trend: '+8%',
    rating_trend: '+0.2',
    earnings_trend: '+15%',
    completion_trend: '+12%'
  }), []);

  const mockUpcomingSessions = useMemo(() => [
    {
      id: 1,
      scheduled_time: '2025-11-25T14:00:00Z',
      student_name: 'Anonymous Student',
      session_type: 'mock_interview',
      status: 'confirmed',
      focus_areas: 'Technical interview preparation',
      duration: 60
    },
    {
      id: 2,
      scheduled_time: '2025-11-27T16:30:00Z',
      student_name: 'Jane S.',
      session_type: 'cv_review',
      status: 'confirmed',
      focus_areas: 'Resume optimization',
      duration: 45
    }
  ], []);

  const mockPendingRequests = useMemo(() => [
    {
      id: 3,
      student_name: 'Student A',
      session_type: 'mock_interview',
      preferred_slots: [{ date: '2025-11-30', time: '14:00:00' }],
      focus_areas: 'Computer Science PhD candidate - Looking for mock interview preparation for industry positions',
      additional_notes: 'Need help with algorithm questions',
      created_at: '2025-11-21T10:00:00Z'
    }
  ], []);

  const mockCompletedSessions = useMemo(() => [
    {
      id: 4,
      scheduled_time: '2025-11-18T14:00:00Z',
      student_name: 'Anonymous',
      session_type: 'mock_interview',
      status: 'completed',
      has_review: false,
      completion_date: '2025-11-18T15:00:00Z'
    },
    {
      id: 5,
      scheduled_time: '2025-11-15T16:00:00Z',
      student_name: 'John D.',
      session_type: 'cv_review',
      status: 'completed',
      has_review: true,
      completion_date: '2025-11-15T16:45:00Z'
    }
  ], []);

  /**
   * Fetch provider data from API with fallback to mock data
   */
  const fetchProviderData = useCallback(async (isRefresh = false) => {
    if (!userIsProvider) {
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch all provider data in parallel
      const [dashboard, pending, confirmed, completed] = await Promise.allSettled([
        InterviewService.getProviderDashboard(),
        InterviewService.getProviderSessions('pending'),
        InterviewService.getProviderSessions('confirmed'),
        InterviewService.getProviderSessions('completed')
      ]);

      // Use API data if available, otherwise fall back to mock data to show structure
      setDashboardData(
        dashboard.status === 'fulfilled' ? dashboard.value : mockDashboardData
      );
      setPendingRequests(
        pending.status === 'fulfilled' ? pending.value.results || [] : mockPendingRequests
      );
      setUpcomingSessions(
        confirmed.status === 'fulfilled' ? confirmed.value.results || [] : mockUpcomingSessions
      );
      setCompletedSessions(
        completed.status === 'fulfilled' ? completed.value.results || [] : mockCompletedSessions
      );

    } catch (error) {
      console.error('Error fetching provider data:', error);
      setError(error.message);

      // Use mock data on error to show structure
      setDashboardData(mockDashboardData);
      setPendingRequests(mockPendingRequests);
      setUpcomingSessions(mockUpcomingSessions);
      setCompletedSessions(mockCompletedSessions);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userIsProvider, mockDashboardData, mockPendingRequests, mockUpcomingSessions, mockCompletedSessions]);

  // Load data on mount
  useEffect(() => {
    fetchProviderData();
  }, [userIsProvider, fetchProviderData]);

  /**
   * Handle session request acceptance
   */
  const handleAcceptRequest = async (requestId, requestData) => {
    try {
      await InterviewService.acceptSessionRequest(requestId, requestData);
      // Refresh data to update UI
      await fetchProviderData(true);
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request. Please try again.');
    }
  };

  /**
   * Handle session request decline
   */
  const handleDeclineRequest = async (requestId, reason) => {
    try {
      await InterviewService.declineSessionRequest(requestId, reason);
      // Refresh data to update UI
      await fetchProviderData(true);
    } catch (error) {
      console.error('Error declining request:', error);
      alert('Failed to decline request. Please try again.');
    }
  };

  /**
   * Handle leaving a review
   */
  const handleLeaveReview = (session) => {
    setSelectedSession(session);
    setReviewModalOpen(true);
  };

  /**
   * Handle review submission
   */
  const handleReviewSubmit = async (reviewData) => {
    try {
      await InterviewService.submitSessionReview(selectedSession.id, reviewData);
      setReviewModalOpen(false);
      setSelectedSession(null);
      // Refresh completed sessions to reflect review submission
      await fetchProviderData(true);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  /**
   * Handle manual refresh
   */
  const handleRefresh = () => {
    fetchProviderData(true);
  };

  /**
   * Not a Provider Component
   */
  const NotProviderMessage = () => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: spacing[8],
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '18px',
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing[3]
      }}>
        Service Provider Features
      </div>
      <div style={{
        fontSize: '14px',
        color: colors.textSecondary,
        marginBottom: spacing[4],
        lineHeight: '1.5'
      }}>
        To access provider features, you need to be approved as a service provider.
        Contact support to learn more about becoming a provider.
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
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      textAlign: 'center'
    }}>
      <AlertCircle size={48} color={colors.danger} style={{ marginBottom: spacing[3] }} />
      <div style={{
        fontSize: '16px',
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing[2]
      }}>
        Error Loading Provider Data
      </div>
      <div style={{
        fontSize: '14px',
        color: colors.textSecondary,
        marginBottom: spacing[4]
      }}>
        {error || 'Unable to load provider dashboard data.'}
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
      Loading provider dashboard...
    </div>
  );

  // Early returns for different states
  if (!userIsProvider) return <NotProviderMessage />;
  if (loading) return <LoadingComponent />;
  if (error && !dashboardData) return <ErrorComponent />;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[6]
    }}>
      {/* Header with refresh option */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h2 style={{
          fontSize: isMobile ? '20px' : '24px',
          fontWeight: '700',
          color: colors.textPrimary,
          margin: 0
        }}>
          Provider Dashboard
        </h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            backgroundColor: 'transparent',
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: `${spacing[2]} ${spacing[3]}`,
            fontSize: '14px',
            color: colors.textSecondary,
            cursor: refreshing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2]
          }}
        >
          <RefreshCw size={16} style={{
            animation: refreshing ? 'spin 1s linear infinite' : 'none'
          }} />
          Refresh
        </button>
      </div>

      {/* Performance Overview */}
      <PerformanceOverview
        stats={dashboardData}
        isMobile={isMobile}
      />

      {/* Pending Requests */}
      <PendingRequests
        requests={pendingRequests}
        isMobile={isMobile}
        onAccept={handleAcceptRequest}
        onDecline={handleDeclineRequest}
      />

      {/* Upcoming Sessions */}
      <UpcomingSessions
        sessions={upcomingSessions}
        isMobile={isMobile}
      />

      {/* Completed Sessions */}
      <CompletedSessions
        sessions={completedSessions}
        isMobile={isMobile}
        onLeaveReview={handleLeaveReview}
      />

      {/* Review Modal */}
      {reviewModalOpen && selectedSession && (
        <ReviewModal
          session={selectedSession}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedSession(null);
          }}
          onSubmit={handleReviewSubmit}
        />
      )}

      {/* Add spinner animation for refresh button */}
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

export default ProviderDashboard;