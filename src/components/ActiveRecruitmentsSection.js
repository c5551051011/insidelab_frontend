import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Briefcase, ArrowRight } from 'lucide-react';
import { colors, spacing, textStyles, sectionSpacing } from '../theme';
import { RecruitmentService } from '../services/recruitmentService';
import RecruitmentCard from './RecruitmentCard';
import { useBreakpoint } from '../hooks/useBreakpoint';

const ActiveRecruitmentsSection = () => {
  const [recruitments, setRecruitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    const fetchRecruitments = async () => {
      try {
        setLoading(true);
        // Fetch all active recruitments with a reasonable page size
        const data = await RecruitmentService.getActiveRecruitments({
          page_size: 20
        });

        // Filter to only show labs that are actively recruiting
        const activeRecruitments = data.filter(recruitment =>
          recruitment.isRecruitingPhd ||
          recruitment.isRecruitingPostdoc ||
          recruitment.isRecruitingIntern
        );

        setRecruitments(activeRecruitments);
      } catch (err) {
        console.error('Error fetching recruitments:', err);
        setError('Failed to load recruitment data');
      } finally {
        setLoading(false);
      }
    };

    fetchRecruitments();
  }, []);

  const handleScroll = (direction) => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 340; // Card width + gap
    const currentScroll = scrollContainerRef.current.scrollLeft;
    const targetScroll = direction === 'left'
      ? currentScroll - scrollAmount
      : currentScroll + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  const handleCardClick = (recruitment) => {
    navigate(`/lab/${recruitment.labId}`);
  };

  const handleViewAll = () => {
    navigate('/search?filter=recruiting');
  };

  if (loading) {
    return (
      <section style={{
        backgroundColor: colors.background,
        padding: `${spacing[20]} ${sectionSpacing.horizontal[isMobile ? 'mobile' : 'desktop']}`
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            color: colors.textSecondary
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `3px solid ${colors.border}`,
              borderTop: `3px solid ${colors.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: spacing[3]
            }} />
            Loading recruitment opportunities...
          </div>
        </div>
      </section>
    );
  }

  if (error || recruitments.length === 0) {
    return null; // Don't show the section if there's an error or no data
  }

  return (
    <section style={{
      backgroundColor: colors.background,
      padding: `${spacing[20]} ${sectionSpacing.horizontal[isMobile ? 'mobile' : 'desktop']}`
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Section Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: isMobile ? spacing[10] : spacing[12]
        }}>
          <h2 style={{
            ...textStyles[isMobile ? 'sectionTitleMobile' : 'sectionTitle'],
            color: colors.textPrimary,
            marginBottom: spacing[3]
          }}>
            Active Recruitment
          </h2>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <p style={{
              ...textStyles.sectionSubtitle,
              color: colors.textSecondary
            }}>
              Discover labs that are actively recruiting PhD students, postdocs, and research interns.
              Connect with leading research groups seeking new talent.
            </p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing[3],
          marginBottom: spacing[6]
        }}>
          {!isMobile && (
            <>
              <button
                onClick={() => handleScroll('left')}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: `2px solid ${colors.border}`,
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: colors.textSecondary
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = colors.primary;
                  e.target.style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.color = colors.textSecondary;
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => handleScroll('right')}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: `2px solid ${colors.border}`,
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: colors.textSecondary
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = colors.primary;
                  e.target.style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.color = colors.textSecondary;
                }}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* Cards Container */}
        <div
          ref={scrollContainerRef}
          style={{
            display: 'flex',
            gap: spacing[4],
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            paddingBottom: spacing[4],
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            justifyContent: isMobile ? 'flex-start' : 'center'
          }}
        >
          {recruitments.map((recruitment, index) => (
            <RecruitmentCard
              key={recruitment.id || index}
              recruitment={recruitment}
              onClick={handleCardClick}
            />
          ))}
        </div>

        {/* View All Button */}
        <div style={{
          textAlign: 'center',
          marginTop: spacing[8]
        }}>
          <button
            onClick={handleViewAll}
            style={{
              padding: `${spacing[3]} ${spacing[6]}`,
              backgroundColor: colors.primary,
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: spacing[2],
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            View All Opportunities
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};

export default ActiveRecruitmentsSection;