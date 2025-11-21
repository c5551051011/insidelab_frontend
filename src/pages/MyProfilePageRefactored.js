import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, GraduationCap, BookOpen, FileText, Briefcase, Settings, Shield } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EditProfileModal from '../components/EditProfileModal';
import ResearchInterestsModal from '../components/ResearchInterestsModal';
import { colors, spacing } from '../theme';
import { AuthService } from '../services/authService';
import { useTranslation } from '../i18n';
import { useBreakpoint } from '../hooks/useBreakpoint';

// Import the new refactored components
import {
  UserProfileCard,
  MobileProfileCard,
  DesktopProfileCard,
  InterviewSessionsList,
  ProviderDashboard,
  isServiceProvider
} from '../components/profile';

/**
 * MyProfilePageRefactored - Refactored version of MyProfilePage
 *
 * This demonstrates how the original MyProfilePage would look after refactoring
 * into smaller, manageable components with clear separation of concerns.
 */
const MyProfilePageRefactored = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);
  const { isMobile } = useBreakpoint();

  // Authentication and user data loading
  useEffect(() => {
    const checkAuth = async () => {
      if (!AuthService.isAuthenticated()) {
        navigate('/sign-in');
        return;
      }

      try {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user data:', error);
        AuthService.logout();
        navigate('/sign-in');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  /**
   * Handle user sign out
   */
  const handleSignOut = () => {
    if (window.confirm(t('profile.signOutConfirm', 'Are you sure you want to sign out?'))) {
      AuthService.logout();
    }
  };

  /**
   * Handle edit profile
   */
  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  /**
   * Handle user data update after profile edit
   */
  const handleUserUpdate = async (updatedUser) => {
    try {
      const latestUser = await AuthService.getCurrentUser();
      setUser(latestUser);
    } catch (error) {
      console.error('Error fetching updated user data:', error);
      setUser(updatedUser);
    }
  };

  /**
   * Navigation menu items
   */
  const getMenuItems = () => [
    { id: 'overview', label: t('profile.tabs.overview', 'Overview'), icon: User },
    { id: 'academic', label: t('profile.tabs.academicProfile', 'Academic Profile'), icon: GraduationCap },
    { id: 'research', label: t('profile.tabs.researchInterests', 'Research Interests'), icon: BookOpen },
    { id: 'reviews', label: t('profile.tabs.myReviews', 'My Reviews'), icon: FileText },
    { id: 'services', label: t('profile.tabs.serviceProvider', 'Service Provider'), icon: Briefcase },
    { id: 'settings', label: t('profile.tabs.accountSettings', 'Account Settings'), icon: Settings },
    { id: 'privacy', label: t('profile.tabs.privacySecurity', 'Privacy & Security'), icon: Shield }
  ];

  /**
   * Profile Navigation Component
   */
  const ProfileNavigation = ({ menuItems }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      overflow: 'hidden'
    }}>
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              width: '100%',
              backgroundColor: isActive ? `${colors.primary}08` : 'transparent',
              border: 'none',
              borderBottom: index < menuItems.length - 1 ? `1px solid ${colors.border}` : 'none',
              padding: spacing[4],
              fontSize: '14px',
              fontWeight: isActive ? '600' : '500',
              color: isActive ? colors.primary : colors.textPrimary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: spacing[3],
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
          >
            <Icon size={18} color={isActive ? colors.primary : colors.textSecondary} />
            {item.label}
          </button>
        );
      })}
    </div>
  );

  /**
   * Mobile Tab Navigation Component
   */
  const MobileTabNavigation = ({ menuItems }) => (
    <div style={{
      display: 'flex',
      overflowX: 'auto',
      gap: spacing[2],
      marginBottom: spacing[4],
      paddingBottom: spacing[2]
    }}>
      {menuItems.slice(0, 5).map((item) => { // Show first 5 tabs on mobile
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              minWidth: '80px',
              padding: `${spacing[2]} ${spacing[3]}`,
              backgroundColor: isActive ? colors.primary : 'white',
              color: isActive ? 'white' : colors.textSecondary,
              border: isActive ? 'none' : `1px solid ${colors.border}`,
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: spacing[1],
              transition: 'all 0.2s ease'
            }}
          >
            <Icon size={16} />
            <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );

  /**
   * Render content based on active tab
   */
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        // Show appropriate overview based on user type
        if (isServiceProvider(user)) {
          return <ProviderDashboard user={user} isMobile={isMobile} />;
        } else {
          return <InterviewSessionsList user={user} isMobile={isMobile} />;
        }

      case 'services':
        return <ProviderDashboard user={user} isMobile={isMobile} />;

      case 'academic':
      case 'research':
      case 'reviews':
      case 'settings':
      case 'privacy':
      default:
        // Placeholder for other tabs - would import and use appropriate components
        return (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: spacing[8],
            textAlign: 'center',
            color: colors.textSecondary
          }}>
            <h3 style={{ marginBottom: spacing[4] }}>
              {getMenuItems().find(item => item.id === activeTab)?.label}
            </h3>
            <p>This section would contain the {activeTab} content.</p>
            <p style={{ fontSize: '14px', marginTop: spacing[4] }}>
              Additional components like AcademicProfile, ResearchInterests, ReviewsTab,
              SettingsTab, and PrivacyTab would be extracted and placed here.
            </p>
          </div>
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Header />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          fontSize: '18px',
          color: colors.textSecondary
        }}>
          {t('profile.loading', 'Loading profile...')}
        </div>
        <Footer />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Header />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          fontSize: '18px',
          color: colors.textSecondary
        }}>
          {t('profile.loginRequired', 'Please log in to view your profile.')}
        </div>
        <Footer />
      </div>
    );
  }

  const menuItems = getMenuItems();

  // Mobile layout
  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
        <Header />

        <div style={{
          padding: spacing[4],
          minHeight: 'calc(100vh - 200px)'
        }}>
          {/* Mobile Profile Card */}
          <MobileProfileCard
            user={user}
            onSignOut={handleSignOut}
            onEditProfile={handleEditProfile}
          />

          {/* Mobile Tab Navigation */}
          <MobileTabNavigation menuItems={menuItems} />

          {/* Mobile Content */}
          {renderContent()}
        </div>

        <Footer />

        {/* Modals */}
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onUserUpdate={handleUserUpdate}
        />

        <ResearchInterestsModal
          isOpen={isResearchModalOpen}
          onClose={() => setIsResearchModalOpen(false)}
          user={user}
          onUserUpdate={handleUserUpdate}
        />
      </div>
    );
  }

  // Desktop layout
  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
      <Header />

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: spacing[6],
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: spacing[8],
        minHeight: 'calc(100vh - 200px)'
      }}>
        {/* Left Sidebar */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[6]
        }}>
          {/* Desktop Profile Card */}
          <DesktopProfileCard
            user={user}
            onSignOut={handleSignOut}
            onEditProfile={handleEditProfile}
          />

          {/* Navigation Menu */}
          <ProfileNavigation menuItems={menuItems} />
        </div>

        {/* Main Content */}
        <div style={{ minHeight: '500px' }}>
          {renderContent()}
        </div>
      </div>

      <Footer />

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onUserUpdate={handleUserUpdate}
      />

      <ResearchInterestsModal
        isOpen={isResearchModalOpen}
        onClose={() => setIsResearchModalOpen(false)}
        user={user}
        onUserUpdate={handleUserUpdate}
      />
    </div>
  );
};

export default MyProfilePageRefactored;