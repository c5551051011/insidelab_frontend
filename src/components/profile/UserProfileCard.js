import React from 'react';
import { CheckCircle, Clock, Edit3, LogOut } from 'lucide-react';
import { colors, spacing } from '../../theme';
import { getInitials, getVerificationStatus } from '../../utils/profileUtils';

/**
 * UserProfileCard Component
 *
 * Displays user profile information including avatar, name, verification status,
 * stats, and action buttons. Adapts layout for mobile and desktop views.
 *
 * @param {Object} props - Component props
 * @param {Object} props.user - User data object
 * @param {Function} props.onEditProfile - Callback when edit profile is clicked
 * @param {Function} props.onSignOut - Callback when sign out is clicked
 * @param {boolean} props.isMobile - Whether to use mobile layout
 * @param {boolean} props.showStats - Whether to show user stats (desktop only)
 * @param {boolean} props.showNavigation - Whether this card includes navigation (for sidebar)
 * @param {string} props.activeTab - Currently active tab (for navigation)
 * @param {Function} props.onTabChange - Callback for tab changes (for navigation)
 */
const UserProfileCard = ({
  user,
  onEditProfile,
  onSignOut,
  isMobile = false,
  showStats = true,
  showNavigation = false,
  activeTab,
  onTabChange
}) => {

  const verification = getVerificationStatus(user.verificationStatus, t);
  const VerificationIcon = verification.icon === 'CheckCircle' ? CheckCircle : Clock;

  // Navigation menu items for sidebar
  const menuItems = showNavigation ? [
    { id: 'overview', label: t('profile.tabs.overview', 'Overview'), icon: 'User' },
    { id: 'academic', label: t('profile.tabs.academicProfile', 'Academic Profile'), icon: 'GraduationCap' },
    { id: 'research', label: t('profile.tabs.researchInterests', 'Research Interests'), icon: 'BookOpen' },
    { id: 'reviews', label: t('profile.tabs.myReviews', 'My Reviews'), icon: 'FileText' },
    { id: 'services', label: t('profile.tabs.serviceProvider', 'Service Provider'), icon: 'Briefcase' },
    { id: 'settings', label: t('profile.tabs.accountSettings', 'Account Settings'), icon: 'Settings' },
    { id: 'privacy', label: t('profile.tabs.privacySecurity', 'Privacy & Security'), icon: 'Shield' }
  ] : [];

  // Card styles
  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: isMobile ? spacing[5] : spacing[6],
    marginBottom: isMobile ? spacing[6] : 0,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    textAlign: 'center'
  };

  // Avatar styles
  const avatarSize = isMobile ? 64 : 100;
  const avatarStyle = {
    width: `${avatarSize}px`,
    height: `${avatarSize}px`,
    borderRadius: '50%',
    backgroundColor: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: isMobile ? '24px' : '40px',
    fontWeight: '700',
    color: 'white',
    margin: '0 auto',
    marginBottom: spacing[isMobile ? 3 : 4],
    boxShadow: isMobile
      ? '0 6px 20px rgba(37, 99, 235, 0.3)'
      : '0 8px 24px rgba(37, 99, 235, 0.3)'
  };

  // Stats section (desktop only)
  const StatsSection = () => {
    if (!showStats || isMobile) return null;

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: spacing[4],
        marginBottom: spacing[6],
        padding: spacing[4],
        backgroundColor: colors.backgroundSecondary,
        borderRadius: '12px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: colors.primary,
            marginBottom: spacing[1]
          }}>
            {user.reviewCount || 0}
          </div>
          <div style={{
            fontSize: '12px',
            color: colors.textSecondary
          }}>
            {t('profile.stats.reviews', 'Reviews')}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: colors.success,
            marginBottom: spacing[1]
          }}>
            {user.helpfulVotes || 0}
          </div>
          <div style={{
            fontSize: '12px',
            color: colors.textSecondary
          }}>
            {t('profile.stats.helpful', 'Helpful')}
          </div>
        </div>
      </div>
    );
  };

  // Action buttons section
  const ActionButtons = () => {
    if (isMobile) {
      return (
        <div style={{
          display: 'flex',
          gap: spacing[3],
          marginTop: spacing[4],
          justifyContent: 'center'
        }}>
          <button
            onClick={onEditProfile}
            style={{
              flex: 1,
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: `${spacing[2]} ${spacing[3]}`,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[2]
            }}
          >
            <Edit3 size={16} />
            {t('profile.editProfile', 'Edit Profile')}
          </button>

          <button
            onClick={onSignOut}
            style={{
              backgroundColor: 'transparent',
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: `${spacing[2]} ${spacing[3]}`,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      );
    }

    // Desktop buttons
    return (
      <>
        <button
          onClick={onEditProfile}
          style={{
            width: '100%',
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: `${spacing[3]} ${spacing[4]}`,
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing[2],
            transition: 'all 0.2s ease',
            marginBottom: spacing[3]
          }}
        >
          <Edit3 size={16} />
          {t('profile.editProfile', 'Edit Profile')}
        </button>

        <button
          onClick={onSignOut}
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            color: colors.textSecondary,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            padding: `${spacing[2]} ${spacing[4]}`,
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing[2],
            transition: 'all 0.2s ease'
          }}
        >
          <LogOut size={16} />
          {t('profile.signOut', 'Sign Out')}
        </button>
      </>
    );
  };

  return (
    <div style={cardStyle}>
      {/* Avatar */}
      <div style={avatarStyle}>
        {getInitials(user.name)}
      </div>

      {/* User Info */}
      <h2 style={{
        fontSize: isMobile ? '20px' : '24px',
        fontWeight: '700',
        color: colors.textPrimary,
        margin: 0,
        marginBottom: spacing[2]
      }}>
        {user.name || 'User'}
      </h2>

      {/* Verification Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[2],
        marginBottom: spacing[4]
      }}>
        <VerificationIcon size={16} color={verification.color} />
        <span style={{
          fontSize: '14px',
          color: verification.color,
          fontWeight: '500'
        }}>
          {verification.text}
        </span>
      </div>

      {/* Stats Section (desktop only) */}
      <StatsSection />

      {/* Action Buttons */}
      <ActionButtons />
    </div>
  );
};

/**
 * Mobile Profile Card - Simplified version for mobile views
 */
export const MobileProfileCard = (props) => (
  <UserProfileCard {...props} isMobile={true} showStats={false} showNavigation={false} />
);

/**
 * Desktop Profile Card - Full version for desktop sidebar
 */
export const DesktopProfileCard = (props) => (
  <UserProfileCard {...props} isMobile={false} showStats={true} showNavigation={false} />
);

export default UserProfileCard;