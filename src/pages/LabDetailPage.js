import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Star,
  ExternalLink,
  Users,
  Building2,
  GraduationCap,
  Globe,
  ArrowLeft,
  Bookmark,
  Info,
  CheckCircle,
  XCircle,
  BookOpen,
  Quote,
  MessageCircle,
  ThumbsUp,
  Clock
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { colors, spacing } from '../theme';
import { SearchService } from '../services/searchService';
import { useBreakpoint } from '../hooks/useBreakpoint';

const LabDetailPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { width } = useBreakpoint();
  const isMobile = width < 1000;
  const isCompactLayout = width < 768;

  useEffect(() => {
    const loadLabDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to get lab ID from multiple sources:
        // 1. Navigation state (direct navigation)
        // 2. SessionStorage (refresh case)
        // 3. Fallback to name-based lookup
        let labId = location.state?.labId;

        if (!labId) {
          // Check sessionStorage for labId using the lab name as key
          const storageKey = `labId_${name}`;
          labId = sessionStorage.getItem(storageKey);
          console.log('Retrieved lab ID from sessionStorage:', labId);
        }

        let labData;
        if (labId) {
          console.log('Using lab ID:', labId);
          labData = await SearchService.getLabById(labId);

          // Store labId in sessionStorage for future refreshes
          const storageKey = `labId_${name}`;
          sessionStorage.setItem(storageKey, labId);
          sessionStorage.setItem(`${storageKey}_timestamp`, Date.now().toString());
        } else {
          console.log('No lab ID available, falling back to name-based search:', name);
          labData = await SearchService.getLabByName(name);

          // If we successfully get lab data, store the labId for future use
          if (labData?.id) {
            const storageKey = `labId_${name}`;
            sessionStorage.setItem(storageKey, labData.id);
            sessionStorage.setItem(`${storageKey}_timestamp`, Date.now().toString());
            console.log('Stored lab ID in sessionStorage:', labData.id);
          }
        }

        // Check if we have complete data with IDs for write review functionality
        if (labData && (!labData.professorId || !labData.universityId || !labData.departmentId)) {
          console.log('Lab data missing IDs, attempting to fetch complete professor data...');

          // Try to get professor ID from the current lab data or search by name
          let professorData = null;
          if (labData.professorName) {
            try {
              // Search for professor by name to get ID first
              const searchResults = await SearchService.searchLabs(labData.professorName, {}, 1, 5);
              const matchingLab = searchResults.results.find(result =>
                result.professorName.toLowerCase() === labData.professorName.toLowerCase()
              );

              if (matchingLab && matchingLab.professorId) {
                console.log('Found matching professor ID:', matchingLab.professorId);
                professorData = await SearchService.getProfessorById(matchingLab.professorId);
                console.log('Fetched complete professor data:', professorData);
              }
            } catch (error) {
              console.warn('Could not fetch complete professor data:', error);
            }
          }

          // Use complete professor data if available, otherwise use original lab data
          setLab(professorData || labData);
        } else {
          // Data is already complete
          setLab(labData);
        }
      } catch (err) {
        console.error('Error loading lab details:', err);
        setError(err.message || 'Failed to load lab details');
      } finally {
        setLoading(false);
      }
    };

    if (name) {
      loadLabDetails();
    }
  }, [name, location.state]);

  // Cleanup old sessionStorage entries on component unmount
  useEffect(() => {
    return () => {
      // Clean up sessionStorage entries older than 1 hour to prevent accumulation
      const currentTime = Date.now();
      const oneHour = 60 * 60 * 1000;

      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('labId_')) {
          try {
            const timestamp = sessionStorage.getItem(`${key}_timestamp`);
            if (timestamp && currentTime - parseInt(timestamp) > oneHour) {
              sessionStorage.removeItem(key);
              sessionStorage.removeItem(`${key}_timestamp`);
            }
          } catch (error) {
            // If there's any error, just remove the key
            sessionStorage.removeItem(key);
          }
        }
      }
    };
  }, []);

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Add actual bookmark API call here
    console.log(`Lab ${isBookmarked ? 'unbookmarked' : 'bookmarked'}:`, lab?.id);
  };

  const handleWebsiteClick = (url) => {
    if (url) {
      let formattedUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        formattedUrl = `https://${url}`;
      }
      window.open(formattedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleWriteReview = () => {
    console.log('DEBUG: Lab data for write review:', lab);

    // Navigate to write review page with lab data in state
    navigate('/write-review', {
      state: {
        labData: {
          labId: lab.id || lab.labId,
          labName: lab.labName || lab.name,
          professorId: lab.professorId,
          professorName: lab.professorName,
          universityId: lab.universityId,
          universityName: lab.universityName,
          departmentId: lab.departmentId,
          departmentName: lab.department,
          researchGroupId: lab.researchGroupId,
          researchGroupName: lab.researchGroup
        }
      }
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
        <Header />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: spacing[4]
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `3px solid ${colors.primary}`,
              borderTop: '3px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: colors.textSecondary }}>Loading lab details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
        <Header />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: spacing[4],
            textAlign: 'center'
          }}>
            <Info size={48} color={colors.error} />
            <h2 style={{ color: colors.textPrimary, margin: 0 }}>Lab Not Found</h2>
            <p style={{ color: colors.textSecondary, margin: 0 }}>{error}</p>
            <button
              onClick={() => navigate('/search')}
              style={{
                padding: `${spacing[3]} ${spacing[6]}`,
                backgroundColor: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Back to Search
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!lab) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
      <Header />

      {/* Lab Header */}
      <LabHeader
        lab={lab}
        isBookmarked={isBookmarked}
        onBookmarkToggle={handleBookmarkToggle}
        onBack={() => navigate(-1)}
        onWriteReview={handleWriteReview}
        isCompactLayout={isCompactLayout}
      />

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: spacing[6]
      }}>
        {isMobile ? (
          <MobileLayout lab={lab} onWebsiteClick={handleWebsiteClick} />
        ) : (
          <DesktopLayout lab={lab} onWebsiteClick={handleWebsiteClick} />
        )}

        {/* Publications Section */}
        {lab.publications && lab.publications.length > 0 && (
          <div style={{ marginTop: spacing[8] }}>
            <PublicationsSection publications={lab.publications} />
          </div>
        )}

        {/* Reviews Section */}
        <div style={{ marginTop: spacing[8] }}>
          <ReviewsSection lab={lab} onWriteReview={handleWriteReview} />
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Lab Header Component
const LabHeader = ({
  lab,
  isBookmarked,
  onBookmarkToggle,
  onBack,
  onWriteReview,
  isCompactLayout = false,
}) => {
  const getInitials = (name) => {
    return name.split(' ').map(n => n.charAt(0)).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div style={{
      height: '200px',
      background: `linear-gradient(135deg, #2563eb 0%, #1e40af 100%)`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: spacing[6],
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Back Button */}
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: spacing[4],
            left: spacing[4],
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white'
          }}
        >
          <ArrowLeft size={20} />
        </button>

        {/* Bookmark Button */}
        <button
          onClick={onBookmarkToggle}
          style={{
            position: 'absolute',
            top: spacing[4],
            right: spacing[4],
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            transition: 'all 0.2s ease'
          }}
          title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
        >
          <Bookmark
            size={20}
            fill={isBookmarked ? 'currentColor' : 'none'}
          />
        </button>


        {/* Lab Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
          {/* Professor Avatar */}
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: '700',
            flexShrink: 0
          }}>
            {getInitials(lab.professorName)}
          </div>

          {/* Lab Details */}
          <div style={{ flex: 1, color: 'white' }}>
            <h1 style={{
              fontSize: isCompactLayout ? '18px' : '22px',
              fontWeight: '600',
              margin: 0,
              marginBottom: spacing[1]
            }}>
              {lab.professorName} • {lab.universityName}
            </h1>

            <h2 style={{
              fontSize: '16px',
              fontWeight: '500',
              margin: 0,
              marginBottom: spacing[1],
              color: 'rgba(255, 255, 255, 0.9)'
            }}>
              {lab.labName}
            </h2>

            <p style={{
              fontSize: '13px',
              margin: 0,
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              {lab.department} • {lab.researchGroup}
            </p>

            {/* Rating */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              marginTop: spacing[2]
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[1]
              }}>
                <Star size={16} fill="gold" color="gold" />
                <span style={{ fontWeight: '600' }}>
                  {lab.overallRating > 0 ? lab.overallRating.toFixed(1) : 'No rating'}
                </span>
              </div>
              <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                ({lab.reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Desktop Layout Component
const DesktopLayout = ({ lab, onWebsiteClick }) => {
  return (
    <div style={{
      display: 'flex',
      gap: spacing[6],
      alignItems: 'flex-start'
    }}>
      {/* Left Column */}
      <div style={{ flex: 3 }}>
        <LabInformation lab={lab} onWebsiteClick={onWebsiteClick} />
      </div>

      {/* Right Column */}
      <div style={{ flex: 2 }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[6]
        }}>
          <RatingBreakdown lab={lab} />
          <RecruitmentStatus lab={lab} />
        </div>
      </div>
    </div>
  );
};

// Mobile Layout Component
const MobileLayout = ({ lab, onWebsiteClick }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[6]
    }}>
      <LabInformation lab={lab} onWebsiteClick={onWebsiteClick} />
      <RatingBreakdown lab={lab} />
      <RecruitmentStatus lab={lab} />
    </div>
  );
};

// Lab Information Component
const LabInformation = ({ lab, onWebsiteClick }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: spacing[6],
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${colors.border}`
    }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: colors.textPrimary,
        margin: 0,
        marginBottom: spacing[4]
      }}>
        Lab Information
      </h3>

      {/* Description */}
      {lab.description && (
        <div style={{ marginBottom: spacing[4] }}>
          <p style={{
            color: colors.textSecondary,
            lineHeight: 1.6,
            margin: 0
          }}>
            {lab.description}
          </p>
        </div>
      )}

      {/* Info Rows */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[3]
      }}>
        <InfoRow
          icon={<Building2 size={16} />}
          label="Department"
          value={lab.department}
        />

        <InfoRow
          icon={<GraduationCap size={16} />}
          label="Research Group"
          value={lab.researchGroup}
        />

        <InfoRow
          icon={<Users size={16} />}
          label="Lab Size"
          value={lab.labSize ? `${lab.labSize} members` : 'Unknown'}
        />

        {lab.website && (
          <InfoRow
            icon={<Globe size={16} />}
            label="Website"
            value={lab.website}
            isLink={true}
            onClick={() => onWebsiteClick(lab.website)}
          />
        )}
      </div>

      {/* Research Areas */}
      {lab.researchAreas && lab.researchAreas.length > 0 && (
        <div style={{ marginTop: spacing[5] }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.textPrimary,
            margin: 0,
            marginBottom: spacing[3]
          }}>
            Research Areas
          </h4>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: spacing[2]
          }}>
            {lab.researchAreas.map((area, index) => (
              <span
                key={index}
                style={{
                  padding: `${spacing[1]} ${spacing[3]}`,
                  backgroundColor: `${colors.primary}10`,
                  color: colors.primary,
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Professor Names */}
      {lab.professorNames && lab.professorNames.length > 1 && (
        <div style={{ marginTop: spacing[5] }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.textPrimary,
            margin: 0,
            marginBottom: spacing[3]
          }}>
            Lab Members
          </h4>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[2]
          }}>
            {lab.professorNames.map((professor, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2]
              }}>
                <GraduationCap size={16} color={colors.textSecondary} />
                <span style={{ color: colors.textPrimary }}>
                  {professor}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Info Row Component
const InfoRow = ({ icon, label, value, isLink = false, onClick }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3]
    }}>
      <div style={{ color: colors.textTertiary }}>
        {icon}
      </div>

      <div style={{ flex: 1 }}>
        <span style={{
          color: colors.textSecondary,
          fontSize: '14px',
          fontWeight: '500',
          marginRight: spacing[2]
        }}>
          {label}:
        </span>

        {isLink ? (
          <button
            onClick={onClick}
            style={{
              background: 'none',
              border: 'none',
              color: colors.primary,
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '14px',
              padding: 0
            }}
          >
            {value}
          </button>
        ) : (
          <span style={{
            color: colors.textPrimary,
            fontSize: '14px'
          }}>
            {value}
          </span>
        )}
      </div>
    </div>
  );
};

// Rating Breakdown Component
const RatingBreakdown = ({ lab }) => {
  // Use actual rating breakdown from API, or fallback to mock data
  const getRatingBreakdown = () => {
    if (lab.ratingBreakdown) {
      return lab.ratingBreakdown;
    }

    // Fallback to mock data if API doesn't provide rating breakdown
    const baseRating = lab.overallRating;
    return {
      'Mentorship Quality': Math.min(5, Math.max(1, baseRating + 0.2)),
      'Research Environment': Math.min(5, Math.max(1, baseRating - 0.1)),
      'Work-Life Balance': Math.min(5, Math.max(1, baseRating - 0.3)),
      'Career Support': Math.min(5, Math.max(1, baseRating + 0.1)),
      'Funding & Resources': baseRating,
      'Collaboration Culture': Math.min(5, Math.max(1, baseRating + 0.2))
    };
  };

  const ratings = getRatingBreakdown();

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: spacing[6],
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${colors.border}`
    }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: colors.textPrimary,
        margin: 0,
        marginBottom: spacing[4]
      }}>
        Rating Breakdown
      </h3>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[3]
      }}>
        {Object.entries(ratings).map(([category, rating]) => (
          <div key={category}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing[1]
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: colors.textPrimary
              }}>
                {category}
              </span>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: colors.primary
              }}>
                {rating.toFixed(1)}
              </span>
            </div>

            <div style={{
              height: '6px',
              backgroundColor: colors.backgroundLight,
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${(rating / 5) * 100}%`,
                backgroundColor: colors.primary,
                borderRadius: '3px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Recruitment Status Component
const RecruitmentStatus = ({ lab }) => {
  // Get recruitment data from API response
  const recruitmentStatus = lab.recruitment_status || lab.recruitmentStatus;

  const recruitmentData = [
    {
      position: 'PhD Students',
      isRecruiting: recruitmentStatus?.is_recruiting_phd || recruitmentStatus?.phd || false
    },
    {
      position: 'Postdocs',
      isRecruiting: recruitmentStatus?.is_recruiting_postdoc || recruitmentStatus?.postdoc || false
    },
    {
      position: 'Undergraduate Interns',
      isRecruiting: recruitmentStatus?.is_recruiting_intern || recruitmentStatus?.intern || false
    }
  ];

  // Check if we have any recruitment data or if all positions are closed
  const hasRecruitmentData = recruitmentStatus && Object.keys(recruitmentStatus).length > 0;
  const hasOpenPositions = recruitmentData.some(item => item.isRecruiting);
  const recruitmentNotes = recruitmentStatus?.notes;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: spacing[6],
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${colors.border}`
    }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: colors.textPrimary,
        margin: 0,
        marginBottom: spacing[4]
      }}>
        Recruitment Status
      </h3>

      {hasRecruitmentData && hasOpenPositions ? (
        // Show recruitment positions when we have data and open positions
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[3]
        }}>
          {recruitmentData.map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[3]
            }}>
              {item.isRecruiting ? (
                <CheckCircle size={20} color={colors.success} />
              ) : (
                <XCircle size={20} color={colors.textTertiary} />
              )}

              <span style={{
                flex: 1,
                fontSize: '16px',
                color: colors.textPrimary
              }}>
                {item.position}
              </span>

              <span style={{
                padding: `${spacing[1]} ${spacing[2]}`,
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: item.isRecruiting
                  ? `${colors.success}20`
                  : `${colors.textTertiary}20`,
                color: item.isRecruiting ? colors.success : colors.textTertiary
              }}>
                {item.isRecruiting ? 'Open' : 'Closed'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        // Show message when no data or all positions closed
        <div style={{
          textAlign: 'center',
          padding: spacing[4],
          color: colors.textTertiary
        }}>
          <p style={{
            fontSize: '14px',
            margin: 0,
            lineHeight: 1.4
          }}>
            Recruitment status may not be current. Please check the lab's official website or contact them directly for the most up-to-date information.
          </p>
        </div>
      )}

      {/* Show recruitment notes or default message */}
      {recruitmentNotes ? (
        <div style={{
          marginTop: spacing[4],
          padding: spacing[3],
          backgroundColor: `${colors.primary}10`,
          borderRadius: '8px',
          border: `1px solid ${colors.primary}30`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: spacing[2]
          }}>
            <Info size={16} color={colors.primary} style={{ marginTop: '2px' }} />
            <p style={{
              fontSize: '14px',
              color: colors.textSecondary,
              margin: 0,
              lineHeight: 1.4
            }}>
              {recruitmentNotes}
            </p>
          </div>
        </div>
      ) : (
        hasRecruitmentData && hasOpenPositions && (
          <div style={{
            marginTop: spacing[4],
            padding: spacing[3],
            backgroundColor: `${colors.warning}10`,
            borderRadius: '8px',
            border: `1px solid ${colors.warning}30`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: spacing[2]
            }}>
              <Info size={16} color={colors.warning} style={{ marginTop: '2px' }} />
              <p style={{
                fontSize: '14px',
                color: colors.textSecondary,
                margin: 0,
                lineHeight: 1.4
              }}>
                Recruitment status may not be current. Please check the lab's official website or contact them directly for the most up-to-date information.
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
};

// Publications Section Component
const PublicationsSection = ({ publications }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedPubs = showAll ? publications : publications.slice(0, 5);

  const formatAuthors = (authors) => {
    if (!authors || authors.length === 0) return 'Unknown Authors';
    if (authors.length <= 3) {
      return authors.join(', ');
    }
    return `${authors.slice(0, 3).join(', ')} et al.`;
  };

  const handlePublicationClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: spacing[6],
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${colors.border}`
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing[5]
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2]
        }}>
          <BookOpen size={24} color={colors.primary} />
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: colors.textPrimary,
            margin: 0
          }}>
            Recent Publications
          </h3>
        </div>
        <span style={{
          backgroundColor: `${colors.primary}15`,
          color: colors.primary,
          padding: `${spacing[1]} ${spacing[3]}`,
          borderRadius: '16px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          {publications.length} publications
        </span>
      </div>

      {/* Publications List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[4]
      }}>
        {displayedPubs.map((pub, index) => (
          <div
            key={index}
            style={{
              padding: spacing[4],
              backgroundColor: colors.background,
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              cursor: pub.url ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              ':hover': pub.url ? {
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                borderColor: colors.primary
              } : {}
            }}
            onClick={() => handlePublicationClick(pub.url)}
          >
            {/* Title */}
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: pub.url ? colors.primary : colors.textPrimary,
              margin: 0,
              marginBottom: spacing[2],
              lineHeight: 1.4,
              textDecoration: pub.url ? 'none' : 'none'
            }}>
              {pub.title || 'Untitled Publication'}
              {pub.url && (
                <ExternalLink
                  size={14}
                  style={{
                    marginLeft: spacing[1],
                    display: 'inline',
                    verticalAlign: 'middle'
                  }}
                />
              )}
            </h4>

            {/* Authors */}
            {pub.authors && pub.authors.length > 0 && (
              <p style={{
                fontSize: '14px',
                color: colors.textSecondary,
                margin: 0,
                marginBottom: spacing[2],
                fontStyle: 'italic'
              }}>
                {formatAuthors(pub.authors)}
              </p>
            )}

            {/* Publication Details */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: spacing[3],
              alignItems: 'center',
              fontSize: '14px',
              color: colors.textTertiary
            }}>
              {pub.journal && (
                <span style={{ fontWeight: '500' }}>
                  {pub.journal}
                </span>
              )}
              {pub.year && (
                <span>
                  {pub.year}
                </span>
              )}
              {pub.citation_count && pub.citation_count > 0 && (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[1],
                  backgroundColor: `${colors.warning}15`,
                  color: colors.warning,
                  padding: `2px ${spacing[2]}`,
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  <Quote size={12} />
                  {pub.citation_count} citations
                </span>
              )}
            </div>

            {/* Abstract (if available and not too long) */}
            {pub.abstract && pub.abstract.length > 0 && pub.abstract.length < 200 && (
              <p style={{
                fontSize: '14px',
                color: colors.textSecondary,
                margin: 0,
                marginTop: spacing[2],
                lineHeight: 1.4
              }}>
                {pub.abstract}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {publications.length > 5 && (
        <div style={{
          textAlign: 'center',
          marginTop: spacing[4]
        }}>
          <button
            onClick={() => setShowAll(!showAll)}
            style={{
              background: 'none',
              border: `2px solid ${colors.primary}`,
              color: colors.primary,
              padding: `${spacing[2]} ${spacing[4]}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            {showAll ? 'Show Less' : `Show All ${publications.length} Publications`}
          </button>
        </div>
      )}

      {/* Empty State */}
      {publications.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: spacing[6],
          color: colors.textTertiary
        }}>
          <BookOpen size={48} color={colors.textTertiary} style={{ marginBottom: spacing[2] }} />
          <p style={{
            fontSize: '16px',
            margin: 0
          }}>
            No publications available
          </p>
        </div>
      )}
    </div>
  );
};

// Reviews Section Component
const ReviewsSection = ({ lab, onWriteReview }) => {
  // const navigate = useNavigate(); // TODO: Add navigation functionality
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const loadReviews = async () => {
      if (!lab?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const API_BASE_URL = 'https://insidelab.up.railway.app/api/v1';
        const response = await fetch(`${API_BASE_URL}/reviews/?lab=${lab.id}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch reviews: ${response.status}`);
        }

        const data = await response.json();
        console.log('Loaded reviews for lab:', lab.id, data);

        // Transform API data to frontend format
        const transformedReviews = (data.results || data || []).map(review => ({
          id: review.id,
          author: review.user?.email?.split('@')[0] || 'Anonymous',
          date: new Date(review.created_at).toLocaleDateString(),
          rating: parseFloat(review.rating) || 0,
          content: review.review_text || 'No content',
          tags: review.pros && review.cons ? [
            ...(Array.isArray(review.pros) ? review.pros : []),
            ...(Array.isArray(review.cons) ? review.cons : [])
          ] : [],
          helpfulCount: review.helpful_count || 0,
          position: review.position,
          duration: review.duration
        }));

        setReviews(transformedReviews);
      } catch (error) {
        console.error('Error loading reviews:', error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [lab?.id]);

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: spacing[6],
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${colors.border}`
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing[5]
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2]
        }}>
          <MessageCircle size={24} color={colors.primary} />
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: colors.textPrimary,
            margin: 0
          }}>
            Recent Reviews
          </h3>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[3]
        }}>
          <span style={{
            backgroundColor: `${colors.primary}15`,
            color: colors.primary,
            padding: `${spacing[1]} ${spacing[3]}`,
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {reviews.length} reviews
          </span>
          <button
            onClick={onWriteReview}
            style={{
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: `${spacing[2]} ${spacing[4]}`,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Write Review
          </button>
        </div>
      </div>

      {loading ? (
        // Loading state
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing[6],
          color: colors.textTertiary
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: `2px solid ${colors.textTertiary}`,
            borderTop: `2px solid ${colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginRight: spacing[2]
          }} />
          Loading reviews...
        </div>
      ) : reviews.length > 0 ? (
        // Reviews list
        <div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[4]
          }}>
            {displayedReviews.map((review, index) => (
              <ReviewCard key={index} review={review} />
            ))}
          </div>

          {/* Show More/Less Button */}
          {reviews.length > 3 && (
            <div style={{
              textAlign: 'center',
              marginTop: spacing[4]
            }}>
              <button
                onClick={() => setShowAll(!showAll)}
                style={{
                  background: 'none',
                  border: `2px solid ${colors.primary}`,
                  color: colors.primary,
                  padding: `${spacing[2]} ${spacing[4]}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                {showAll ? 'Show Less' : `Show All ${reviews.length} Reviews`}
              </button>
            </div>
          )}
        </div>
      ) : (
        // Empty state
        <div style={{
          textAlign: 'center',
          padding: spacing[8],
          color: colors.textTertiary
        }}>
          <MessageCircle
            size={64}
            color={colors.textTertiary}
            style={{
              marginBottom: spacing[4],
              opacity: 0.5
            }}
          />
          <h4 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: colors.textSecondary,
            margin: 0,
            marginBottom: spacing[2]
          }}>
            No reviews yet
          </h4>
          <p style={{
            fontSize: '14px',
            color: colors.textTertiary,
            margin: 0,
            marginBottom: spacing[4],
            lineHeight: 1.5
          }}>
            Be the first to share your experience working in this lab. Your review will help future students and researchers.
          </p>
          <button
            onClick={onWriteReview}
            style={{
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: `${spacing[3]} ${spacing[5]}`,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Write First Review
          </button>
        </div>
      )}
    </div>
  );
};

// Review Card Component
const ReviewCard = ({ review }) => {
  return (
    <div style={{
      padding: spacing[4],
      backgroundColor: colors.background,
      borderRadius: '8px',
      border: `1px solid ${colors.border}`
    }}>
      {/* Review Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing[3]
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2]
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: colors.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {review.author?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: colors.textPrimary
            }}>
              {review.author || 'Anonymous'}
            </div>
            <div style={{
              fontSize: '12px',
              color: colors.textTertiary,
              display: 'flex',
              alignItems: 'center',
              gap: spacing[1]
            }}>
              <Clock size={12} />
              {review.date || 'Recent'}
            </div>
          </div>
        </div>

        {/* Rating */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[1]
        }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              fill={star <= (review.rating || 0) ? 'gold' : 'none'}
              color={star <= (review.rating || 0) ? 'gold' : colors.textTertiary}
            />
          ))}
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginLeft: spacing[1]
          }}>
            {review.rating || 0}/5
          </span>
        </div>
      </div>

      {/* Review Content */}
      <p style={{
        fontSize: '14px',
        color: colors.textSecondary,
        lineHeight: 1.5,
        margin: 0,
        marginBottom: spacing[3]
      }}>
        {review.content || 'No review content available.'}
      </p>

      {/* Review Tags */}
      {review.tags && review.tags.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: spacing[1],
          marginBottom: spacing[2]
        }}>
          {review.tags.map((tag, index) => (
            <span
              key={index}
              style={{
                backgroundColor: `${colors.primary}15`,
                color: colors.primary,
                padding: `2px ${spacing[2]}`,
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Review Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[3],
        marginTop: spacing[2]
      }}>
        <button style={{
          background: 'none',
          border: 'none',
          color: colors.textTertiary,
          fontSize: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: spacing[1]
        }}>
          <ThumbsUp size={12} />
          Helpful ({review.helpfulCount || 0})
        </button>
      </div>
    </div>
  );
};

export default LabDetailPage;
