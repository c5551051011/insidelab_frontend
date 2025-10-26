import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  GraduationCap,
  Building2,
  FileText,
  Heart,
  Calendar,
  Mail,
  Edit3,
  LogOut,
  CheckCircle,
  Clock,
  Award,
  BookOpen,
  Settings,
  Shield,
  Eye,
  Star,
  Globe
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EditProfileModal from '../components/EditProfileModal';
import { colors, spacing } from '../theme';
import { AuthService } from '../services/authService';

const MyProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!AuthService.isAuthenticated()) {
        navigate('/login');
        return;
      }

      try {
        // Fetch current user data from API
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // If API call fails, redirect to login
        AuthService.logout();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      AuthService.logout();
      navigate('/');
    }
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleUserUpdate = async (updatedUser) => {
    try {
      // Fetch the latest user data from API to ensure we have all fields
      const latestUser = await AuthService.getCurrentUser();
      setUser(latestUser);
    } catch (error) {
      console.error('Error fetching updated user data:', error);
      // Fallback to using the updated user data from the modal
      setUser(updatedUser);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Header />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
        }}>
          <div style={{
            fontSize: '18px',
            color: colors.textSecondary
          }}>
            Loading profile...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Header />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
        }}>
          <div style={{
            fontSize: '18px',
            color: colors.textSecondary
          }}>
            Please log in to view your profile.
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
        <Header />

        <div style={{
          padding: spacing[4],
          minHeight: 'calc(100vh - 200px)'
        }}>
          {/* Mobile Profile Header */}
          <MobileProfileCard
            user={user}
            onSignOut={handleSignOut}
            onEditProfile={handleEditProfile}
          />

          {/* Mobile Tab Navigation */}
          <MobileTabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Mobile Content */}
          <MobileContent
            user={user}
            activeTab={activeTab}
          />
        </div>

        <Footer />

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onUserUpdate={handleUserUpdate}
        />
      </div>
    );
  }

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
        <ProfileSidebar
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSignOut={handleSignOut}
          onEditProfile={handleEditProfile}
        />

        {/* Main Content */}
        <ProfileContent
          user={user}
          activeTab={activeTab}
          onEditProfile={handleEditProfile}
        />
      </div>

      <Footer />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onUserUpdate={handleUserUpdate}
      />
    </div>
  );
};

// New Mobile Profile Card Component
const MobileProfileCard = ({ user, onSignOut, onEditProfile }) => {
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const getVerificationStatus = () => {
    const status = user.verificationStatus || 'unverified';
    switch (status) {
      case 'verified':
        return {
          text: 'Verified',
          icon: CheckCircle,
          color: colors.success
        };
      case 'pending':
        return {
          text: 'Pending',
          icon: Clock,
          color: colors.warning
        };
      default:
        return {
          text: 'Unverified',
          icon: Clock,
          color: colors.textTertiary
        };
    }
  };

  const verification = getVerificationStatus();
  const VerificationIcon = verification.icon;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: spacing[5],
      marginBottom: spacing[6],
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      textAlign: 'center'
    }}>
      {/* Avatar */}
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: colors.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: '700',
        color: 'white',
        margin: '0 auto',
        marginBottom: spacing[3],
        boxShadow: '0 6px 20px rgba(37, 99, 235, 0.3)'
      }}>
        {getInitials(user.name)}
      </div>

      {/* User Info */}
      <h2 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: colors.textPrimary,
        margin: 0,
        marginBottom: spacing[2]
      }}>
        {user.name || 'User'}
      </h2>

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


      {/* Action Buttons */}
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
          Edit Profile
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
    </div>
  );
};

// Mobile Tab Navigation Component
const MobileTabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'research', label: 'Research', icon: BookOpen },
    { id: 'reviews', label: 'Reviews', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: spacing[2],
      marginBottom: spacing[6],
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      overflowX: 'auto'
    }}>
      <div style={{
        display: 'flex',
        gap: spacing[2],
        minWidth: 'max-content',
        justifyContent: 'center'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                backgroundColor: isActive ? colors.primary : 'transparent',
                color: isActive ? 'white' : colors.textSecondary,
                border: 'none',
                borderRadius: '8px',
                padding: `${spacing[2]} ${spacing[3]}`,
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: spacing[1],
                minWidth: '60px',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Mobile Content Component
const MobileContent = ({ user, activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <MobileOverviewTab user={user} />;
      case 'academic':
        return <MobileAcademicTab user={user} />;
      case 'research':
        return <MobileResearchTab user={user} />;
      case 'reviews':
        return <MobileReviewsTab user={user} />;
      case 'settings':
        return <MobileSettingsTab user={user} />;
      default:
        return <MobileOverviewTab user={user} />;
    }
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
};

// Mobile Tab Content Components
const MobileOverviewTab = ({ user }) => {
  return (
    <div>
      {/* Overview Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: spacing[4],
        marginBottom: spacing[6]
      }}>
        <MobileStatCard
          icon={CheckCircle}
          label="Status"
          value={user.is_verified ? "Verified" : "Unverified"}
          color={user.is_verified ? colors.success : colors.warning}
        />
        <MobileStatCard
          icon={Calendar}
          label="Member"
          value={user.joined_date ? new Date(user.joined_date).getFullYear() : "2024"}
          color={colors.info}
        />
      </div>

      {/* Academic Overview */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: spacing[6],
        marginBottom: spacing[6],
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: colors.textPrimary,
          marginBottom: spacing[4]
        }}>
          Academic Information
        </h3>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[3]
        }}>
          <MobileInfoRow label="University" value={user.university_name || user.university || 'Not specified'} />
          <MobileInfoRow label="Department" value={user.department_name || user.department || 'Not specified'} />
          <MobileInfoRow label="Position" value={user.position || 'Not specified'} />
          <MobileInfoRow label="Lab Name" value={user.lab_name || 'Not specified'} />
        </div>
      </div>

      {/* Recent Activity */}
      <MobileRecentActivity user={user} />
    </div>
  );
};

const MobileAcademicTab = ({ user }) => {
  return (
    <div>
      <AcademicProfile user={user} isMobile={true} />
    </div>
  );
};

const MobileResearchTab = ({ user }) => {
  return (
    <div>
      <ResearchInterests user={user} isMobile={true} />
    </div>
  );
};

const MobileReviewsTab = ({ user }) => {
  const reviews = [
    {
      id: 1,
      professor: "Dr. Sarah Johnson",
      lab: "AI Research Lab",
      university: "Stanford University",
      rating: 4.5,
      date: "2024-01-15",
      helpful: 12,
      status: "published"
    }
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing[6]
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: colors.textPrimary,
          margin: 0
        }}>
          My Reviews
        </h2>
        <button style={{
          backgroundColor: colors.primary,
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: `${spacing[2]} ${spacing[4]}`,
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          Write New
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
        {reviews.map(review => (
          <MobileReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
};

const MobileSettingsTab = ({ user }) => {
  return (
    <div>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing[6]
      }}>
        Account Settings
      </h2>
      <AccountInformation user={user} isMobile={true} />
    </div>
  );
};


// Desktop Profile Sidebar Component
const ProfileSidebar = ({ user, activeTab, onTabChange, onSignOut, onEditProfile }) => {
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const getVerificationStatus = () => {
    const status = user.verificationStatus || 'unverified';
    switch (status) {
      case 'verified':
        return {
          text: 'Verified',
          icon: CheckCircle,
          color: colors.success
        };
      case 'pending':
        return {
          text: 'Pending',
          icon: Clock,
          color: colors.warning
        };
      default:
        return {
          text: 'Unverified',
          icon: Clock,
          color: colors.textTertiary
        };
    }
  };

  const verification = getVerificationStatus();
  const VerificationIcon = verification.icon;

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'academic', label: 'Academic Profile', icon: GraduationCap },
    { id: 'research', label: 'Research Interests', icon: BookOpen },
    { id: 'reviews', label: 'My Reviews', icon: FileText },
    { id: 'settings', label: 'Account Settings', icon: Settings },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[6]
    }}>
      {/* Profile Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: spacing[6],
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        textAlign: 'center'
      }}>
        {/* Avatar */}
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: colors.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          fontWeight: '700',
          color: 'white',
          margin: '0 auto',
          marginBottom: spacing[4],
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)'
        }}>
          {getInitials(user.name)}
        </div>

        {/* User Info */}
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: colors.textPrimary,
          margin: 0,
          marginBottom: spacing[2]
        }}>
          {user.name || 'User'}
        </h2>

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

        {/* Quick Stats */}
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
              Reviews
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
              Helpful
            </div>
          </div>
        </div>

        {/* Primary Action */}
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
          Edit Profile
        </button>

        {/* Sign Out */}
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
          Sign Out
        </button>
      </div>

      {/* Navigation Menu */}
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
              onClick={() => onTabChange(item.id)}
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
    </div>
  );
};

// Desktop Profile Content Component
const ProfileContent = ({ user, activeTab, onEditProfile }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab user={user} onEditProfile={onEditProfile} />;
      case 'academic':
        return <AcademicTab user={user} />;
      case 'research':
        return <ResearchTab user={user} />;
      case 'reviews':
        return <ReviewsTab user={user} />;
      case 'settings':
        return <SettingsTab user={user} />;
      case 'privacy':
        return <PrivacyTab user={user} />;
      default:
        return <OverviewTab user={user} />;
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      minHeight: '800px'
    }}>
      {renderContent()}
    </div>
  );
};

// Overview Tab
const OverviewTab = ({ user, onEditProfile }) => {
  return (
    <div style={{ padding: spacing[8] }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing[8],
        paddingBottom: spacing[6],
        borderBottom: `1px solid ${colors.border}`
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: colors.textPrimary,
            margin: 0,
            marginBottom: spacing[2]
          }}>
            Profile Overview
          </h1>
          <p style={{
            fontSize: '16px',
            color: colors.textSecondary,
            margin: 0
          }}>
            Manage your academic profile and research information
          </p>
        </div>
        <button
          onClick={onEditProfile}
          style={{
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: `${spacing[3]} ${spacing[6]}`,
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2]
          }}
        >
          <Edit3 size={16} />
          Edit Profile
        </button>
      </div>

      {/* Overview Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: spacing[6],
        marginBottom: spacing[8]
      }}>
        <OverviewStatCard
          icon={FileText}
          label="Reviews Written"
          value={user.review_count || 0}
          trend="+2 this month"
          color={colors.primary}
        />
        <OverviewStatCard
          icon={Heart}
          label="Helpful Votes"
          value={user.helpful_votes || 0}
          trend="+15 this month"
          color={colors.success}
        />
        <OverviewStatCard
          icon={CheckCircle}
          label="Verification"
          value={user.is_verified ? "Verified" : "Unverified"}
          trend={user.verification_status || "Status"}
          color={user.is_verified ? colors.success : colors.warning}
        />
        <OverviewStatCard
          icon={Calendar}
          label="Member Since"
          value={user.joined_date ? new Date(user.joined_date).getFullYear() : "2024"}
          trend="Years active"
          color={colors.info}
        />
      </div>

      {/* Quick Academic Info */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: spacing[8]
      }}>
        <AcademicOverview user={user} />
        <RecentActivity user={user} />
      </div>
    </div>
  );
};

// Academic Tab
const AcademicTab = ({ user }) => {
  return (
    <div style={{ padding: spacing[8] }}>
      <div style={{
        marginBottom: spacing[8],
        paddingBottom: spacing[6],
        borderBottom: `1px solid ${colors.border}`
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: colors.textPrimary,
          margin: 0,
          marginBottom: spacing[2]
        }}>
          Academic Profile
        </h1>
        <p style={{
          fontSize: '16px',
          color: colors.textSecondary,
          margin: 0
        }}>
          Your academic background and institutional information
        </p>
      </div>

      <AcademicProfile user={user} isMobile={false} />
    </div>
  );
};

// Research Tab
const ResearchTab = ({ user }) => {
  return (
    <div style={{ padding: spacing[8] }}>
      <div style={{
        marginBottom: spacing[8],
        paddingBottom: spacing[6],
        borderBottom: `1px solid ${colors.border}`
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: colors.textPrimary,
          margin: 0,
          marginBottom: spacing[2]
        }}>
          Research Interests
        </h1>
        <p style={{
          fontSize: '16px',
          color: colors.textSecondary,
          margin: 0
        }}>
          Your research areas, publications, and academic interests
        </p>
      </div>

      <ResearchInterests user={user} isMobile={false} />
    </div>
  );
};

// Reviews Tab
const ReviewsTab = ({ user }) => {
  const reviews = [
    {
      id: 1,
      professor: "Dr. Sarah Johnson",
      lab: "AI Research Lab",
      university: "Stanford University",
      rating: 4.5,
      date: "2024-01-15",
      helpful: 12,
      status: "published"
    },
    {
      id: 2,
      professor: "Dr. Michael Chen",
      lab: "Data Science Lab",
      university: "MIT",
      rating: 4.8,
      date: "2024-02-03",
      helpful: 8,
      status: "published"
    }
  ];

  return (
    <div style={{ padding: spacing[8] }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing[8],
        paddingBottom: spacing[6],
        borderBottom: `1px solid ${colors.border}`
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: colors.textPrimary,
            margin: 0,
            marginBottom: spacing[2]
          }}>
            My Reviews
          </h1>
          <p style={{
            fontSize: '16px',
            color: colors.textSecondary,
            margin: 0
          }}>
            Reviews you've written about professors and labs
          </p>
        </div>
        <button style={{
          backgroundColor: colors.primary,
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: `${spacing[3]} ${spacing[6]}`,
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          Write New Review
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
        {reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
};

// Settings Tab
const SettingsTab = ({ user }) => {
  return (
    <div style={{ padding: spacing[8] }}>
      <div style={{
        marginBottom: spacing[8],
        paddingBottom: spacing[6],
        borderBottom: `1px solid ${colors.border}`
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: colors.textPrimary,
          margin: 0,
          marginBottom: spacing[2]
        }}>
          Account Settings
        </h1>
        <p style={{
          fontSize: '16px',
          color: colors.textSecondary,
          margin: 0
        }}>
          Manage your account preferences and information
        </p>
      </div>

      <AccountInformation user={user} isMobile={false} />
    </div>
  );
};

// Privacy Tab
const PrivacyTab = ({ user }) => {
  return (
    <div style={{ padding: spacing[8] }}>
      <div style={{
        marginBottom: spacing[8],
        paddingBottom: spacing[6],
        borderBottom: `1px solid ${colors.border}`
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: colors.textPrimary,
          margin: 0,
          marginBottom: spacing[2]
        }}>
          Privacy & Security
        </h1>
        <p style={{
          fontSize: '16px',
          color: colors.textSecondary,
          margin: 0
        }}>
          Control your privacy settings and account security
        </p>
      </div>

      <PrivacySettings user={user} />
    </div>
  );
};


// Academic Profile Component
const AcademicProfile = ({ user, isMobile }) => {
  const academicInfo = [
    { label: 'University', value: user.university_name || user.university, icon: Building2 },
    { label: 'Department', value: user.department_name || user.department, icon: GraduationCap },
    { label: 'Position', value: user.position, icon: Award },
    { label: 'Lab Name', value: user.lab_name, icon: BookOpen },
    { label: 'Language', value: user.language === 'ko' ? '한국어' : user.language === 'en' ? 'English' : user.language, icon: Globe }
  ];

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: spacing[6],
      marginBottom: spacing[8],
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing[6]
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: colors.textPrimary,
          margin: 0
        }}>
          Academic Profile
        </h2>
        <button style={{
          backgroundColor: 'transparent',
          border: `1px solid ${colors.primary}`,
          borderRadius: '6px',
          padding: `${spacing[2]} ${spacing[3]}`,
          color: colors.primary,
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2]
        }}>
          <Edit3 size={14} />
          Edit
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: spacing[4]
      }}>
        {academicInfo.map((info, index) => (
          <InfoRow key={index} info={info} />
        ))}
      </div>

      {user.bio && (
        <div style={{ marginTop: spacing[6] }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[3]
          }}>
            Bio
          </h3>
          <p style={{
            fontSize: '14px',
            lineHeight: 1.6,
            color: colors.textSecondary,
            margin: 0
          }}>
            {user.bio}
          </p>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ info }) => {
  const Icon = info.icon;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
      padding: spacing[3],
      backgroundColor: colors.backgroundSecondary,
      borderRadius: '8px'
    }}>
      <Icon size={16} color={colors.textTertiary} />
      <div>
        <div style={{
          fontSize: '12px',
          color: colors.textTertiary,
          marginBottom: spacing[1]
        }}>
          {info.label}
        </div>
        <div style={{
          fontSize: '14px',
          color: colors.textPrimary,
          fontWeight: '500'
        }}>
          {info.value || 'Not specified'}
        </div>
      </div>
    </div>
  );
};

// Research Interests Component
const ResearchInterests = ({ user, isMobile }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: spacing[6],
      marginBottom: spacing[8],
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing[6]
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: colors.textPrimary,
          margin: 0
        }}>
          Research Interests
        </h2>
        <button style={{
          backgroundColor: 'transparent',
          border: `1px solid ${colors.primary}`,
          borderRadius: '6px',
          padding: `${spacing[2]} ${spacing[3]}`,
          color: colors.primary,
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2]
        }}>
          <Edit3 size={14} />
          Edit
        </button>
      </div>

      {/* Primary Research Area */}
      {user.researchArea && (
        <div style={{ marginBottom: spacing[6] }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[3]
          }}>
            Primary Research Area
          </h3>
          <div style={{
            display: 'inline-block',
            backgroundColor: `${colors.primary}20`,
            color: colors.primary,
            padding: `${spacing[2]} ${spacing[4]}`,
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {user.researchArea}
          </div>
        </div>
      )}

      {/* Specialties */}
      {user.specialties && user.specialties.length > 0 && (
        <div style={{ marginBottom: spacing[6] }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[3]
          }}>
            Specialties & Interests
          </h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: spacing[2]
          }}>
            {user.specialties.map((specialty, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  color: colors.textPrimary,
                  padding: `${spacing[1]} ${spacing[3]}`,
                  borderRadius: '16px',
                  fontSize: '14px',
                  border: '1px solid rgba(0, 0, 0, 0.1)'
                }}
              >
                {specialty}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publications */}
      {user.publications && user.publications.length > 0 && (
        <div>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[3]
          }}>
            Publications
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            {user.publications.slice(0, 3).map((publication, index) => (
              <div
                key={index}
                style={{
                  padding: spacing[4],
                  backgroundColor: colors.backgroundSecondary,
                  borderRadius: '8px',
                  fontSize: '14px',
                  lineHeight: 1.5,
                  color: colors.textPrimary
                }}
              >
                {publication}
              </div>
            ))}
            {user.publications.length > 3 && (
              <button style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: colors.primary,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'left',
                padding: 0
              }}>
                View all {user.publications.length} publications
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!user.researchArea && (!user.specialties || user.specialties.length === 0) && (!user.publications || user.publications.length === 0)) && (
        <div style={{
          textAlign: 'center',
          padding: spacing[8],
          color: colors.textTertiary
        }}>
          <BookOpen size={48} style={{ marginBottom: spacing[4], opacity: 0.5 }} />
          <p style={{
            fontSize: '16px',
            marginBottom: spacing[2]
          }}>
            No research interests added yet
          </p>
          <p style={{
            fontSize: '14px',
            marginBottom: spacing[4]
          }}>
            Add your research area, specialties, and publications to help others find you.
          </p>
          <button style={{
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: `${spacing[3]} ${spacing[6]}`,
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Add Research Interests
          </button>
        </div>
      )}
    </div>
  );
};

// Account Information Component
const AccountInformation = ({ user, isMobile }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: spacing[6],
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(0, 0, 0, 0.05)'
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing[6]
      }}>
        Account Information
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: spacing[4]
      }}>
        <AccountInfoCard
          icon={Mail}
          label="Email"
          value={user.email}
        />

        <AccountInfoCard
          icon={User}
          label="Username"
          value={user.username || 'Not set'}
        />

        <AccountInfoCard
          icon={CheckCircle}
          label="Verification Status"
          value={user.is_verified ? 'Verified' : 'Unverified'}
          valueColor={user.is_verified ? colors.success : colors.textTertiary}
        />

        <AccountInfoCard
          icon={Calendar}
          label="Member Since"
          value={user.joined_date ? new Date(user.joined_date).toLocaleDateString() : 'Unknown'}
        />

        {user.review_count !== undefined && (
          <AccountInfoCard
            icon={FileText}
            label="Reviews Written"
            value={user.review_count || 0}
          />
        )}

        {user.helpful_votes !== undefined && (
          <AccountInfoCard
            icon={Heart}
            label="Helpful Votes"
            value={user.helpful_votes || 0}
          />
        )}

        {user.is_lab_member !== undefined && (
          <AccountInfoCard
            icon={Building2}
            label="Lab Member"
            value={user.is_lab_member ? 'Yes' : 'No'}
            valueColor={user.is_lab_member ? colors.success : colors.textSecondary}
          />
        )}

        {user.can_provide_services !== undefined && (
          <AccountInfoCard
            icon={Award}
            label="Service Provider"
            value={user.can_provide_services ? 'Yes' : 'No'}
            valueColor={user.can_provide_services ? colors.success : colors.textSecondary}
          />
        )}
      </div>
    </div>
  );
};

// Helper Components for Desktop Layout

// Overview Stat Card
const OverviewStatCard = ({ icon: Icon, label, value, trend, color }) => {
  return (
    <div style={{
      padding: spacing[6],
      backgroundColor: `${color}08`,
      borderRadius: '16px',
      border: `1px solid ${color}20`
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing[4]
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={24} color={color} />
        </div>
      </div>

      <div style={{
        fontSize: '28px',
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing[1]
      }}>
        {value}
      </div>

      <div style={{
        fontSize: '14px',
        color: colors.textPrimary,
        fontWeight: '600',
        marginBottom: spacing[2]
      }}>
        {label}
      </div>

      <div style={{
        fontSize: '12px',
        color: colors.textSecondary
      }}>
        {trend}
      </div>
    </div>
  );
};

// Academic Overview
const AcademicOverview = ({ user }) => {
  return (
    <div style={{
      padding: spacing[6],
      backgroundColor: colors.backgroundSecondary,
      borderRadius: '16px'
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing[6]
      }}>
        Academic Information
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: spacing[4]
      }}>
        <div>
          <div style={{
            fontSize: '12px',
            color: colors.textTertiary,
            marginBottom: spacing[1]
          }}>
            University
          </div>
          <div style={{
            fontSize: '14px',
            color: colors.textPrimary,
            fontWeight: '600'
          }}>
            {user.university_name || user.university || 'Not specified'}
          </div>
        </div>

        <div>
          <div style={{
            fontSize: '12px',
            color: colors.textTertiary,
            marginBottom: spacing[1]
          }}>
            Department
          </div>
          <div style={{
            fontSize: '14px',
            color: colors.textPrimary,
            fontWeight: '600'
          }}>
            {user.department_name || user.department || 'Not specified'}
          </div>
        </div>

        <div>
          <div style={{
            fontSize: '12px',
            color: colors.textTertiary,
            marginBottom: spacing[1]
          }}>
            Position
          </div>
          <div style={{
            fontSize: '14px',
            color: colors.textPrimary,
            fontWeight: '600'
          }}>
            {user.position || 'Not specified'}
          </div>
        </div>

        <div>
          <div style={{
            fontSize: '12px',
            color: colors.textTertiary,
            marginBottom: spacing[1]
          }}>
            Lab Name
          </div>
          <div style={{
            fontSize: '14px',
            color: colors.textPrimary,
            fontWeight: '600'
          }}>
            {user.lab_name || 'Not specified'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Recent Activity
const RecentActivity = ({ user }) => {
  const activities = [
    {
      type: 'review',
      text: 'Wrote a review for Dr. Sarah Johnson',
      date: '2 days ago',
      icon: FileText
    },
    {
      type: 'helpful',
      text: 'Received 3 helpful votes',
      date: '1 week ago',
      icon: Heart
    },
    {
      type: 'profile',
      text: 'Updated research interests',
      date: '2 weeks ago',
      icon: User
    }
  ];

  return (
    <div style={{
      padding: spacing[6],
      backgroundColor: colors.backgroundSecondary,
      borderRadius: '16px'
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing[6]
      }}>
        Recent Activity
      </h3>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[4]
      }}>
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: spacing[3]
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon size={16} color={colors.textSecondary} />
              </div>
              <div>
                <div style={{
                  fontSize: '14px',
                  color: colors.textPrimary,
                  marginBottom: spacing[1]
                }}>
                  {activity.text}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: colors.textTertiary
                }}>
                  {activity.date}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Review Card
const ReviewCard = ({ review }) => {
  return (
    <div style={{
      padding: spacing[6],
      backgroundColor: colors.backgroundSecondary,
      borderRadius: '12px',
      border: '1px solid rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: spacing[4]
      }}>
        <div>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.textPrimary,
            margin: 0,
            marginBottom: spacing[1]
          }}>
            {review.professor}
          </h4>
          <p style={{
            fontSize: '14px',
            color: colors.textSecondary,
            margin: 0
          }}>
            {review.lab} • {review.university}
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2]
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[1]
          }}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                color={i < Math.floor(review.rating) ? colors.warning : colors.border}
                fill={i < Math.floor(review.rating) ? colors.warning : 'transparent'}
              />
            ))}
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginLeft: spacing[1]
            }}>
              {review.rating}
            </span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: colors.textTertiary
      }}>
        <span>{new Date(review.date).toLocaleDateString()}</span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[4]
        }}>
          <span>{review.helpful} helpful votes</span>
          <span style={{
            backgroundColor: review.status === 'published' ? colors.success : colors.warning,
            color: 'white',
            padding: `${spacing[1]} ${spacing[2]}`,
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '600',
            textTransform: 'uppercase'
          }}>
            {review.status}
          </span>
        </div>
      </div>
    </div>
  );
};

// Privacy Settings
const PrivacySettings = ({ user }) => {
  const [settings, setSettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showUniversity: true,
    showResearch: true,
    allowMessages: true,
    emailNotifications: true
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[6]
    }}>
      {/* Profile Visibility */}
      <div style={{
        padding: spacing[6],
        backgroundColor: colors.backgroundSecondary,
        borderRadius: '12px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: spacing[4]
        }}>
          Profile Visibility
        </h3>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[3]
        }}>
          {[
            { key: 'showEmail', label: 'Show email address', description: 'Other users can see your email' },
            { key: 'showUniversity', label: 'Show university information', description: 'Display your academic affiliation' },
            { key: 'showResearch', label: 'Show research interests', description: 'Make your research areas visible' }
          ].map((setting) => (
            <div key={setting.key} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: spacing[4],
              backgroundColor: 'white',
              borderRadius: '8px'
            }}>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  marginBottom: spacing[1]
                }}>
                  {setting.label}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: colors.textSecondary
                }}>
                  {setting.description}
                </div>
              </div>

              <button
                onClick={() => toggleSetting(setting.key)}
                style={{
                  width: '48px',
                  height: '24px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: settings[setting.key] ? colors.primary : colors.border,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  position: 'absolute',
                  top: '2px',
                  left: settings[setting.key] ? '26px' : '2px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Communication Preferences */}
      <div style={{
        padding: spacing[6],
        backgroundColor: colors.backgroundSecondary,
        borderRadius: '12px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: spacing[4]
        }}>
          Communication
        </h3>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[3]
        }}>
          {[
            { key: 'allowMessages', label: 'Allow direct messages', description: 'Other users can send you messages' },
            { key: 'emailNotifications', label: 'Email notifications', description: 'Receive updates via email' }
          ].map((setting) => (
            <div key={setting.key} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: spacing[4],
              backgroundColor: 'white',
              borderRadius: '8px'
            }}>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  marginBottom: spacing[1]
                }}>
                  {setting.label}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: colors.textSecondary
                }}>
                  {setting.description}
                </div>
              </div>

              <button
                onClick={() => toggleSetting(setting.key)}
                style={{
                  width: '48px',
                  height: '24px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: settings[setting.key] ? colors.primary : colors.border,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  position: 'absolute',
                  top: '2px',
                  left: settings[setting.key] ? '26px' : '2px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Mobile Helper Components

// Mobile Stat Card
const MobileStatCard = ({ icon: Icon, label, value, color }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: spacing[4],
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      textAlign: 'center'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        backgroundColor: `${color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        marginBottom: spacing[3]
      }}>
        <Icon size={20} color={color} />
      </div>

      <div style={{
        fontSize: '20px',
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing[1]
      }}>
        {value}
      </div>

      <div style={{
        fontSize: '12px',
        color: colors.textSecondary,
        fontWeight: '500'
      }}>
        {label}
      </div>
    </div>
  );
};

// Mobile Info Row
const MobileInfoRow = ({ label, value }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: `${spacing[3]} 0`,
      borderBottom: `1px solid ${colors.border}`
    }}>
      <div style={{
        fontSize: '14px',
        color: colors.textSecondary,
        fontWeight: '500'
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '14px',
        color: colors.textPrimary,
        fontWeight: '600',
        textAlign: 'right',
        maxWidth: '60%'
      }}>
        {value}
      </div>
    </div>
  );
};

// Mobile Recent Activity
const MobileRecentActivity = ({ user }) => {
  const activities = [
    {
      type: 'review',
      text: 'Wrote a review for Dr. Sarah Johnson',
      date: '2 days ago',
      icon: FileText
    },
    {
      type: 'helpful',
      text: 'Received 3 helpful votes',
      date: '1 week ago',
      icon: Heart
    },
    {
      type: 'profile',
      text: 'Updated research interests',
      date: '2 weeks ago',
      icon: User
    }
  ];

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: spacing[6],
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(0, 0, 0, 0.05)'
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing[4]
      }}>
        Recent Activity
      </h3>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[4]
      }}>
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: spacing[3]
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: colors.backgroundSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon size={16} color={colors.textSecondary} />
              </div>
              <div>
                <div style={{
                  fontSize: '14px',
                  color: colors.textPrimary,
                  marginBottom: spacing[1]
                }}>
                  {activity.text}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: colors.textTertiary
                }}>
                  {activity.date}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Mobile Review Card
const MobileReviewCard = ({ review }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: spacing[4],
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: spacing[3]
      }}>
        <div style={{ flex: 1 }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.textPrimary,
            margin: 0,
            marginBottom: spacing[1]
          }}>
            {review.professor}
          </h4>
          <p style={{
            fontSize: '13px',
            color: colors.textSecondary,
            margin: 0
          }}>
            {review.lab} • {review.university}
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[1]
        }}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              color={i < Math.floor(review.rating) ? colors.warning : colors.border}
              fill={i < Math.floor(review.rating) ? colors.warning : 'transparent'}
            />
          ))}
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginLeft: spacing[1]
          }}>
            {review.rating}
          </span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: colors.textTertiary
      }}>
        <span>{new Date(review.date).toLocaleDateString()}</span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2]
        }}>
          <span>{review.helpful} helpful</span>
          <span style={{
            backgroundColor: review.status === 'published' ? colors.success : colors.warning,
            color: 'white',
            padding: `2px ${spacing[2]}`,
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '600',
            textTransform: 'uppercase'
          }}>
            {review.status}
          </span>
        </div>
      </div>
    </div>
  );
};

// Account Info Card Component
const AccountInfoCard = ({ icon: Icon, label, value, valueColor }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
      padding: spacing[3],
      backgroundColor: colors.backgroundSecondary,
      borderRadius: '8px'
    }}>
      <Icon size={16} color={colors.textTertiary} />
      <div>
        <div style={{
          fontSize: '12px',
          color: colors.textTertiary,
          marginBottom: spacing[1]
        }}>
          {label}
        </div>
        <div style={{
          fontSize: '14px',
          color: valueColor || colors.textPrimary,
          fontWeight: '500'
        }}>
          {value}
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;