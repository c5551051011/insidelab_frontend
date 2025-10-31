import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  User,
  Video,
  MessageSquare,
  Mail,
  Loader
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { colors, spacing } from '../theme';
import { AuthService } from '../services/authService';
import { InterviewService } from '../services/interviewService';

const MySessionsPage = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', 'all'
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch sessions from API
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch based on active tab
        let data;
        if (activeTab === 'upcoming') {
          data = await InterviewService.getUpcomingSessions();
        } else if (activeTab === 'past') {
          data = await InterviewService.getPastSessions();
        } else {
          data = await InterviewService.getInterviewSessions();
        }

        // Transform API data to frontend format
        const transformedSessions = (data || []).map(session => ({
          id: session.id,
          type: session.session_type,
          status: session.status,
          createdAt: session.created_at,
          targetLabs: (session.target_labs || []).map(lab => ({
            name: lab.lab_name,
            university: lab.university_name,
            field: lab.field_name
          })),
          focusAreas: session.focus_areas,
          preferredSlots: (session.preferred_slots || []).map(slot => ({
            date: slot.date,
            time: slot.time,
            priority: slot.priority
          })),
          matchedInterviewer: session.interviewer ? {
            name: `${session.interviewer.first_name || ''} ${session.interviewer.last_name || ''}`.trim() || session.interviewer.email,
            position: session.interviewer.position,
            university: session.interviewer.university,
            department: session.interviewer.department,
            email: session.interviewer.email,
            matchType: session.match_type
          } : null,
          confirmedSlot: session.confirmed_date && session.confirmed_time ? {
            date: session.confirmed_date,
            time: session.confirmed_time
          } : null,
          price: parseFloat(session.total_price || 0)
        }));

        setSessions(transformedSessions);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (AuthService.isAuthenticated()) {
      fetchSessions();
    }
  }, [activeTab]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate('/sign-in', { state: { from: '/my-sessions' } });
    }
  }, [navigate]);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending Review',
          color: colors.warning,
          icon: Clock,
          description: 'Your booking is being reviewed'
        };
      case 'matching':
        return {
          label: 'Finding Interviewer',
          color: colors.info,
          icon: User,
          description: 'We are matching you with the best interviewer'
        };
      case 'confirmed':
        return {
          label: 'Confirmed',
          color: colors.success,
          icon: CheckCircle,
          description: 'Your session is confirmed'
        };
      case 'completed':
        return {
          label: 'Completed',
          color: colors.textTertiary,
          icon: CheckCircle,
          description: 'Session completed'
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          color: colors.danger,
          icon: AlertCircle,
          description: 'Session was cancelled'
        };
      default:
        return {
          label: 'Unknown',
          color: colors.textTertiary,
          icon: AlertCircle,
          description: ''
        };
    }
  };

  const getMatchTypeInfo = (matchType) => {
    switch (matchType) {
      case 'exact-lab':
        return {
          label: 'Exact Lab Match',
          color: colors.success,
          description: 'Interviewer from your target lab'
        };
      case 'same-department':
        return {
          label: 'Department Match',
          color: colors.info,
          description: 'Interviewer from the same department'
        };
      case 'same-field':
        return {
          label: 'Field Match',
          color: colors.primary,
          description: 'Interviewer from the same research field'
        };
      default:
        return { label: '', color: '', description: '' };
    }
  };

  // No filtering needed - API already returns filtered results based on tab
  const filteredSessions = sessions;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
      <Header />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? spacing[4] : spacing[8],
        paddingTop: isMobile ? spacing[6] : spacing[10]
      }}>
        {/* Header */}
        <div style={{
          marginBottom: spacing[8]
        }}>
          <h1 style={{
            fontSize: isMobile ? '28px' : '36px',
            fontWeight: '800',
            color: colors.textPrimary,
            marginBottom: spacing[3]
          }}>
            My Sessions
          </h1>
          <p style={{
            fontSize: isMobile ? '14px' : '16px',
            color: colors.textSecondary
          }}>
            Track your mock interview and Q&A session bookings
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fee',
            padding: spacing[4],
            borderRadius: '8px',
            marginBottom: spacing[4],
            color: colors.danger
          }}>
            Error loading sessions: {error}
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: spacing[2],
          marginBottom: spacing[6],
          borderBottom: `1px solid ${colors.border}`,
          overflowX: 'auto'
        }}>
          {[
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'past', label: 'Past' },
            { id: 'all', label: 'All' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: `${spacing[3]} ${spacing[5]}`,
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? `2px solid ${colors.primary}` : '2px solid transparent',
                color: activeTab === tab.id ? colors.primary : colors.textSecondary,
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? '600' : '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: spacing[10],
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
          }}>
            <Loader size={48} color={colors.primary} style={{ marginBottom: spacing[4], animation: 'spin 1s linear infinite' }} />
            <p style={{
              fontSize: '14px',
              color: colors.textSecondary
            }}>
              Loading your sessions...
            </p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: spacing[10],
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
          }}>
            <Calendar size={64} color={colors.textTertiary} style={{ marginBottom: spacing[4], opacity: 0.5 }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[2]
            }}>
              No sessions found
            </h3>
            <p style={{
              fontSize: '14px',
              color: colors.textSecondary,
              marginBottom: spacing[6]
            }}>
              You haven't booked any sessions yet
            </p>
            <button
              onClick={() => navigate('/services/mock-interview')}
              style={{
                padding: `${spacing[3]} ${spacing[6]}`,
                backgroundColor: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Book a Session
            </button>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[4]
          }}>
            {filteredSessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                getStatusInfo={getStatusInfo}
                getMatchTypeInfo={getMatchTypeInfo}
                isMobile={isMobile}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

// Session Card Component
const SessionCard = ({ session, getStatusInfo, getMatchTypeInfo, isMobile }) => {
  const statusInfo = getStatusInfo(session.status);
  const StatusIcon = statusInfo.icon;
  const sessionIcon = session.type === 'mock-interview' ? Video : MessageSquare;
  const SessionIcon = sessionIcon;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
      padding: isMobile ? spacing[5] : spacing[6],
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      border: `1px solid ${colors.border}`
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing[4],
        flexWrap: 'wrap',
        gap: spacing[3]
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: `${colors.primary}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <SessionIcon size={24} color={colors.primary} />
          </div>
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: spacing[1]
            }}>
              {session.type === 'mock-interview' ? 'Mock Interview' : 'Q&A Session'}
            </h3>
            <div style={{
              fontSize: '12px',
              color: colors.textSecondary
            }}>
              Booked on {formatDate(session.createdAt)}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: spacing[2],
          padding: `${spacing[2]} ${spacing[3]}`,
          backgroundColor: `${statusInfo.color}20`,
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '600',
          color: statusInfo.color
        }}>
          <StatusIcon size={16} />
          {statusInfo.label}
        </div>
      </div>

      {/* Target Labs */}
      <div style={{
        marginBottom: spacing[4],
        padding: spacing[4],
        backgroundColor: colors.backgroundSecondary,
        borderRadius: '8px'
      }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: spacing[2]
        }}>
          Target Labs
        </div>
        {session.targetLabs.map((lab, idx) => (
          <div key={idx} style={{
            fontSize: '13px',
            color: colors.textSecondary,
            marginBottom: spacing[1]
          }}>
            • {lab.name} - {lab.university} ({lab.field})
          </div>
        ))}
      </div>

      {/* Matched Interviewer (if confirmed) */}
      {session.status === 'confirmed' && session.matchedInterviewer && (
        <div style={{
          marginBottom: spacing[4],
          padding: spacing[4],
          backgroundColor: `${colors.success}08`,
          borderRadius: '8px',
          border: `1px solid ${colors.success}40`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: spacing[3]
          }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[2]
            }}>
              Matched Interviewer
            </div>
            <div style={{
              fontSize: '11px',
              padding: `${spacing[1]} ${spacing[2]}`,
              backgroundColor: getMatchTypeInfo(session.matchedInterviewer.matchType).color + '20',
              color: getMatchTypeInfo(session.matchedInterviewer.matchType).color,
              borderRadius: '12px',
              fontWeight: '600'
            }}>
              {getMatchTypeInfo(session.matchedInterviewer.matchType).label}
            </div>
          </div>

          <div style={{ marginBottom: spacing[3] }}>
            <div style={{
              fontSize: '15px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[1]
            }}>
              {session.matchedInterviewer.name}
            </div>
            <div style={{
              fontSize: '13px',
              color: colors.textSecondary
            }}>
              {session.matchedInterviewer.position} • {session.matchedInterviewer.department}
            </div>
            <div style={{
              fontSize: '13px',
              color: colors.textSecondary
            }}>
              {session.matchedInterviewer.university} • {session.matchedInterviewer.lab}
            </div>
          </div>

          {/* Contact Info */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[2],
            fontSize: '13px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <Mail size={14} color={colors.textTertiary} />
              <span style={{ color: colors.textSecondary }}>{session.matchedInterviewer.email}</span>
            </div>
          </div>
        </div>
      )}

      {/* Confirmed Schedule */}
      {session.status === 'confirmed' && session.confirmedSlot && (
        <div style={{
          marginBottom: spacing[4],
          padding: spacing[4],
          backgroundColor: `${colors.primary}08`,
          borderRadius: '8px'
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[2]
          }}>
            Confirmed Schedule
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[4],
            fontSize: '14px',
            color: colors.textSecondary
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <Calendar size={16} />
              {formatDate(session.confirmedSlot.date)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <Clock size={16} />
              {formatTime(session.confirmedSlot.time)}
            </div>
          </div>

          {session.meetingLink && (
            <a
              href={session.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: spacing[2],
                marginTop: spacing[3],
                padding: `${spacing[2]} ${spacing[4]}`,
                backgroundColor: colors.primary,
                color: 'white',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              <Video size={16} />
              Join Meeting
            </a>
          )}
        </div>
      )}

      {/* Preferred Slots (if not confirmed) */}
      {session.status !== 'confirmed' && session.preferredSlots && (
        <div style={{
          marginBottom: spacing[4],
          padding: spacing[4],
          backgroundColor: colors.backgroundSecondary,
          borderRadius: '8px'
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[2]
          }}>
            Your Preferred Time Slots
          </div>
          {session.preferredSlots.map((slot, idx) => (
            <div key={idx} style={{
              fontSize: '13px',
              color: colors.textSecondary,
              marginBottom: spacing[1],
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2]
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: '600',
                padding: `2px ${spacing[2]}`,
                backgroundColor: `${colors.primary}20`,
                color: colors.primary,
                borderRadius: '4px'
              }}>
                #{slot.priority}
              </span>
              {formatDate(slot.date)} at {formatTime(slot.time)}
            </div>
          ))}
        </div>
      )}

      {/* Focus Areas */}
      {session.focusAreas && (
        <div style={{
          marginBottom: spacing[4],
          padding: spacing[4],
          backgroundColor: colors.backgroundSecondary,
          borderRadius: '8px'
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[2]
          }}>
            Focus Areas
          </div>
          <div style={{
            fontSize: '13px',
            color: colors.textSecondary,
            lineHeight: 1.5
          }}>
            {session.focusAreas}
          </div>
        </div>
      )}

      {/* Price */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing[4],
        borderTop: `1px solid ${colors.border}`
      }}>
        <div style={{
          fontSize: '13px',
          color: colors.textSecondary
        }}>
          Session Price
        </div>
        <div style={{
          fontSize: '20px',
          fontWeight: '700',
          color: colors.primary
        }}>
          ${session.price}
        </div>
      </div>
    </div>
  );
};

export default MySessionsPage;
