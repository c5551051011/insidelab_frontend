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
  BookOpen
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { colors, spacing, textStyles, gradients } from '../theme';
import { AuthService } from '../services/authService';

const MyProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    const checkAuth = () => {
      if (!AuthService.isAuthenticated()) {
        navigate('/login');
        return;
      }

      const currentUser = AuthService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      AuthService.logout();
      navigate('/');
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
      <Header />

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: `${spacing[8]} ${spacing[4]}`,
        minHeight: 'calc(100vh - 200px)'
      }}>
        {/* Profile Header */}
        <ProfileHeader user={user} isMobile={isMobile} onSignOut={handleSignOut} />

        {/* Profile Stats */}
        <ProfileStats user={user} isMobile={isMobile} />

        {/* Academic Profile */}
        <AcademicProfile user={user} isMobile={isMobile} />

        {/* Research Interests */}
        <ResearchInterests user={user} isMobile={isMobile} />

        {/* Account Information */}
        <AccountInformation user={user} isMobile={isMobile} />
      </main>

      <Footer />
    </div>
  );
};

// Profile Header Component
const ProfileHeader = ({ user, isMobile, onSignOut }) => {
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const getVerificationStatus = () => {
    const status = user.verificationStatus || 'unverified';
    switch (status) {
      case 'verified':
        return {
          text: 'Verified Student',
          icon: CheckCircle,
          color: colors.success
        };
      case 'pending':
        return {
          text: 'Pending Verification',
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
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.primary}CC)`,
      borderRadius: '16px',
      padding: spacing[8],
      marginBottom: spacing[8],
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '200px',
        height: '200px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        transform: 'translate(50%, -50%)'
      }} />

      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'center' : 'flex-start',
        gap: spacing[6],
        position: 'relative',
        zIndex: 1
      }}>
        {/* Avatar */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          fontWeight: '700',
          border: '3px solid rgba(255, 255, 255, 0.3)'
        }}>
          {getInitials(user.name)}
        </div>

        {/* User Info */}
        <div style={{
          flex: 1,
          textAlign: isMobile ? 'center' : 'left'
        }}>
          <h1 style={{
            fontSize: isMobile ? '24px' : '32px',
            fontWeight: '700',
            margin: 0,
            marginBottom: spacing[2]
          }}>
            {user.name || 'User'}
          </h1>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            marginBottom: spacing[3],
            justifyContent: isMobile ? 'center' : 'flex-start'
          }}>
            <VerificationIcon size={16} color={verification.color} />
            <span style={{
              fontSize: '14px',
              opacity: 0.9
            }}>
              {verification.text}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            opacity: 0.8,
            justifyContent: isMobile ? 'center' : 'flex-start'
          }}>
            <Calendar size={14} />
            <span style={{ fontSize: '14px' }}>
              Member since {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : 'Unknown'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: spacing[3],
          flexDirection: isMobile ? 'row' : 'column'
        }}>
          <button style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            padding: `${spacing[2]} ${spacing[4]}`,
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            transition: 'all 0.2s ease'
          }}>
            <Edit3 size={16} />
            Edit Profile
          </button>

          <button
            onClick={onSignOut}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: `${spacing[2]} ${spacing[4]}`,
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

// Profile Stats Component
const ProfileStats = ({ user, isMobile }) => {
  const stats = [
    {
      icon: FileText,
      label: 'Reviews Written',
      value: user.reviewCount || 0,
      color: colors.primary
    },
    {
      icon: Heart,
      label: 'Helpful Votes',
      value: user.helpfulVotes || 0,
      color: colors.success
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: spacing[4],
      marginBottom: spacing[8]
    }}>
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} />
      ))}
    </div>
  );
};

const StatCard = ({ stat }) => {
  const Icon = stat.icon;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: spacing[6],
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[4]
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: `${stat.color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={24} color={stat.color} />
        </div>

        <div>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: colors.textPrimary,
            marginBottom: spacing[1]
          }}>
            {stat.value}
          </div>
          <div style={{
            fontSize: '14px',
            color: colors.textSecondary
          }}>
            {stat.label}
          </div>
        </div>
      </div>
    </div>
  );
};

// Academic Profile Component
const AcademicProfile = ({ user, isMobile }) => {
  const academicInfo = [
    { label: 'University', value: user.university, icon: Building2 },
    { label: 'Department', value: user.department, icon: GraduationCap },
    { label: 'Position', value: user.position, icon: Award },
    { label: 'Lab Name', value: user.labName, icon: BookOpen },
    { label: 'Advisor', value: user.advisorName, icon: User }
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[3],
          padding: spacing[3],
          backgroundColor: colors.backgroundSecondary,
          borderRadius: '8px'
        }}>
          <Mail size={16} color={colors.textTertiary} />
          <div>
            <div style={{
              fontSize: '12px',
              color: colors.textTertiary,
              marginBottom: spacing[1]
            }}>
              Email
            </div>
            <div style={{
              fontSize: '14px',
              color: colors.textPrimary,
              fontWeight: '500'
            }}>
              {user.email}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[3],
          padding: spacing[3],
          backgroundColor: colors.backgroundSecondary,
          borderRadius: '8px'
        }}>
          <User size={16} color={colors.textTertiary} />
          <div>
            <div style={{
              fontSize: '12px',
              color: colors.textTertiary,
              marginBottom: spacing[1]
            }}>
              Username
            </div>
            <div style={{
              fontSize: '14px',
              color: colors.textPrimary,
              fontWeight: '500'
            }}>
              {user.name || 'Not set'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;