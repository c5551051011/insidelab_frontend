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
import UniversityDepartmentSelector from '../components/UniversityDepartmentSelector';
import { colors, spacing } from '../theme';
import { AuthService } from '../services/authService';
import { InterviewService } from '../services/interviewService';
import { SearchService } from '../services/searchService';
import { BookmarkService } from '../services/bookmarkService';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useTranslation } from '../i18n';

const MockInterviewBookingPage = () => {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [sessionType, setSessionType] = useState('mock_interview'); // 'mock_interview' or 'qa_session'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [selectedLabs, setSelectedLabs] = useState([]);
  const [selectedResearchAreas, setSelectedResearchAreas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusAreas, setFocusAreas] = useState('');
  const [preferredSlots, setPreferredSlots] = useState([
    { date: '', startTime: '', endTime: '' },
    { date: '', startTime: '', endTime: '' },
    { date: '', startTime: '', endTime: '' }
  ]);
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Lab data from API
  const [availableLabs, setAvailableLabs] = useState([]);
  const [interestedLabs, setInterestedLabs] = useState([]);
  const [labsLoading, setLabsLoading] = useState(true);

  // Research areas data from API
  const [researchAreas, setResearchAreas] = useState([]);
  const [researchAreasLoading, setResearchAreasLoading] = useState(true);

  // University and department selection (compatible with UniversityDepartmentSelector)
  const [selectedUniversityId, setSelectedUniversityId] = useState('');
  const [selectedUniversityName, setSelectedUniversityName] = useState('');
  const [selectedUniversityDepartmentId, setSelectedUniversityDepartmentId] = useState('');
  const [selectedDepartmentName, setSelectedDepartmentName] = useState('');
  const [selectedDepartmentObject, setSelectedDepartmentObject] = useState(null);

  // Legacy state for backward compatibility
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Handlers for UniversityDepartmentSelector
  const handleUniversitySelected = (universityId, universityName) => {
    console.log('University selected:', universityId, universityName);
    setSelectedUniversityId(universityId);
    setSelectedUniversityName(universityName);

    // Update legacy state for compatibility
    const university = { id: universityId, name: universityName };
    setSelectedUniversity(university);

    // Reset department selection
    setSelectedUniversityDepartmentId('');
    setSelectedDepartmentName('');
    setSelectedDepartment(null);
  };

  const handleDepartmentSelected = (departmentId, departmentName, departmentObject = null) => {
    console.log('Department selected:', departmentId, departmentName, departmentObject);
    setSelectedUniversityDepartmentId(departmentId);
    setSelectedDepartmentName(departmentName);
    setSelectedDepartmentObject(departmentObject);

    // Update legacy state for compatibility
    const department = { id: departmentId, name: departmentName, department: departmentId };
    setSelectedDepartment(department);
  };

  // Check authentication
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate('/sign-in', { state: { from: '/services/mock-interview' } });
    }
  }, [navigate]);

  // Note: University and department loading is now handled by UniversityDepartmentSelector component

  // Load lab data when both university and department are selected
  useEffect(() => {
    if (selectedUniversity && selectedDepartment) {
      const loadLabData = async () => {
        if (!AuthService.isAuthenticated()) return;

        setLabsLoading(true);
        try {
          // Load labs filtered by university and department
          console.log(`Loading labs for ${selectedUniversity.name} - ${selectedDepartment.name}...`);
          const filteredLabs = await SearchService.getLabsByUniversityAndDepartment(selectedUniversity.name, selectedDepartment.name, 1, 50);

          // Load user's bookmarked labs
          console.log('Loading user bookmarks...');
          const bookmarks = await BookmarkService.getLabInterests();

          // Transform lab data to include required fields
          const transformedLabs = filteredLabs.results.map(lab => ({
            id: lab.id,
            name: lab.labName,
            university: lab.universityName,
            professor: lab.professorName,
            field: lab.researchAreas?.[0] || 'Research',
            department: lab.department,
            rating: parseFloat(lab.overallRating) || 0,
            reviewCount: lab.reviewCount,
            isBookmarked: bookmarks.some(bookmark => bookmark.labId === lab.id.toString())
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

          console.log(`Loaded ${bookmarkedLabs.length} interested labs and ${otherLabs.length} other labs for ${selectedUniversity.name} - ${selectedDepartment.name}`);
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
    } else {
      // Clear lab data when university or department is not selected
      setAvailableLabs([]);
      setInterestedLabs([]);
      setSelectedLabs([]);
    }
  }, [selectedUniversity, selectedDepartment]);

  // Load research areas when department is selected
  useEffect(() => {
    if (selectedUniversityDepartmentId && selectedDepartmentObject) {
      const loadResearchAreas = async () => {
        setResearchAreasLoading(true);
        try {
          // Use the actual department_id from the department object, not university_department_id
          // Based on the SearchService.getDepartments method, the department object has:
          // - id: university_department_id (e.g., 8 for Purdue CS)
          // - department: actual department_id (e.g., 2 for Purdue CS)
          // The research areas API needs the actual department_id
          const departmentId = selectedDepartmentObject.department || selectedDepartmentObject.department_id || selectedDepartmentObject.id || selectedUniversityDepartmentId;
          console.log('Loading research areas for department_id:', departmentId);
          console.log('Department object:', selectedDepartmentObject);
          console.log('Using department_id vs university_department_id:', {
            'department (actual department_id)': selectedDepartmentObject.department,
            'department_id': selectedDepartmentObject.department_id,
            'id (university_department_id)': selectedDepartmentObject.id,
            'selectedUniversityDepartmentId (fallback)': selectedUniversityDepartmentId,
            'using_for_api': departmentId
          });

          const areas = await SearchService.getResearchAreasByDepartment(departmentId);

          // Ensure we always set an array
          if (Array.isArray(areas)) {
            setResearchAreas(areas);
            console.log(`Loaded ${areas.length} research areas for department ${selectedDepartmentName}`);
          } else {
            console.warn('Research areas response is not an array:', areas);
            setResearchAreas([]);
          }
        } catch (error) {
          console.error('Error loading research areas:', error);
          setResearchAreas([]);
        } finally {
          setResearchAreasLoading(false);
        }
      };

      loadResearchAreas();
    } else {
      // Clear research areas when no department is selected
      setResearchAreas([]);
      setSelectedResearchAreas([]);
      setResearchAreasLoading(false);
    }
  }, [selectedUniversityDepartmentId, selectedDepartmentName, selectedDepartmentObject]);

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
      console.log('Selected research areas before mapping:', selectedResearchAreas);
      const researchAreaIds = selectedResearchAreas.map(area => area.id);
      console.log('Research area IDs:', researchAreaIds);

      const bookingData = {
        sessionType,
        selectedLabs: selectedLabs.map(lab => lab.id),
        researchAreaIds,
        focusAreas,
        preferredSlots,
        additionalNotes,
        totalPrice: calculatePrice()
      };

      console.log('Booking data before transform:', bookingData);

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
    (lab.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lab.university || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lab.professor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lab.field || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canProceed = () => {
    if (currentStep === 1) return selectedUniversityId && selectedUniversityDepartmentId;
    if (currentStep === 2) return sessionType;
    if (currentStep === 3) return selectedResearchAreas.length > 0;
    if (currentStep === 4) return selectedLabs.length > 0;
    if (currentStep === 5) {
      // First time slot (index 0) is required, others are optional
      const firstSlot = preferredSlots[0];
      return firstSlot && firstSlot.date && firstSlot.startTime && firstSlot.endTime;
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
            {t('mockInterview.title', 'Book Mock Interview')}
          </h1>
          <p style={{
            fontSize: isMobile ? '14px' : '16px',
            color: colors.textSecondary,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            {t('mockInterview.subtitle', 'Get matched with experienced graduate students or researchers for personalized interview prep')}
          </p>
        </div>

        {/* Progress Steps */}
        <ProgressSteps currentStep={currentStep} isMobile={isMobile} setCurrentStep={setCurrentStep} />

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
          {/* Step 1: University & Department Selection */}
          {currentStep === 1 && (
            <UniversityDepartmentStep
              selectedUniversityId={selectedUniversityId}
              selectedUniversityName={selectedUniversityName}
              selectedUniversityDepartmentId={selectedUniversityDepartmentId}
              onUniversitySelected={handleUniversitySelected}
              onDepartmentSelected={handleDepartmentSelected}
              isMobile={isMobile}
            />
          )}

          {/* Step 2: Session Type */}
          {currentStep === 2 && (
            <SessionTypeStep
              sessionTypes={sessionTypes}
              sessionType={sessionType}
              setSessionType={setSessionType}
              isMobile={isMobile}
            />
          )}

          {/* Step 3: Research Area */}
          {currentStep === 3 && (
            <ResearchAreaStep
              selectedResearchAreas={selectedResearchAreas}
              setSelectedResearchAreas={setSelectedResearchAreas}
              researchAreas={researchAreas}
              researchAreasLoading={researchAreasLoading}
              focusAreas={focusAreas}
              setFocusAreas={setFocusAreas}
              isMobile={isMobile}
            />
          )}

          {/* Step 4: Lab Selection */}
          {currentStep === 4 && (
            <LabSelectionStep
              selectedLabs={selectedLabs}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredLabs={filteredLabs}
              handleLabSelect={handleLabSelect}
              focusAreas={focusAreas}
              setFocusAreas={setFocusAreas}
              interestedLabs={interestedLabs}
              labsLoading={labsLoading}
              isMobile={isMobile}
            />
          )}

          {/* Step 5: Schedule */}
          {currentStep === 5 && (
            <ScheduleStep
              preferredSlots={preferredSlots}
              setPreferredSlots={setPreferredSlots}
              additionalNotes={additionalNotes}
              setAdditionalNotes={setAdditionalNotes}
              isMobile={isMobile}
            />
          )}

          {/* Step 6: Review */}
          {currentStep === 6 && (
            <ReviewStep
              sessionType={sessionType}
              sessionTypes={sessionTypes}
              selectedLabs={selectedLabs}
              selectedResearchAreas={selectedResearchAreas}
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
                onClick={() => {
                  setCurrentStep(currentStep - 1);
                  setSubmitError(''); // Clear any error messages when navigating
                }}
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

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(currentStep + 1);
                  setSubmitError(''); // Clear any error messages when navigating
                }}
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
const ProgressSteps = ({ currentStep, isMobile, setCurrentStep }) => {
  const { t } = useTranslation();
  const steps = [
    { number: 1, label: t('mockInterview.steps.university', 'University') },
    { number: 2, label: t('mockInterview.steps.type', 'Type') },
    { number: 3, label: t('mockInterview.steps.research', 'Research') },
    { number: 4, label: t('mockInterview.steps.labs', 'Labs') },
    { number: 5, label: t('mockInterview.steps.schedule', 'Schedule') },
    { number: 6, label: t('mockInterview.steps.review', 'Review') }
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
      {steps.map((step) => {
        const canNavigate = step.number < currentStep; // Only allow clicking on previous steps
        return (
          <div
            key={step.number}
            onClick={() => canNavigate && setCurrentStep(step.number)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 1,
              flex: 1,
              cursor: canNavigate ? 'pointer' : 'default'
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
        );
      })}
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
                    {lab.professor || 'Professor Information Unavailable'}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: colors.textSecondary
                  }}>
                    {lab.university} • {lab.department} • {lab.name}
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
  const [isHovered, setIsHovered] = React.useState(false);
  const isSelected = selectedLabs.find(l => l.id === lab.id);
  const canSelect = selectedLabs.length < 2 || isSelected;

  // Only show rating if it exists and is greater than 0, and there are reviews
  const hasRating = lab.rating && parseFloat(lab.rating) > 0 && lab.reviewCount > 0;

  return (
    <div
      onClick={() => canSelect && handleLabSelect(lab)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: spacing[4],
        borderBottom: `1px solid ${colors.border}`,
        cursor: canSelect ? 'pointer' : 'not-allowed',
        backgroundColor: isSelected ? `${colors.primary}08` : (isHovered && canSelect ? colors.backgroundLight : 'white'),
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
          {/* First line: Professor - Lab name Rating */}
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[1],
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            flexWrap: 'wrap'
          }}>
            <span>{lab.professor || 'Professor Information Unavailable'} - {lab.name}</span>
            {hasRating && (
              <span style={{
                fontSize: '12px',
                color: colors.textSecondary,
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                ⭐ {parseFloat(lab.rating).toFixed(1)}
              </span>
            )}
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
          {/* Second line: University - Department */}
          <div style={{
            fontSize: '12px',
            color: colors.textSecondary
          }}>
            {lab.university} - {lab.department}
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
        Provide at least 1 preferred time slot (up to 3). The first slot is required, others are optional. We'll match you with an available interviewer.
      </p>

      {/* Time Slots */}
      {preferredSlots.map((slot, index) => (
        <div key={index} style={{
          marginBottom: spacing[5],
          padding: spacing[4],
          backgroundColor: index === 0 ? `${colors.primary}08` : colors.backgroundSecondary,
          border: index === 0 ? `1px solid ${colors.primary}20` : 'none',
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
              {index === 0 ? 'First Choice (Required)' : index === 1 ? 'Second Choice (Optional)' : 'Third Choice (Optional)'}
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr',
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

            {/* Start Time */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: colors.textPrimary,
                marginBottom: spacing[2]
              }}>
                <Clock size={14} style={{ display: 'inline', marginRight: spacing[1] }} />
                Start Time
              </label>
              <select
                value={slot.startTime}
                onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
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
                <option value="">Start time...</option>
                {timeOptions.map(time => (
                  <option key={time} value={time}>{formatTimeOption(time)}</option>
                ))}
              </select>
            </div>

            {/* End Time */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: colors.textPrimary,
                marginBottom: spacing[2]
              }}>
                <Clock size={14} style={{ display: 'inline', marginRight: spacing[1] }} />
                End Time
              </label>
              <select
                value={slot.endTime}
                onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
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
                <option value="">End time...</option>
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
  selectedResearchAreas,
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
                {lab.professor || 'Professor Information Unavailable'}
              </div>
              <div style={{
                fontSize: '12px',
                color: colors.textSecondary
              }}>
                {lab.university} • {lab.department} • {lab.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Research Area */}
      {selectedResearchAreas.length > 0 && (
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
              marginBottom: spacing[1]
            }}>
              {selectedResearchAreas.map(area => area.name).join(', ')}
            </div>
            {selectedResearchAreas.length === 1 && selectedResearchAreas[0].description && (
              <div style={{
                fontSize: '12px',
                color: colors.textSecondary,
                lineHeight: 1.4
              }}>
                {selectedResearchAreas[0].description}
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
          .filter(slot => slot.date && slot.startTime && slot.endTime)
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
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </div>
              </div>
            </div>
          ))}
        {preferredSlots.filter(slot => slot.date && slot.startTime && slot.endTime).length === 0 && (
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

// University & Department Selection Step
const UniversityDepartmentStep = ({
  selectedUniversityId,
  selectedUniversityName,
  selectedUniversityDepartmentId,
  onUniversitySelected,
  onDepartmentSelected,
  isMobile
}) => {
  const { t } = useTranslation();
  return (
    <div style={{ marginBottom: spacing[8] }}>
      <h2 style={{
        fontSize: isMobile ? '20px' : '24px',
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing[2],
        fontFamily: 'Inter'
      }}>
        {t('mockInterview.step1.title', 'Choose University & Department')}
      </h2>
      <p style={{
        fontSize: isMobile ? '14px' : '16px',
        color: colors.textSecondary,
        marginBottom: spacing[6],
        fontFamily: 'Inter'
      }}>
        {t('mockInterview.step1.subtitle', 'Select the university and department you\'re interested in for your mock interview')}
      </p>

      <UniversityDepartmentSelector
        selectedUniversityId={selectedUniversityId}
        selectedUniversityName={selectedUniversityName}
        selectedUniversityDepartmentId={selectedUniversityDepartmentId}
        onUniversitySelected={onUniversitySelected}
        onDepartmentSelected={onDepartmentSelected}
        isRequired={true}
        layout="responsive"
      />
    </div>
  );
};

// Research Area Selection Step (extracted from original LabSelectionStep)
const ResearchAreaStep = ({
  selectedResearchAreas,
  setSelectedResearchAreas,
  researchAreas,
  researchAreasLoading,
  focusAreas,
  setFocusAreas,
  isMobile
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAreaName, setCustomAreaName] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleCustomAreaSearch = async (query) => {
    setCustomAreaName(query);

    if (query.trim().length > 2) {
      setIsSearching(true);
      try {
        const suggestions = await SearchService.searchResearchAreas(query);
        setSearchSuggestions(suggestions);
      } catch (error) {
        console.error('Error searching research areas:', error);
        setSearchSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchSuggestions([]);
    }
  };

  const handleAreaToggle = (area) => {
    const isSelected = selectedResearchAreas.some(selected => selected.id === area.id);

    if (isSelected) {
      // Remove from selection
      setSelectedResearchAreas(prev => prev.filter(selected => selected.id !== area.id));
    } else {
      // Add to selection (max 3)
      if (selectedResearchAreas.length < 3) {
        setSelectedResearchAreas(prev => [...prev, area]);
      }
    }
  };

  const handleCustomAreaAdd = () => {
    console.log('DEBUG: handleCustomAreaAdd called with customAreaName:', customAreaName);
    if (customAreaName.trim() && selectedResearchAreas.length < 3) {
      const customArea = {
        id: `custom_${Date.now()}`,
        name: customAreaName.trim(),
        description: 'Custom research area'
      };
      console.log('DEBUG: Creating custom area:', customArea);
      setSelectedResearchAreas(prev => [...prev, customArea]);
      setCustomAreaName('');
      setShowCustomInput(false);
      setSearchSuggestions([]);
      console.log('DEBUG: Custom area added successfully');
    } else {
      console.log('DEBUG: customAreaName is empty or max limit reached');
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    if (selectedResearchAreas.length < 3) {
      setSelectedResearchAreas(prev => [...prev, suggestion]);
    }
    setCustomAreaName('');
    setShowCustomInput(false);
    setSearchSuggestions([]);
  };

  return (
    <div style={{ marginBottom: spacing[8] }}>
      <h2 style={{
        fontSize: isMobile ? '20px' : '24px',
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing[2],
        fontFamily: 'Inter'
      }}>
        Select Research Areas
      </h2>
      <p style={{
        fontSize: isMobile ? '14px' : '16px',
        color: colors.textSecondary,
        marginBottom: spacing[6],
        fontFamily: 'Inter'
      }}>
        Choose 1-3 research areas of interest. Selected: {selectedResearchAreas.length}/3
      </p>

      {/* Selected Research Areas Display */}
      {selectedResearchAreas.length > 0 && (
        <div style={{ marginBottom: spacing[6] }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[3],
            fontFamily: 'Inter'
          }}>
            Selected Research Areas ({selectedResearchAreas.length}/3)
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: spacing[2]
          }}>
            {selectedResearchAreas.map(area => (
              <div key={`selected-${area.id}`} style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor: colors.primary,
                color: 'white',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                fontFamily: 'Inter',
                gap: spacing[2]
              }}>
                {area.name}
                <button
                  onClick={() => handleAreaToggle(area)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    padding: '2px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Research Area Selection */}
      <div style={{ marginBottom: spacing[6] }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: spacing[3],
          fontFamily: 'Inter'
        }}>
          Research Area *
        </label>

        {researchAreasLoading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing[6],
            color: colors.textSecondary
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: `2px solid ${colors.border}`,
              borderTop: `2px solid ${colors.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto',
              marginBottom: spacing[2]
            }} />
            Loading research areas...
          </div>
        ) : (
          <div>
            {/* Popular Research Areas */}
            {Array.isArray(researchAreas) && researchAreas.length >= 3 && (
              <div style={{ marginBottom: spacing[4] }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  marginBottom: spacing[3],
                  fontFamily: 'Inter'
                }}>
                  Popular Research Areas
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: spacing[2]
                }}>
                  {researchAreas.slice(0, Math.min(6, researchAreas.length)).map(area => {
                    const isSelected = selectedResearchAreas.some(selected => selected.id === area.id);
                    const canSelect = !isSelected && selectedResearchAreas.length < 3;
                    return (
                      <button
                        key={`popular-${area.id}`}
                        onClick={() => !isSelected && handleAreaToggle(area)}
                        disabled={isSelected || selectedResearchAreas.length >= 3}
                        style={{
                          padding: `${spacing[2]} ${spacing[3]}`,
                          backgroundColor: isSelected ? colors.backgroundSecondary : 'white',
                          color: isSelected ? colors.textTertiary : colors.textPrimary,
                          border: `1px solid ${colors.border}`,
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: isSelected ? 'not-allowed' : (canSelect ? 'pointer' : 'not-allowed'),
                          transition: 'all 0.2s ease',
                          fontFamily: 'Inter',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          gap: spacing[1],
                          opacity: isSelected ? 0.6 : ((!isSelected && selectedResearchAreas.length >= 3) ? 0.5 : 1)
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected && canSelect) {
                            e.target.style.backgroundColor = colors.primary;
                            e.target.style.color = 'white';
                            e.target.style.borderColor = colors.border;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected && canSelect) {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = colors.textPrimary;
                            e.target.style.borderColor = colors.border;
                          }
                        }}
                      >
                        {area.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Research Areas */}
            {Array.isArray(researchAreas) && researchAreas.length > 6 && (
              <div style={{ marginBottom: spacing[4] }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  marginBottom: spacing[3],
                  fontFamily: 'Inter'
                }}>
                  All Research Areas ({researchAreas.length})
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: spacing[2],
                  maxHeight: '200px',
                  overflowY: 'auto',
                  padding: spacing[2],
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  backgroundColor: colors.backgroundLight
                }}>
                  {researchAreas.map(area => {
                    const isSelected = selectedResearchAreas.some(selected => selected.id === area.id);
                    const canSelect = !isSelected && selectedResearchAreas.length < 3;
                    return (
                      <button
                        key={area.id}
                        onClick={() => !isSelected && handleAreaToggle(area)}
                        disabled={isSelected || selectedResearchAreas.length >= 3}
                        style={{
                          padding: `${spacing[2]} ${spacing[3]}`,
                          backgroundColor: isSelected ? colors.backgroundSecondary : 'white',
                          color: isSelected ? colors.textTertiary : colors.textPrimary,
                          border: `1px solid ${colors.border}`,
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: isSelected ? 'not-allowed' : (canSelect ? 'pointer' : 'not-allowed'),
                          transition: 'all 0.2s ease',
                          fontFamily: 'Inter',
                          display: 'flex',
                          alignItems: 'center',
                          gap: spacing[1],
                          opacity: isSelected ? 0.6 : ((!isSelected && selectedResearchAreas.length >= 3) ? 0.5 : 1)
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected && canSelect) {
                            e.target.style.backgroundColor = colors.primary;
                            e.target.style.color = 'white';
                            e.target.style.borderColor = colors.border;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected && canSelect) {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = colors.textPrimary;
                            e.target.style.borderColor = colors.border;
                          }
                        }}
                      >
                        {area.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add Custom Research Area Button */}
            <div>
              <button
                type="button"
                onClick={() => setShowCustomInput(!showCustomInput)}
                disabled={selectedResearchAreas.length >= 3}
                style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  backgroundColor: selectedResearchAreas.length >= 3 ? colors.backgroundSecondary : colors.backgroundLight,
                  border: `2px dashed ${colors.border}`,
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: selectedResearchAreas.length >= 3 ? colors.textTertiary : colors.primary,
                  cursor: selectedResearchAreas.length >= 3 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'Inter',
                  opacity: selectedResearchAreas.length >= 3 ? 0.5 : 1
                }}
              >
                + Add Custom Research Area {selectedResearchAreas.length >= 3 && '(Limit reached)'}
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Custom Research Area Input */}
      {showCustomInput && (
        <div style={{
          marginBottom: spacing[6],
          padding: spacing[4],
          backgroundColor: colors.backgroundLight,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px'
        }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[2],
            fontFamily: 'Inter'
          }}>
            Enter Custom Research Area
          </label>
          <div style={{
            display: 'flex',
            gap: spacing[2]
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                value={customAreaName}
                onChange={(e) => handleCustomAreaSearch(e.target.value)}
                placeholder="e.g., Quantum Machine Learning, Computational Biology..."
                style={{
                  width: '100%',
                  padding: spacing[3],
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Inter',
                  backgroundColor: 'white'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomAreaAdd();
                  }
                }}
              />

              {/* Search Suggestions */}
              {(isSearching || searchSuggestions.length > 0) && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: `1px solid ${colors.border}`,
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  zIndex: 1000,
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {isSearching && (
                    <div style={{
                      padding: spacing[3],
                      color: colors.textSecondary,
                      fontSize: '14px',
                      textAlign: 'center'
                    }}>
                      Searching...
                    </div>
                  )}

                  {searchSuggestions.map(suggestion => (
                    <div
                      key={suggestion.id}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      style={{
                        padding: spacing[3],
                        borderBottom: `1px solid ${colors.border}`,
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontFamily: 'Inter',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = colors.backgroundLight;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'white';
                      }}
                    >
                      <div style={{ fontWeight: '600', color: colors.textPrimary }}>
                        {suggestion.name}
                      </div>
                      <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                        Click to select existing research area
                      </div>
                    </div>
                  ))}

                  {!isSearching && searchSuggestions.length === 0 && customAreaName.trim().length > 2 && (
                    <div style={{
                      padding: spacing[3],
                      color: colors.textSecondary,
                      fontSize: '14px',
                      textAlign: 'center'
                    }}>
                      No existing research areas found. Click "Add" to create new one.
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleCustomAreaAdd}
              disabled={!customAreaName.trim()}
              style={{
                padding: `${spacing[3]} ${spacing[4]}`,
                backgroundColor: customAreaName.trim() ? colors.primary : colors.backgroundSecondary,
                color: customAreaName.trim() ? 'white' : colors.textTertiary,
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: customAreaName.trim() ? 'pointer' : 'not-allowed',
                fontFamily: 'Inter',
                transition: 'all 0.2s ease'
              }}
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowCustomInput(false);
                setCustomAreaName('');
                setSearchSuggestions([]);
              }}
              style={{
                padding: `${spacing[3]} ${spacing[4]}`,
                backgroundColor: 'white',
                color: colors.textSecondary,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'Inter',
                transition: 'all 0.2s ease'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* This section is no longer needed as custom areas are shown as pills */}
      {false && (
        <div style={{
          marginBottom: spacing[6],
          padding: spacing[3],
          backgroundColor: `${colors.success}20`,
          border: `2px solid ${colors.success}`,
          borderRadius: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: colors.success,
                marginBottom: spacing[1],
                fontFamily: 'Inter'
              }}>
                Custom Research Area Selected
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '700',
                color: colors.textPrimary,
                fontFamily: 'Inter'
              }}>
                {/* This is no longer used */}
              </div>
            </div>
            <button
              onClick={() => {/* This is no longer used */}}
              style={{
                padding: spacing[2],
                backgroundColor: 'white',
                color: colors.textSecondary,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'Inter'
              }}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Focus Areas Text Input */}
      <div>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: spacing[2],
          fontFamily: 'Inter'
        }}>
          Specific Focus Areas (Optional)
        </label>
        <textarea
          value={focusAreas}
          onChange={(e) => setFocusAreas(e.target.value)}
          placeholder="e.g., Natural Language Processing, Computer Vision, Reinforcement Learning..."
          style={{
            width: '100%',
            minHeight: '80px',
            padding: spacing[3],
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'Inter',
            resize: 'vertical',
            backgroundColor: 'white'
          }}
        />
      </div>
    </div>
  );
};

export default MockInterviewBookingPage;
