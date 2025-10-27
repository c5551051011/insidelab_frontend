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

const MockInterviewBookingPage = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [sessionType, setSessionType] = useState('mock-interview'); // 'mock-interview' or 'qa-session'
  const [selectedLabs, setSelectedLabs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusAreas, setFocusAreas] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Available labs (mock data - will be replaced with API call)
  const availableLabs = [
    { id: 1, name: 'AI Research Lab', university: 'Stanford', professor: 'Dr. Sarah Johnson', field: 'Machine Learning' },
    { id: 2, name: 'Robotics Lab', university: 'MIT', professor: 'Dr. Michael Chen', field: 'Robotics' },
    { id: 3, name: 'NLP Lab', university: 'Berkeley', professor: 'Dr. Emily Wang', field: 'Natural Language Processing' },
    { id: 4, name: 'Computer Vision Lab', university: 'CMU', professor: 'Dr. David Kim', field: 'Computer Vision' },
    { id: 5, name: 'Systems Lab', university: 'Stanford', professor: 'Dr. Lisa Brown', field: 'Distributed Systems' }
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check authentication
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate('/login', { state: { from: '/services/mock-interview' } });
    }
  }, [navigate]);

  const sessionTypes = {
    'mock-interview': {
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
    'qa-session': {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Submit booking request to API
    console.log({
      sessionType,
      selectedLabs,
      focusAreas,
      preferredDate,
      preferredTime,
      additionalNotes,
      totalPrice: calculatePrice()
    });
    // Navigate to confirmation or payment
    alert('Booking request submitted! You will be matched with an interviewer soon.');
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
    if (currentStep === 3) return preferredDate && preferredTime;
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
              focusAreas={focusAreas}
              setFocusAreas={setFocusAreas}
              isMobile={isMobile}
            />
          )}

          {/* Step 3: Schedule */}
          {currentStep === 3 && (
            <ScheduleStep
              preferredDate={preferredDate}
              setPreferredDate={setPreferredDate}
              preferredTime={preferredTime}
              setPreferredTime={setPreferredTime}
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
              focusAreas={focusAreas}
              preferredDate={preferredDate}
              preferredTime={preferredTime}
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
                style={{
                  flex: 1,
                  padding: `${spacing[4]} ${spacing[6]}`,
                  backgroundColor: colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing[2]
                }}
              >
                <CheckCircle size={20} />
                Confirm Booking
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
  focusAreas,
  setFocusAreas,
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
          maxHeight: '300px',
          overflowY: 'auto',
          border: `1px solid ${colors.border}`,
          borderRadius: '8px'
        }}>
          {filteredLabs.map(lab => {
            const isSelected = selectedLabs.find(l => l.id === lab.id);
            const canSelect = selectedLabs.length < 2 || isSelected;

            return (
              <div
                key={lab.id}
                onClick={() => canSelect && handleLabSelect(lab)}
                style={{
                  padding: spacing[4],
                  borderBottom: `1px solid ${colors.border}`,
                  cursor: canSelect ? 'pointer' : 'not-allowed',
                  backgroundColor: isSelected ? `${colors.primary}08` : 'white',
                  opacity: canSelect ? 1 : 0.5,
                  transition: 'background-color 0.2s ease'
                }}
              >
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
                      marginBottom: spacing[1]
                    }}>
                      {lab.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: colors.textSecondary,
                      marginBottom: spacing[1]
                    }}>
                      {lab.university} • {lab.professor}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: colors.primary,
                      backgroundColor: `${colors.primary}20`,
                      padding: `${spacing[1]} ${spacing[2]}`,
                      borderRadius: '4px',
                      display: 'inline-block'
                    }}>
                      {lab.field}
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle size={20} color={colors.primary} />
                  )}
                </div>
              </div>
            );
          })}
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

// Schedule Step Component
const ScheduleStep = ({
  preferredDate,
  setPreferredDate,
  preferredTime,
  setPreferredTime,
  additionalNotes,
  setAdditionalNotes,
  isMobile
}) => {
  const today = new Date().toISOString().split('T')[0];

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
        Choose your preferred date and time. We'll confirm availability with matched interviewers.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: spacing[4],
        marginBottom: spacing[6]
      }}>
        {/* Date */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[2]
          }}>
            <Calendar size={16} style={{ display: 'inline', marginRight: spacing[1] }} />
            Preferred Date
          </label>
          <input
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            min={today}
            required
            style={{
              width: '100%',
              padding: spacing[3],
              fontSize: '14px',
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              outline: 'none'
            }}
          />
        </div>

        {/* Time */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[2]
          }}>
            <Clock size={16} style={{ display: 'inline', marginRight: spacing[1] }} />
            Preferred Time
          </label>
          <select
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            required
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
            <option value="09:00">9:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="12:00">12:00 PM</option>
            <option value="13:00">1:00 PM</option>
            <option value="14:00">2:00 PM</option>
            <option value="15:00">3:00 PM</option>
            <option value="16:00">4:00 PM</option>
            <option value="17:00">5:00 PM</option>
            <option value="18:00">6:00 PM</option>
            <option value="19:00">7:00 PM</option>
            <option value="20:00">8:00 PM</option>
          </select>
        </div>
      </div>

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
          <strong>Note:</strong> Your booking will be confirmed once we match you with an available interviewer.
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
  focusAreas,
  preferredDate,
  preferredTime,
  additionalNotes,
  calculatePrice,
  isMobile
}) => {
  const session = sessionTypes[sessionType];
  const Icon = session.icon;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
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
          Schedule
        </div>
        <div style={{
          fontSize: '14px',
          color: colors.textSecondary,
          marginBottom: spacing[2]
        }}>
          <strong>Date:</strong> {formatDate(preferredDate)}
        </div>
        <div style={{
          fontSize: '14px',
          color: colors.textSecondary
        }}>
          <strong>Time:</strong> {formatTime(preferredTime)}
        </div>
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
