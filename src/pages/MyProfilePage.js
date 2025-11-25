import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, GraduationCap, BookOpen, FileText, Briefcase, Settings, Shield, Heart, Plus, Edit2, Trash2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EditProfileModal from '../components/EditProfileModal';
import ResearchInterestsModal from '../components/ResearchInterestsModal';
import { colors, spacing } from '../theme';
import { AuthService } from '../services/authService';
import { ApiService } from '../services/apiService';
import { ResearchProfileService } from '../services/researchProfileService';
import { useBreakpoint } from '../hooks/useBreakpoint';
import LabCard from '../components/search/LabCard';

// Import the new refactored components
import {
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);
  const [researchProfile, setResearchProfile] = useState(null);
  const [interestedLabs, setInterestedLabs] = useState([]);
  const [labsLoading, setLabsLoading] = useState(false);
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

        // Load research profile
        if (currentUser.research_profile) {
          setResearchProfile(ResearchProfileService.transformFromApiFormat(currentUser.research_profile));
        }
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

  // Load interested labs
  useEffect(() => {
    const loadInterestedLabs = async () => {
      if (!user) return;

      setLabsLoading(true);
      try {
        const response = await ApiService.getLabInterests();
        const labs = response.results || response || [];
        setInterestedLabs(labs);
      } catch (error) {
        console.error('Error loading interested labs:', error);
        setInterestedLabs([]);
      } finally {
        setLabsLoading(false);
      }
    };

    loadInterestedLabs();
  }, [user]);

  /**
   * Handle user sign out
   */
  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
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

      // Update research profile if it exists
      if (latestUser.research_profile) {
        setResearchProfile(ResearchProfileService.transformFromApiFormat(latestUser.research_profile));
      } else {
        setResearchProfile(null);
      }
    } catch (error) {
      console.error('Error fetching updated user data:', error);
      setUser(updatedUser);
    }
  };

  /**
   * Navigation menu items
   */
  const getMenuItems = () => [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'academic', label: 'Academic Profile', icon: GraduationCap },
    { id: 'research', label: 'Research Interests', icon: BookOpen },
    { id: 'reviews', label: 'Activities', icon: FileText },
    { id: 'services', label: 'Service Provider', icon: Briefcase },
    { id: 'settings', label: 'Account Settings', icon: Settings },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield }
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
        // Show basic user information overview
        return (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: spacing[6],
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: spacing[6],
              fontFamily: 'Inter'
            }}>
              Profile Overview
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: spacing[4]
            }}>
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  marginBottom: spacing[2],
                  fontFamily: 'Inter'
                }}>
                  Account Information
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: colors.textSecondary,
                  marginBottom: spacing[3],
                  fontFamily: 'Inter'
                }}>
                  Name: {user?.name || 'Not provided'}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: colors.textSecondary,
                  marginBottom: spacing[3],
                  fontFamily: 'Inter'
                }}>
                  Email: {user?.email || 'Not provided'}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: colors.textSecondary,
                  fontFamily: 'Inter'
                }}>
                  Member since: {user?.createdAt ? new Date(user.createdAt).getFullYear() : 'N/A'}
                </p>
              </div>

              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  marginBottom: spacing[2],
                  fontFamily: 'Inter'
                }}>
                  Profile Status
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: colors.textSecondary,
                  marginBottom: spacing[3],
                  fontFamily: 'Inter'
                }}>
                  Verification: {user?.verificationStatus || 'Unverified'}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: colors.textSecondary,
                  marginBottom: spacing[3],
                  fontFamily: 'Inter'
                }}>
                  Service Provider: {isServiceProvider(user) ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        );

      case 'services':
        return <ProviderDashboard user={user} isMobile={isMobile} />;

      case 'reviews':
        // Activities tab - shows interview sessions and reviews
        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[6]
          }}>
            {/* Interview Sessions */}
            <InterviewSessionsList user={user} isMobile={isMobile} />

            {/* Reviews Section - Placeholder for now */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: spacing[6],
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{
                fontSize: isMobile ? '18px' : '20px',
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: spacing[4]
              }}>
                My Reviews
              </h3>
              <p style={{
                fontSize: '14px',
                color: colors.textSecondary,
                textAlign: 'center',
                padding: spacing[4]
              }}>
                Review functionality coming soon
              </p>
            </div>
          </div>
        );

      case 'research':
        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[6]
          }}>
            {/* Research Interests Section */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: spacing[6],
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing[5]
              }}>
                <h3 style={{
                  fontSize: isMobile ? '18px' : '20px',
                  fontWeight: '700',
                  color: colors.textPrimary,
                  margin: 0
                }}>
                  Research Interests
                </h3>
                <button
                  onClick={() => setIsResearchModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    padding: `${spacing[2]} ${spacing[4]}`,
                    backgroundColor: colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {researchProfile ? <Edit2 size={16} /> : <Plus size={16} />}
                  {researchProfile ? 'Edit' : 'Add'}
                </button>
              </div>

              {researchProfile ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: spacing[4]
                }}>
                  {/* Primary Research Area */}
                  {researchProfile.researchArea && (
                    <div>
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: colors.textSecondary,
                        marginBottom: spacing[2],
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Primary Research Area
                      </h4>
                      <p style={{
                        fontSize: '16px',
                        color: colors.textPrimary,
                        margin: 0
                      }}>
                        {researchProfile.researchArea}
                      </p>
                    </div>
                  )}

                  {/* Specialties */}
                  {researchProfile.specialties && researchProfile.specialties.length > 0 && (
                    <div>
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: colors.textSecondary,
                        marginBottom: spacing[2],
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Specialties & Interests
                      </h4>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: spacing[2]
                      }}>
                        {researchProfile.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            style={{
                              padding: `${spacing[1]} ${spacing[3]}`,
                              backgroundColor: `${colors.primary}10`,
                              color: colors.primary,
                              borderRadius: '16px',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Keywords */}
                  {researchProfile.keywords && researchProfile.keywords.length > 0 && (
                    <div>
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: colors.textSecondary,
                        marginBottom: spacing[2],
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Research Keywords
                      </h4>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: spacing[2]
                      }}>
                        {researchProfile.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            style={{
                              padding: `${spacing[1]} ${spacing[3]}`,
                              backgroundColor: colors.background,
                              color: colors.textPrimary,
                              borderRadius: '16px',
                              fontSize: '13px',
                              fontWeight: '500',
                              border: `1px solid ${colors.border}`
                            }}
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Academic Background */}
                  {researchProfile.academicBackground && (
                    <div>
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: colors.textSecondary,
                        marginBottom: spacing[2],
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Academic Background
                      </h4>
                      <p style={{
                        fontSize: '14px',
                        color: colors.textPrimary,
                        margin: 0,
                        lineHeight: 1.6
                      }}>
                        {researchProfile.academicBackground}
                      </p>
                    </div>
                  )}

                  {/* Research Goals */}
                  {researchProfile.researchGoals && (
                    <div>
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: colors.textSecondary,
                        marginBottom: spacing[2],
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Research Goals
                      </h4>
                      <p style={{
                        fontSize: '14px',
                        color: colors.textPrimary,
                        margin: 0,
                        lineHeight: 1.6
                      }}>
                        {researchProfile.researchGoals}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: spacing[8],
                  color: colors.textSecondary
                }}>
                  <BookOpen
                    size={48}
                    color={colors.textTertiary}
                    style={{ marginBottom: spacing[3] }}
                  />
                  <p style={{
                    fontSize: '16px',
                    marginBottom: spacing[2]
                  }}>
                    No research interests added yet
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: colors.textTertiary
                  }}>
                    Add your research interests to help us recommend relevant labs
                  </p>
                </div>
              )}
            </div>

            {/* Interested Labs Section */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: spacing[6],
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing[5]
              }}>
                <h3 style={{
                  fontSize: isMobile ? '18px' : '20px',
                  fontWeight: '700',
                  color: colors.textPrimary,
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2]
                }}>
                  <Heart size={20} color={colors.primary} />
                  Interested Labs
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: colors.textSecondary,
                    marginLeft: spacing[2]
                  }}>
                    ({interestedLabs.length})
                  </span>
                </h3>
                <button
                  onClick={() => navigate('/search')}
                  style={{
                    padding: `${spacing[2]} ${spacing[4]}`,
                    backgroundColor: 'transparent',
                    color: colors.primary,
                    border: `2px solid ${colors.primary}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Browse Labs
                </button>
              </div>

              {labsLoading ? (
                <div style={{
                  textAlign: 'center',
                  padding: spacing[8],
                  color: colors.textSecondary
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: `3px solid ${colors.border}`,
                    borderTop: `3px solid ${colors.primary}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto',
                    marginBottom: spacing[3]
                  }} />
                  Loading interested labs...
                </div>
              ) : interestedLabs.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gap: spacing[4],
                  gridTemplateColumns: '1fr'
                }}>
                  {interestedLabs.map((item, index) => (
                    <LabCard
                      key={item.id || index}
                      lab={item.lab}
                      onClick={(lab) => navigate(`/lab/${lab.id}`)}
                      isInterested={true}
                      onInterestChange={async (labId, isInterested) => {
                        if (!isInterested) {
                          setInterestedLabs(prev => prev.filter(l => l.lab?.id !== labId));
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: spacing[8],
                  color: colors.textSecondary
                }}>
                  <Heart
                    size={48}
                    color={colors.textTertiary}
                    style={{ marginBottom: spacing[3] }}
                  />
                  <p style={{
                    fontSize: '16px',
                    marginBottom: spacing[2]
                  }}>
                    No interested labs yet
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: colors.textTertiary,
                    marginBottom: spacing[4]
                  }}>
                    Browse labs and bookmark the ones you're interested in
                  </p>
                  <button
                    onClick={() => navigate('/search')}
                    style={{
                      padding: `${spacing[3]} ${spacing[5]}`,
                      backgroundColor: colors.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Explore Labs
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'academic':
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
              Additional components like AcademicProfile, SettingsTab, and PrivacyTab would be extracted and placed here.
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
          Loading profile...
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
          Please log in to view your profile.
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