import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Clock,
  DollarSign,
  Search,
  X,
  CheckCircle,
  Calendar,
  MessageSquare,
  Users,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { colors, spacing } from '../theme';
import { AuthService } from '../services/authService';
import { InterviewService } from '../services/interviewService';
import { SearchService } from '../services/searchService';
import { BookmarkService } from '../services/bookmarkService';

const MockInterviewBookingPage = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [sessionType, setSessionType] = useState('mock_interview'); // 'mock_interview' or 'qa_session'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [selectedLabs, setSelectedLabs] = useState([]);
  const [selectedResearchArea, setSelectedResearchArea] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusAreas, setFocusAreas] = useState('');
  const [preferredSlots, setPreferredSlots] = useState([
    { date: '', time: '' },
    { date: '', time: '' },
    { date: '', time: '' }
  ]);
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Lab data from API
  const [availableLabs, setAvailableLabs] = useState([]);
  const [interestedLabs, setInterestedLabs] = useState([]);
  const [labsLoading, setLabsLoading] = useState(true);

  // Research areas data from API
  const [researchAreas, setResearchAreas] = useState([]);
  const [researchAreasLoading, setResearchAreasLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check authentication
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate('/sign-in', { state: { from: '/services/mock-interview' } });
    }
  }, [navigate]);

  // Load lab data and user interests
  useEffect(() => {
    const loadLabData = async () => {
      if (!AuthService.isAuthenticated()) return;

      setLabsLoading(true);
      try {
        // Load popular labs (sorted by popularity/bookmark count)
        console.log('Loading popular labs...');
        const popularLabs = await SearchService.searchLabs('', {}, 1, 50);

        // Load user's bookmarked labs
        console.log('Loading user bookmarks...');
        const bookmarks = await BookmarkService.getUserBookmarks();

        // Transform lab data to include required fields
        const transformedLabs = popularLabs.results.map(lab => ({
          id: lab.id,
          name: lab.labName,
          university: lab.universityName,
          professor: lab.professorName,
          field: lab.researchAreas?.[0] || 'Research',
          department: lab.department,
          rating: lab.overallRating,
          reviewCount: lab.reviewCount,
          isBookmarked: bookmarks.some(bookmark => bookmark.labId === lab.id)
        }));

        // Separate interested labs (bookmarked) and other labs
        const bookmarkedLabs = transformedLabs.filter(lab => lab.isBookmarked);
        const otherLabs = transformedLabs.filter(lab => !lab.isBookmarked);

        // Sort other labs by rating and review count (popularity)
        otherLabs.sort((a, b) => {
          // Primary sort: rating * review count (popularity score)
          const scoreA = (a.rating || 0) * (a.reviewCount || 0);
          const scoreB = (b.rating || 0) * (b.reviewCount || 0);
          if (scoreB !== scoreA) return scoreB - scoreA;

          // Secondary sort: review count
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        });

        setInterestedLabs(bookmarkedLabs);
        setAvailableLabs([...bookmarkedLabs, ...otherLabs]);

        console.log(`Loaded ${bookmarkedLabs.length} interested labs and ${otherLabs.length} other labs`);
      } catch (error) {
        console.error('Error loading lab data:', error);
        // Fallback to empty arrays on error
        setInterestedLabs([]);
        setAvailableLabs([]);
      } finally {
        setLabsLoading(false);
      }
    };

    loadLabData();
  }, []);

  // Load research areas
  useEffect(() => {
    const loadResearchAreas = async () => {
      setResearchAreasLoading(true);
      try {
        console.log('Loading research areas...');
        const areas = await InterviewService.getResearchAreas();
        setResearchAreas(areas || []);
        console.log(`Loaded ${areas?.length || 0} research areas`);
      } catch (error) {
        console.error('Error loading research areas:', error);
        setResearchAreas([]);
      } finally {
        setResearchAreasLoading(false);
      }
    };

    loadResearchAreas();
  }, []);

  const sessionTypes = {
    'mock_interview': {
      name: 'Mock Interview',
      duration: '60 min',
      basePrice: 100,
      icon: Video,
      description: 'Full interview simulation with detailed feedback',
      features: [
        'Realistic interview experience',
        'Detailed written feedback',
        'Recorded session (optional)',
        'Follow-up resources'
      ]
    },
    'qa_session': {
      name: 'Q&A Session',
      duration: '30 min',
      basePrice: 50,
      icon: MessageSquare,
      description: 'Casual discussion and advice session',
      features: [
        'Ask anything about grad school',
        'Get insider tips',
        'Lab/program insights',
        'Application advice'
      ]
    }
  };

  const calculatePrice = () => {
    const basePrice = sessionTypes[sessionType].basePrice;
    const labMatchBonus = selectedLabs.length * 10;
    return basePrice + labMatchBonus;
  };

  const handleLabSelect = (lab) => {
    if (selectedLabs.find(l => l.id === lab.id)) {
      setSelectedLabs(selectedLabs.filter(l => l.id !== lab.id));
    } else if (selectedLabs.length < 2) {
      setSelectedLabs([...selectedLabs, lab]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Validate and prepare booking data
      const bookingData = {
        sessionType,
        selectedLabs: selectedLabs.map(lab => lab.id),
        researchAreaId: selectedResearchArea?.id || null,
        focusAreas,
        preferredSlots,
        additionalNotes,
        totalPrice: calculatePrice()
      };

      // Transform to API format
      const apiData = InterviewService.transformBookingToApiFormat(bookingData);

      console.log('Submitting interview session:', apiData);

      const result = await InterviewService.createInterviewSession(apiData);

      console.log('Interview session created:', result);

      // Navigate to My Sessions page with success message
      navigate('/my-sessions', {
        state: {
          message: `Interview session created successfully! Session ID: ${result.id}`,
          type: 'success'
        }
      });

    } catch (error) {
      console.error('Error submitting interview booking:', error);
      setSubmitError(error.message || 'Failed to create interview session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLabs = availableLabs.filter(lab =>
    lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lab.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lab.professor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lab.field.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canProceed = () => {
    if (currentStep === 1) return sessionType;
    if (currentStep === 2) return selectedLabs.length > 0;
    if (currentStep === 3) {
      // At least one complete time slot required
      return preferredSlots.some(slot => slot.date && slot.time);
    }
    return true;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
      <Header />

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: isMobile ? spacing[4] : spacing[8],
        paddingTop: isMobile ? spacing[6] : spacing[10]
      }}>
        {/* Header */}
        <div style={{
          marginBottom: spacing[8],
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: isMobile ? '28px' : '36px',
            fontWeight: '800',
            color: colors.textPrimary,
            marginBottom: spacing[3]
          }}>
            Book Mock Interview
          </h1>
          <p style={{
            fontSize: isMobile ? '14px' : '16px',
            color: colors.textSecondary,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Get matched with experienced graduate students or researchers for personalized interview prep
          </p>
        </div>

        {/* Progress Steps */}
        <ProgressSteps currentStep={currentStep} isMobile={isMobile} />

        {/* Error Message */}
        {submitError && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: spacing[4],
            marginBottom: spacing[6],
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3]
          }}>
            <AlertCircle size={20} color="#dc2626" />
            <div style={{
              fontSize: '14px',
              color: '#dc2626'
            }}>
              {submitError}
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit}>
          {/* Step 1: Session Type */}
          {currentStep === 1 && (
            <SessionTypeStep
              sessionTypes={sessionTypes}
              sessionType={sessionType}
              setSessionType={setSessionType}
              isMobile={isMobile}
            />
          )}

          {/* Step 2: Lab Selection */}
          {currentStep === 2 && (
            <LabSelectionStep
              selectedLabs={selectedLabs}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredLabs={filteredLabs}
              handleLabSelect={handleLabSelect}
              selectedResearchArea={selectedResearchArea}
              setSelectedResearchArea={setSelectedResearchArea}
              researchAreas={researchAreas}
              researchAreasLoading={researchAreasLoading}
              focusAreas={focusAreas}
              setFocusAreas={setFocusAreas}
              interestedLabs={interestedLabs}
              labsLoading={labsLoading}
              isMobile={isMobile}
            />
          )}

          {/* Step 3: Schedule */}
          {currentStep === 3 && (
            <ScheduleStep
              preferredSlots={preferredSlots}
              setPreferredSlots={setPreferredSlots}
              additionalNotes={additionalNotes}
              setAdditionalNotes={setAdditionalNotes}
              isMobile={isMobile}
            />
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <ReviewStep
              sessionType={sessionType}
              sessionTypes={sessionTypes}
              selectedLabs={selectedLabs}
              selectedResearchArea={selectedResearchArea}
              focusAreas={focusAreas}
              preferredSlots={preferredSlots}
              additionalNotes={additionalNotes}
              calculatePrice={calculatePrice}
              isMobile={isMobile}
            />
          )}

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: spacing[8],
            gap: spacing[4]
          }}>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                style={{
                  flex: 1,
                  padding: `${spacing[4]} ${spacing[6]}`,
                  backgroundColor: 'white',
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                style={{
                  flex: 1,
                  padding: `${spacing[4]} ${spacing[6]}`,
                  backgroundColor: canProceed() ? colors.primary : colors.backgroundSecondary,
                  color: canProceed() ? 'white' : colors.textTertiary,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: canProceed() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing[2]
                }}
              >
                Continue
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: `${spacing[4]} ${spacing[6]}`,
                  backgroundColor: isSubmitting ? colors.backgroundSecondary : colors.primary,
                  color: isSubmitting ? colors.textTertiary : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing[2],
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid transparent',
                      borderTop: '2px solid currentColor',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Creating Session...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Confirm Booking
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

// Progress Steps Component
const ProgressSteps = ({ currentStep, isMobile }) => {
  const steps = [
    { number: 1, label: 'Type' },
    { number: 2, label: 'Labs' },
    { number: 3, label: 'Schedule' },
    { number: 4, label: 'Review' }
  ];

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[8],
      position: 'relative'
    }}>
      {/* Progress Line */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '10%',
        right: '10%',
        height: '2px',
        backgroundColor: colors.border,
        zIndex: 0
      }}>
        <div style={{
          height: '100%',
          backgroundColor: colors.primary,
          width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Steps */}
      {steps.map((step) => (
        <div
          key={step.number}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 1,
            flex: 1
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: currentStep >= step.number ? colors.primary : 'white',
            border: `2px solid ${currentStep >= step.number ? colors.primary : colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: '600',
            color: currentStep >= step.number ? 'white' : colors.textTertiary,
            marginBottom: spacing[2],
            transition: 'all 0.3s ease'
          }}>
            {currentStep > step.number ? (
              <CheckCircle size={20} />
            ) : (
              step.number
            )}
          </div>
          {!isMobile && (
            <span style={{
              fontSize: '12px',
              color: currentStep >= step.number ? colors.primary : colors.textTertiary,
              fontWeight: currentStep >= step.number ? '600' : '500'
            }}>
              {step.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

// Session Type Step Component
const SessionTypeStep = ({ sessionTypes, sessionType, setSessionType, isMobile }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: isMobile ? spacing[5] : spacing[8],
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
    }}>
      <h2 style={{
        fontSize: isMobile ? '20px' : '24px',
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing[2]
      }}>
        Choose Session Type
      </h2>
      <p style={{
        fontSize: '14px',
        color: colors.textSecondary,
        marginBottom: spacing[6]
      }}>
        Select the type of session that best fits your needs
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: spacing[4]
      }}>
        {Object.entries(sessionTypes).map(([key, type]) => {
          const Icon = type.icon;
          const isSelected = sessionType === key;

          return (
            <div
              key={key}
              onClick={() => setSessionType(key)}
              style={{
                padding: spacing[6],
                border: `2px solid ${isSelected ? colors.primary : colors.border}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: isSelected ? `${colors.primary}08` : 'white'
              }}
            >
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
                  backgroundColor: `${colors.primary}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={24} color={colors.primary} />
                </div>
                {isSelected && (
                  <CheckCircle size={24} color={colors.primary} />
                )}
              </div>

              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: spacing[1]
              }}>
                {type.name}
              </h3>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[3],
                marginBottom: spacing[3],
                fontSize: '14px',
                color: colors.textSecondary
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                  <Clock size={16} />
                  {type.duration}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                  <DollarSign size={16} />
                  ${type.basePrice}+
                </div>
              </div>

              <p style={{
                fontSize: '14px',
                color: colors.textSecondary,
                marginBottom: spacing[4]
              }}>
                {type.description}
              </p>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                fontSize: '13px',
                color: colors.textSecondary
              }}>
                {type.features.map((feature, idx) => (
                  <li key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    marginBottom: spacing[2]
                  }}>
                    <CheckCircle size={14} color={colors.success} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Lab Selection Step Component
const LabSelectionStep = ({
  selectedLabs,
  searchQuery,
  setSearchQuery,
  filteredLabs,
  handleLabSelect,
  selectedResearchArea,
  setSelectedResearchArea,
  researchAreas,
  researchAreasLoading,
  focusAreas,
  setFocusAreas,
  interestedLabs,
  labsLoading,
  isMobile
}) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: isMobile ? spacing[5] : spacing[8],
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
    }}>
      <h2 style={{
        fontSize: isMobile ? '20px' : '24px',
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing[2]
      }}>
        Select Target Labs
      </h2>
      <p style={{
        fontSize: '14px',
        color: colors.textSecondary,
        marginBottom: spacing[6]
      }}>
        Choose up to 2 labs you're interested in (helps us match you with the right interviewer)
      </p>

      {/* Selected Labs */}
      {selectedLabs.length > 0 && (
        <div style={{
          marginBottom: spacing[6],
          padding: spacing[4],
          backgroundColor: colors.backgroundSecondary,
          borderRadius: '12px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[3]
          }}>
            Selected Labs ({selectedLabs.length}/2)
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[2]
          }}>
            {selectedLabs.map(lab => (
              <div
                key={lab.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: spacing[3],
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: `1px solid ${colors.primary}`
                }}
              >
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.textPrimary,
                    marginBottom: spacing[1]
                  }}>
                    {lab.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: colors.textSecondary
                  }}>
                    {lab.university} • {lab.professor}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleLabSelect(lab)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: spacing[1],
                    color: colors.textTertiary
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: spacing[4] }}>
        <div style={{
          position: 'relative',
          marginBottom: spacing[4]
        }}>
          <Search
            size={20}
            style={{
              position: 'absolute',
              left: spacing[3],
              top: '50%',
              transform: 'translateY(-50%)',
              color: colors.textTertiary
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by lab name, university, or field..."
            style={{
              width: '100%',
              padding: `${spacing[3]} ${spacing[3]} ${spacing[3]} ${spacing[10]}`,
              fontSize: '14px',
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              outline: 'none'
            }}
          />
        </div>

        {/* Lab List */}
        <div style={{
          maxHeight: '400px',
          overflowY: 'auto',
          border: `1px solid ${colors.border}`,
          borderRadius: '8px'
        }}>
          {labsLoading ? (
            // Loading state
            <div style={{
              padding: spacing[8],
              textAlign: 'center',
              color: colors.textSecondary
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid transparent',
                borderTop: '3px solid currentColor',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
                marginBottom: spacing[3]
              }} />
              Loading labs...
            </div>
          ) : filteredLabs.length === 0 ? (
            // No results state
            <div style={{
              padding: spacing[8],
              textAlign: 'center',
              color: colors.textSecondary
            }}>
              <Users size={48} style={{ opacity: 0.5, marginBottom: spacing[3] }} />
              <div>No labs found matching your search</div>
            </div>
          ) : (
            // Lab list with interested labs first
            <>
              {/* Interested Labs Section */}
              {interestedLabs.length > 0 && !searchQuery && (
                <>
                  <div style={{
                    padding: spacing[3],
                    backgroundColor: `${colors.success}20`,
                    borderBottom: `1px solid ${colors.border}`,
                    fontSize: '13px',
                    fontWeight: '600',
                    color: colors.success,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2]
                  }}>
                    <CheckCircle size={16} />
                    Your Interested Labs ({interestedLabs.length})
                  </div>
                  {interestedLabs.map(lab => (
                    <LabListItem
                      key={`interested-${lab.id}`}
                      lab={lab}
                      selectedLabs={selectedLabs}
                      handleLabSelect={handleLabSelect}
                      isInterested={true}
                    />
                  ))}

                  {/* Separator */}
                  <div style={{
                    padding: spacing[3],
                    backgroundColor: colors.backgroundSecondary,
                    borderBottom: `1px solid ${colors.border}`,
                    fontSize: '13px',
                    fontWeight: '600',
                    color: colors.textSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2]
                  }}>
                    Popular Labs
                  </div>
                </>
              )}

              {/* All Labs */}
              {filteredLabs.map(lab => {
                // Skip if this lab is already shown in interested section
                if (interestedLabs.some(intLab => intLab.id === lab.id) && !searchQuery) {
                  return null;
                }

                return (
                  <LabListItem
                    key={lab.id}
                    lab={lab}
                    selectedLabs={selectedLabs}
                    handleLabSelect={handleLabSelect}
                    isInterested={false}
                  />
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Research Areas Selection */}
      <div style={{ marginTop: spacing[6] }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: spacing[2]
        }}>
          Research Area (Optional)
        </label>
        <p style={{
          fontSize: '12px',
          color: colors.textSecondary,
          marginBottom: spacing[3]
        }}>
          Select your primary research area to help us match you with an interviewer in your field
        </p>

        {researchAreasLoading ? (
          <div style={{
            padding: spacing[6],
            textAlign: 'center',
            color: colors.textSecondary,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px'
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              border: '3px solid transparent',
              borderTop: '3px solid currentColor',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto',
              marginBottom: spacing[2]
            }} />
            Loading research areas...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: spacing[3],
            maxHeight: '300px',
            overflowY: 'auto',
            padding: spacing[3],
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            backgroundColor: colors.backgroundSecondary
          }}>
            {researchAreas.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                padding: spacing[4],
                textAlign: 'center',
                color: colors.textSecondary,
                fontSize: '14px'
              }}>
                No research areas available
              </div>
            ) : (
              researchAreas.map(area => {
                const isSelected = selectedResearchArea?.id === area.id;
                return (
                  <div
                    key={area.id}
                    onClick={() => setSelectedResearchArea(isSelected ? null : area)}
                    style={{
                      padding: spacing[3],
                      border: `2px solid ${isSelected ? colors.primary : colors.border}`,
                      borderRadius: '8px',
                      backgroundColor: isSelected ? `${colors.primary}08` : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: spacing[2]
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: colors.textPrimary,
                        marginBottom: area.description ? spacing[1] : 0
                      }}>
                        {area.name}
                      </div>
                      {area.description && (
                        <div style={{
                          fontSize: '12px',
                          color: colors.textSecondary,
                          lineHeight: 1.4
                        }}>
                          {area.description}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <CheckCircle size={20} color={colors.primary} style={{ flexShrink: 0 }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {selectedResearchArea && (
          <div style={{
            marginTop: spacing[3],
            padding: spacing[3],
            backgroundColor: `${colors.success}20`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            fontSize: '13px',
            color: colors.success
          }}>
            <CheckCircle size={16} />
            Selected: {selectedResearchArea.name}
          </div>
        )}
      </div>

      {/* Focus Areas */}
      <div style={{ marginTop: spacing[6] }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: spacing[2]
        }}>
          Focus Areas (Optional)
        </label>
        <p style={{
          fontSize: '12px',
          color: colors.textSecondary,
          marginBottom: spacing[3]
        }}>
          What specific topics or aspects do you want to focus on during the interview?
        </p>
        <textarea
          value={focusAreas}
          onChange={(e) => setFocusAreas(e.target.value)}
          placeholder="e.g., Research methodology, lab culture, funding opportunities, work-life balance..."
          rows={4}
          style={{
            width: '100%',
            padding: spacing[3],
            fontSize: '14px',
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            outline: 'none',
            fontFamily: 'Inter',
            resize: 'vertical'
          }}
        />
      </div>
    </div>
  );
};

// Lab List Item Component
const LabListItem = ({ lab, selectedLabs, handleLabSelect, isInterested }) => {
  const isSelected = selectedLabs.find(l => l.id === lab.id);
  const canSelect = selectedLabs.length < 2 || isSelected;

  return (
    <div
      onClick={() => canSelect && handleLabSelect(lab)}
      style={{
        padding: spacing[4],
        borderBottom: `1px solid ${colors.border}`,
        cursor: canSelect ? 'pointer' : 'not-allowed',
        backgroundColor: isSelected ? `${colors.primary}08` : 'white',
        opacity: canSelect ? 1 : 0.5,
        transition: 'background-color 0.2s ease',
        position: 'relative'
      }}
    >
      {/* Bookmark indicator */}
      {isInterested && (
        <div style={{
          position: 'absolute',
          top: spacing[2],
          right: spacing[2],
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: colors.success
        }} />
      )}

      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[1],
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2]
          }}>
            {lab.name}
            {isInterested && (
              <span style={{
                fontSize: '10px',
                backgroundColor: colors.success,
                color: 'white',
                padding: '2px 6px',
                borderRadius: '10px',
                fontWeight: '500'
              }}>
                ★ Interested
              </span>
            )}
          </div>
          <div style={{
            fontSize: '12px',
            color: colors.textSecondary,
            marginBottom: spacing[1]
          }}>
            {lab.university} • {lab.professor}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            marginBottom: spacing[1]
          }}>
            <div style={{
              fontSize: '12px',
              color: colors.primary,
              backgroundColor: `${colors.primary}20`,
              padding: `${spacing[1]} ${spacing[2]}`,
              borderRadius: '4px'
            }}>
              {lab.field}
            </div>
            {lab.rating && lab.reviewCount > 0 && (
              <div style={{
                fontSize: '11px',
                color: colors.textTertiary,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                ⭐ {lab.rating.toFixed(1)} ({lab.reviewCount} reviews)
              </div>
            )}
          </div>
        </div>
        {isSelected && (
          <CheckCircle size={20} color={colors.primary} />
        )}
      </div>
    </div>
  );
};

// Schedule Step Component
const ScheduleStep = ({
  preferredSlots,
  setPreferredSlots,
  additionalNotes,
  setAdditionalNotes,
  isMobile
}) => {
  const today = new Date().toISOString().split('T')[0];

  const handleSlotChange = (index, field, value) => {
    const newSlots = [...preferredSlots];
    newSlots[index][field] = value;
    setPreferredSlots(newSlots);
  };

  const timeOptions = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const formatTimeOption = (time) => {
    const [hours] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${ampm}`;
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: isMobile ? spacing[5] : spacing[8],
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
    }}>
      <h2 style={{
        fontSize: isMobile ? '20px' : '24px',
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing[2]
      }}>
        Schedule Your Session
      </h2>
      <p style={{
        fontSize: '14px',
        color: colors.textSecondary,
        marginBottom: spacing[6]
      }}>
        Provide 3 preferred time slots in order of priority. We'll match you with an available interviewer.
      </p>

      {/* Time Slots */}
      {preferredSlots.map((slot, index) => (
        <div key={index} style={{
          marginBottom: spacing[5],
          padding: spacing[4],
          backgroundColor: colors.backgroundSecondary,
          borderRadius: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            marginBottom: spacing[3]
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: colors.primary,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '700'
            }}>
              {index + 1}
            </div>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: colors.textPrimary
            }}>
              {index === 0 ? 'First Choice' : index === 1 ? 'Second Choice' : 'Third Choice'}
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: spacing[3]
          }}>
            {/* Date */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: colors.textPrimary,
                marginBottom: spacing[2]
              }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: spacing[1] }} />
                Date
              </label>
              <input
                type="date"
                value={slot.date}
                onChange={(e) => handleSlotChange(index, 'date', e.target.value)}
                min={today}
                style={{
                  width: '100%',
                  padding: spacing[3],
                  fontSize: '14px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              />
            </div>

            {/* Time */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: colors.textPrimary,
                marginBottom: spacing[2]
              }}>
                <Clock size={14} style={{ display: 'inline', marginRight: spacing[1] }} />
                Time
              </label>
              <select
                value={slot.time}
                onChange={(e) => handleSlotChange(index, 'time', e.target.value)}
                style={{
                  width: '100%',
                  padding: spacing[3],
                  fontSize: '14px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Select time...</option>
                {timeOptions.map(time => (
                  <option key={time} value={time}>{formatTimeOption(time)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}

      {/* Info Box */}
      <div style={{
        padding: spacing[4],
        backgroundColor: `${colors.info}20`,
        borderRadius: '8px',
        marginBottom: spacing[6],
        display: 'flex',
        gap: spacing[3]
      }}>
        <AlertCircle size={20} color={colors.info} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '13px', color: colors.textSecondary }}>
          <strong>Note:</strong> Providing multiple time slots increases your chances of finding an available interviewer.
          You'll receive confirmation within 24 hours.
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: spacing[2]
        }}>
          Additional Notes (Optional)
        </label>
        <textarea
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="Any specific requirements, questions, or information you'd like to share with your interviewer..."
          rows={4}
          style={{
            width: '100%',
            padding: spacing[3],
            fontSize: '14px',
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            outline: 'none',
            fontFamily: 'Inter',
            resize: 'vertical'
          }}
        />
      </div>
    </div>
  );
};

// Review Step Component
const ReviewStep = ({
  sessionType,
  sessionTypes,
  selectedLabs,
  selectedResearchArea,
  focusAreas,
  preferredSlots,
  additionalNotes,
  calculatePrice,
  isMobile
}) => {
  const session = sessionTypes[sessionType];
  const Icon = session.icon;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${ampm}`;
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: isMobile ? spacing[5] : spacing[8],
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
    }}>
      <h2 style={{
        fontSize: isMobile ? '20px' : '24px',
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing[2]
      }}>
        Review Your Booking
      </h2>
      <p style={{
        fontSize: '14px',
        color: colors.textSecondary,
        marginBottom: spacing[6]
      }}>
        Please review all details before confirming your booking
      </p>

      {/* Session Type */}
      <div style={{
        padding: spacing[5],
        backgroundColor: colors.backgroundSecondary,
        borderRadius: '12px',
        marginBottom: spacing[4]
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[3],
          marginBottom: spacing[3]
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: `${colors.primary}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={24} color={colors.primary} />
          </div>
          <div>
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: colors.textPrimary
            }}>
              {session.name}
            </div>
            <div style={{
              fontSize: '14px',
              color: colors.textSecondary
            }}>
              {session.duration}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Labs */}
      {selectedLabs.length > 0 && (
        <div style={{
          padding: spacing[5],
          backgroundColor: colors.backgroundSecondary,
          borderRadius: '12px',
          marginBottom: spacing[4]
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[3],
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2]
          }}>
            <Users size={16} />
            Target Labs
          </div>
          {selectedLabs.map(lab => (
            <div key={lab.id} style={{
              padding: spacing[3],
              backgroundColor: 'white',
              borderRadius: '8px',
              marginBottom: spacing[2],
              fontSize: '14px'
            }}>
              <div style={{
                fontWeight: '600',
                color: colors.textPrimary,
                marginBottom: spacing[1]
              }}>
                {lab.name}
              </div>
              <div style={{
                fontSize: '12px',
                color: colors.textSecondary
              }}>
                {lab.university} • {lab.professor} • {lab.field}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Research Area */}
      {selectedResearchArea && (
        <div style={{
          padding: spacing[5],
          backgroundColor: colors.backgroundSecondary,
          borderRadius: '12px',
          marginBottom: spacing[4]
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[3]
          }}>
            Research Area
          </div>
          <div style={{
            padding: spacing[3],
            backgroundColor: 'white',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            <div style={{
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: selectedResearchArea.description ? spacing[1] : 0
            }}>
              {selectedResearchArea.name}
            </div>
            {selectedResearchArea.description && (
              <div style={{
                fontSize: '12px',
                color: colors.textSecondary,
                lineHeight: 1.4
              }}>
                {selectedResearchArea.description}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Focus Areas */}
      {focusAreas && (
        <div style={{
          padding: spacing[5],
          backgroundColor: colors.backgroundSecondary,
          borderRadius: '12px',
          marginBottom: spacing[4]
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[3]
          }}>
            Focus Areas
          </div>
          <div style={{
            fontSize: '14px',
            color: colors.textSecondary,
            lineHeight: 1.6
          }}>
            {focusAreas}
          </div>
        </div>
      )}

      {/* Schedule */}
      <div style={{
        padding: spacing[5],
        backgroundColor: colors.backgroundSecondary,
        borderRadius: '12px',
        marginBottom: spacing[4]
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: spacing[3],
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2]
        }}>
          <Calendar size={16} />
          Preferred Time Slots
        </div>
        {preferredSlots
          .filter(slot => slot.date && slot.time)
          .map((slot, index) => (
            <div
              key={index}
              style={{
                padding: spacing[3],
                backgroundColor: 'white',
                borderRadius: '8px',
                marginBottom: spacing[2],
                display: 'flex',
                alignItems: 'center',
                gap: spacing[3]
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: colors.primary,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
                flexShrink: 0
              }}>
                {index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  marginBottom: spacing[1]
                }}>
                  {formatDate(slot.date)}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: colors.textSecondary
                }}>
                  {formatTime(slot.time)}
                </div>
              </div>
            </div>
          ))}
        {preferredSlots.filter(slot => slot.date && slot.time).length === 0 && (
          <div style={{
            fontSize: '14px',
            color: colors.textTertiary,
            fontStyle: 'italic'
          }}>
            No time slots selected
          </div>
        )}
      </div>

      {/* Additional Notes */}
      {additionalNotes && (
        <div style={{
          padding: spacing[5],
          backgroundColor: colors.backgroundSecondary,
          borderRadius: '12px',
          marginBottom: spacing[4]
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[3]
          }}>
            Additional Notes
          </div>
          <div style={{
            fontSize: '14px',
            color: colors.textSecondary,
            lineHeight: 1.6
          }}>
            {additionalNotes}
          </div>
        </div>
      )}

      {/* Price Summary */}
      <div style={{
        padding: spacing[6],
        backgroundColor: `${colors.success}20`,
        borderRadius: '12px',
        border: `2px solid ${colors.success}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{
              fontSize: '14px',
              color: colors.textSecondary,
              marginBottom: spacing[1]
            }}>
              Total Price
            </div>
            <div style={{
              fontSize: '12px',
              color: colors.textSecondary
            }}>
              Base: ${session.basePrice} + Lab Match: ${selectedLabs.length * 10}
            </div>
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: '800',
            color: colors.success
          }}>
            ${calculatePrice()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockInterviewBookingPage;
