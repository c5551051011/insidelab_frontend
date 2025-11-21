/**
 * Profile Components - Main Export File
 *
 * This file exports all profile-related components for clean imports
 * throughout the application.
 */

// Core Profile Components
export { default as UserProfileCard, MobileProfileCard, DesktopProfileCard } from './UserProfileCard';

// Session Management Components
export { default as UpcomingSessions } from './UpcomingSessions';
export { default as PendingRequests } from './PendingRequests';
export { default as CompletedSessions } from './CompletedSessions';

// Modal Components
export { default as ReviewModal } from './ReviewModal';
export { default as DeclineModal } from './DeclineModal';

// Performance Components
export { default as PerformanceOverview, FeaturedPerformanceOverview } from './PerformanceOverview';

// Provider Dashboard
export { default as ProviderDashboard } from './ProviderDashboard';

// Interview Sessions List (for regular users)
export { default as InterviewSessionsList } from './InterviewSessionsList';

/**
 * Re-export commonly used utility functions for convenience
 */
export {
  getInitials,
  formatDate,
  formatSimpleDate,
  getSessionTypeLabel,
  getVerificationStatus,
  getStatusColor,
  calculateRatingStats,
  truncateText,
  formatCurrency,
  isServiceProvider,
  getAcademicLevelText
} from '../../utils/profileUtils';