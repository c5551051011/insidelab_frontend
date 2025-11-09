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
  Star,
  GraduationCap,
  BookOpen,
  ChevronDown,
  ChevronUp
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
  const [expandedInterviewers, setExpandedInterviewers] = useState({}); // State for toggling interviewer details

  // Add spin animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

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
        const transformedSessions = (data?.results || []).map(session => ({
          id: session.id,
          type: session.session_type,
          typeDisplay: session.session_type_display || (session.session_type === 'mock-interview' ? 'Mock Interview' : 'Q&A Session'),
          status: session.status,
          createdAt: session.created_at,

          // Use new detailed API fields with fallback to legacy fields
          targetLabs: session.target_lab_names || (session.target_labs || []).map(lab => ({
            name: lab.lab_name || lab.name,
            university: lab.university_name || lab.university,
            field: lab.field_name || lab.field,
            priority: lab.priority
          })),

          // Use new research area names with fallback
          researchAreas: session.research_area_names || [],
          focusAreas: session.focus_areas,

          // Use new preferred slot summary with fallback
          preferredSlots: session.preferred_slot_summary || (session.preferred_slots || []).map(slot => ({
            date: slot.date,
            time: slot.time,
            priority: slot.priority
          })),

          // Summary information
          researchAreaCount: session.research_area_count || 0,
          targetLabCount: session.target_lab_count || 0,
          preferredSlotCount: session.preferred_slot_count || 0,
          primaryResearchArea: session.primary_research_area || '',
          primaryLab: session.primary_lab || '',

          matchedInterviewer: session.interviewer ? {
            name: `${session.interviewer.first_name || ''} ${session.interviewer.last_name || ''}`.trim() || session.interviewer.email,
            position: session.interviewer.position,
            university: session.interviewer.university,
            department: session.interviewer.department,
            email: session.interviewer.email,
            matchType: session.match_type,
            averageRating: session.interviewer.average_rating || 0,
            reviewCount: session.interviewer.review_count || 0,
            recentReviews: session.interviewer.recent_reviews || [],
            education: session.interviewer.education || [],
            researchAreas: session.interviewer.research_areas || [],
            lab: session.interviewer.lab_name || session.interviewer.lab || '',
            bio: session.interviewer.bio || '',
            profileImage: session.interviewer.profile_image || null
          } : (session.status === 'confirmed' ? {
            // Dummy data for testing when no interviewer data is available
            name: 'Dr. Sarah Johnson',
            position: 'Assistant Professor',
            university: 'Stanford University',
            department: 'Computer Science',
            email: 'sarah.johnson@stanford.edu',
            matchType: 'exact-lab',
            averageRating: 4.8,
            reviewCount: 24,
            recentReviews: [
              {
                rating: 5,
                comment: 'Excellent interviewer! Very knowledgeable about machine learning and provided great feedback on my research approach.'
              },
              {
                rating: 5,
                comment: 'Dr. Johnson was incredibly helpful in discussing my PhD application strategy. Highly recommend!'
              },
              {
                rating: 4,
                comment: 'Great insights into the research process. The mock interview was very realistic and helpful.'
              },
              {
                rating: 5,
                comment: 'Professional and encouraging. Gave me confidence for my actual interviews.'
              }
            ],
            education: [
              'PhD in Computer Science - MIT',
              'MS in Computer Science - UC Berkeley',
              'BS in Mathematics - Harvard University'
            ],
            researchAreas: [
              'Machine Learning',
              'Natural Language Processing',
              'Computer Vision',
              'Deep Learning',
              'AI Ethics'
            ],
            lab: 'AI Research Lab',
            bio: 'Dr. Johnson specializes in machine learning and AI research with focus on natural language processing.',
            profileImage: null
          } : null),
          confirmedSlot: session.confirmed_date && session.confirmed_time ? {
            date: session.confirmed_date,
            time: session.confirmed_time,
            zoomLink: session.zoom_link
          } : null,
          price: parseFloat(session.total_price || 0),

          // Completed session additional data
          ...(session.status === 'completed' && {
            completedAt: session.completed_at,
            interviewerFeedback: session.interviewer_feedback ? {
              overallPerformance: session.interviewer_feedback.overall_performance,
              performanceScore: session.interviewer_feedback.performance_score,
              strengths: session.interviewer_feedback.strengths || [],
              areasForImprovement: session.interviewer_feedback.areas_for_improvement || [],
              detailedFeedback: session.interviewer_feedback.detailed_feedback,
              recommendations: session.interviewer_feedback.recommendations || []
            } : null,
            sessionSummary: session.session_summary ? {
              durationMinutes: session.session_summary.duration_minutes,
              topicsCovered: session.session_summary.topics_covered || [],
              questionsAsked: session.session_summary.questions_asked,
              interviewerRatingFromStudent: session.session_summary.interviewer_rating_from_student,
              wouldRecommendInterviewer: session.session_summary.would_recommend_interviewer
            } : null,
            actionItems: session.action_items || []
          })
        }));

        // Add dummy session for testing interviewer UI
        const dummySession = {
          id: 'dummy-session-1',
          type: 'mock-interview',
          typeDisplay: 'Mock Interview',
          status: 'confirmed',
          createdAt: new Date().toISOString(),
          targetLabs: [
            { name: 'AI Research Lab', university: 'Stanford University', field: 'Computer Science', priority: 1 },
            { name: 'ML Systems Lab', university: 'MIT', field: 'Computer Science', priority: 2 }
          ],
          researchAreas: ['Machine Learning', 'Natural Language Processing', 'Computer Vision'],
          focusAreas: ['Deep Learning', 'Neural Networks'],
          preferredSlots: ['2024-11-15 at 2:00 PM', '2024-11-16 at 10:00 AM'],
          researchAreaCount: 3,
          targetLabCount: 2,
          preferredSlotCount: 2,
          primaryResearchArea: 'Machine Learning',
          primaryLab: 'AI Research Lab',
          matchedInterviewer: {
            name: 'Dr. Sarah Johnson',
            position: 'Assistant Professor',
            university: 'Stanford University',
            department: 'Computer Science',
            email: 'sarah.johnson@stanford.edu',
            matchType: 'exact-lab',
            averageRating: 4.8,
            reviewCount: 24,
            recentReviews: [
              {
                rating: 5,
                comment: 'Excellent interviewer! Very knowledgeable about machine learning and provided great feedback on my research approach.'
              },
              {
                rating: 5,
                comment: 'Dr. Johnson was incredibly helpful in discussing my PhD application strategy. Highly recommend!'
              },
              {
                rating: 4,
                comment: 'Great insights into the research process. The mock interview was very realistic and helpful.'
              },
              {
                rating: 5,
                comment: 'Professional and encouraging. Gave me confidence for my actual interviews.'
              }
            ],
            education: [
              'PhD in Computer Science - MIT',
              'MS in Computer Science - UC Berkeley',
              'BS in Mathematics - Harvard University'
            ],
            researchAreas: [
              'Machine Learning',
              'Natural Language Processing',
              'Computer Vision',
              'Deep Learning',
              'AI Ethics'
            ],
            lab: 'AI Research Lab',
            bio: 'Dr. Johnson specializes in machine learning and AI research with focus on natural language processing.',
            profileImage: null
          },
          confirmedSlot: {
            date: '2024-11-15',
            time: '2:00 PM',
            zoomLink: 'https://stanford.zoom.us/j/1234567890?pwd=abcdef'
          },
          price: 150.00
        };

        // Add multiple dummy sessions for testing different statuses
        const dummySessions = [
          dummySession, // confirmed session (already defined above)

          // Pending session
          {
            id: 'dummy-session-2',
            type: 'mock-interview',
            typeDisplay: 'Mock Interview',
            status: 'pending',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            targetLabs: [
              { name: 'Robotics Lab', university: 'CMU', field: 'Robotics', priority: 1 },
              { name: 'AI Lab', university: 'UC Berkeley', field: 'Computer Science', priority: 2 }
            ],
            researchAreas: ['Robotics', 'Computer Vision', 'Machine Learning'],
            focusAreas: ['Autonomous Systems', 'Robot Perception'],
            preferredSlots: ['2024-11-20 at 3:00 PM', '2024-11-21 at 1:00 PM', '2024-11-22 at 10:00 AM'],
            researchAreaCount: 3,
            targetLabCount: 2,
            preferredSlotCount: 3,
            primaryResearchArea: 'Robotics',
            primaryLab: 'Robotics Lab',
            matchedInterviewer: null,
            confirmedSlot: null,
            price: 120.00
          },

          // Matching session
          {
            id: 'dummy-session-3',
            type: 'mock-interview',
            typeDisplay: 'Mock Interview',
            status: 'matching',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            targetLabs: [
              { name: 'Quantum Computing Lab', university: 'MIT', field: 'Physics', priority: 1 },
              { name: 'Theoretical CS Lab', university: 'Harvard', field: 'Computer Science', priority: 2 }
            ],
            researchAreas: ['Quantum Computing', 'Theoretical Computer Science', 'Cryptography'],
            focusAreas: ['Quantum Algorithms', 'Quantum Error Correction'],
            preferredSlots: ['2024-11-18 at 2:00 PM', '2024-11-19 at 4:00 PM'],
            researchAreaCount: 3,
            targetLabCount: 2,
            preferredSlotCount: 2,
            primaryResearchArea: 'Quantum Computing',
            primaryLab: 'Quantum Computing Lab',
            matchedInterviewer: null,
            confirmedSlot: null,
            price: 180.00
          },

          // Another confirmed session with different interviewer
          {
            id: 'dummy-session-4',
            type: 'mock-interview',
            typeDisplay: 'Mock Interview',
            status: 'confirmed',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            targetLabs: [
              { name: 'Bioengineering Lab', university: 'Stanford', field: 'Bioengineering', priority: 1 }
            ],
            researchAreas: ['Bioengineering', 'Synthetic Biology', 'Biomaterials'],
            focusAreas: ['Tissue Engineering', 'Gene Therapy'],
            preferredSlots: ['2024-11-25 at 11:00 AM'],
            researchAreaCount: 3,
            targetLabCount: 1,
            preferredSlotCount: 1,
            primaryResearchArea: 'Bioengineering',
            primaryLab: 'Bioengineering Lab',
            matchedInterviewer: {
              name: 'Dr. Michael Chen',
              position: 'Associate Professor',
              university: 'Stanford University',
              department: 'Bioengineering',
              email: 'michael.chen@stanford.edu',
              matchType: 'related-field',
              averageRating: 4.6,
              reviewCount: 18,
              recentReviews: [
                {
                  rating: 5,
                  comment: 'Dr. Chen provided excellent insights into bioengineering PhD programs. Very helpful!'
                },
                {
                  rating: 4,
                  comment: 'Good interview practice. He asked challenging questions that prepared me well.'
                },
                {
                  rating: 5,
                  comment: 'Knowledgeable about the field and gave great advice on research directions.'
                }
              ],
              education: [
                'PhD in Bioengineering - Caltech',
                'MS in Chemical Engineering - MIT'
              ],
              researchAreas: [
                'Bioengineering',
                'Synthetic Biology',
                'Biomaterials',
                'Tissue Engineering'
              ],
              lab: 'Bioengineering Lab',
              bio: 'Dr. Chen focuses on bioengineering applications in medicine and synthetic biology.',
              profileImage: null
            },
            confirmedSlot: {
              date: '2024-11-25',
              time: '11:00 AM',
              zoomLink: 'https://stanford.zoom.us/j/9876543210?pwd=xyz123'
            },
            price: 160.00
          },

          // Q&A Session - pending
          {
            id: 'dummy-session-5',
            type: 'qa-session',
            typeDisplay: 'Q&A Session',
            status: 'pending',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            targetLabs: [
              { name: 'Data Science Lab', university: 'NYU', field: 'Data Science', priority: 1 }
            ],
            researchAreas: ['Data Science', 'Machine Learning', 'Statistics'],
            focusAreas: ['Big Data Analytics', 'Predictive Modeling'],
            preferredSlots: ['2024-11-17 at 2:00 PM', '2024-11-18 at 3:00 PM'],
            researchAreaCount: 3,
            targetLabCount: 1,
            preferredSlotCount: 2,
            primaryResearchArea: 'Data Science',
            primaryLab: 'Data Science Lab',
            matchedInterviewer: null,
            confirmedSlot: null,
            price: 80.00
          },

          // Completed Mock Interview
          {
            id: 'dummy-session-6',
            type: 'mock-interview',
            typeDisplay: 'Mock Interview',
            status: 'completed',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
            targetLabs: [
              { name: 'HCI Lab', university: 'MIT', field: 'Computer Science', priority: 1 }
            ],
            researchAreas: ['Human-Computer Interaction', 'User Experience', 'Interface Design'],
            focusAreas: ['Accessibility', 'Mobile Interfaces'],
            preferredSlots: ['2024-10-25 at 3:00 PM'],
            researchAreaCount: 3,
            targetLabCount: 1,
            preferredSlotCount: 1,
            primaryResearchArea: 'Human-Computer Interaction',
            primaryLab: 'HCI Lab',
            matchedInterviewer: {
              name: 'Dr. Amanda Rodriguez',
              position: 'Professor',
              university: 'MIT',
              department: 'Computer Science',
              email: 'amanda.rodriguez@mit.edu',
              matchType: 'exact-lab',
              averageRating: 4.9,
              reviewCount: 32,
              recentReviews: [
                {
                  rating: 5,
                  comment: 'Outstanding interview experience! Dr. Rodriguez gave detailed feedback and helped me improve significantly.'
                },
                {
                  rating: 5,
                  comment: 'Best mock interview I ever had. Very professional and insightful.'
                },
                {
                  rating: 4,
                  comment: 'Great preparation for real interviews. Highly recommend!'
                }
              ],
              education: [
                'PhD in Computer Science - Carnegie Mellon',
                'MS in HCI - Georgia Tech'
              ],
              researchAreas: [
                'Human-Computer Interaction',
                'User Experience Design',
                'Accessibility',
                'Mobile Computing'
              ],
              lab: 'HCI Lab',
              bio: 'Dr. Rodriguez is a leading expert in HCI and accessibility research.',
              profileImage: null
            },
            confirmedSlot: {
              date: '2024-10-25',
              time: '3:00 PM',
              zoomLink: 'https://mit.zoom.us/j/5555555555?pwd=completed'
            },
            completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            price: 140.00,

            // Completed session additional data
            interviewerFeedback: {
              overallPerformance: 'excellent',
              performanceScore: 4.5,
              strengths: [
                'Clear communication skills',
                'Well-prepared research questions',
                'Strong technical knowledge in HCI'
              ],
              areasForImprovement: [
                'Could provide more specific examples of past projects',
                'Consider practicing presentation of research methodology'
              ],
              detailedFeedback: 'The student demonstrated excellent preparation and asked thoughtful questions about the HCI research program. Communication was clear and professional throughout the session. The discussion about accessibility research showed deep understanding of the field.',
              recommendations: [
                'Apply to top HCI programs at MIT, Stanford, and CMU',
                'Consider reaching out to Dr. Smith for accessibility research',
                'Highlight your UX design background in applications'
              ]
            },
            sessionSummary: {
              durationMinutes: 50,
              topicsCovered: [
                'HCI research background discussion',
                'PhD application strategy for HCI programs',
                'Mock interview questions',
                'Accessibility research opportunities'
              ],
              questionsAsked: 15,
              interviewerRatingFromStudent: 5,
              wouldRecommendInterviewer: true
            },
            actionItems: [
              'Revise personal statement to emphasize accessibility focus',
              'Practice presenting research in 5-minute format',
              'Research Dr. Rodriguez\'s recent publications on mobile accessibility',
              'Schedule follow-up session for application review'
            ]
          },

          // Completed Q&A Session
          {
            id: 'dummy-session-7',
            type: 'qa-session',
            typeDisplay: 'Q&A Session',
            status: 'completed',
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
            targetLabs: [
              { name: 'Neuroscience Lab', university: 'Harvard', field: 'Neuroscience', priority: 1 }
            ],
            researchAreas: ['Neuroscience', 'Cognitive Science', 'Brain Imaging'],
            focusAreas: ['fMRI', 'Neural Networks'],
            preferredSlots: ['2024-10-20 at 1:00 PM'],
            researchAreaCount: 3,
            targetLabCount: 1,
            preferredSlotCount: 1,
            primaryResearchArea: 'Neuroscience',
            primaryLab: 'Neuroscience Lab',
            matchedInterviewer: {
              name: 'Dr. James Park',
              position: 'Associate Professor',
              university: 'Harvard University',
              department: 'Psychology',
              email: 'james.park@harvard.edu',
              matchType: 'related-field',
              averageRating: 4.7,
              reviewCount: 15,
              recentReviews: [
                {
                  rating: 5,
                  comment: 'Dr. Park answered all my questions about neuroscience PhD programs thoroughly.'
                },
                {
                  rating: 4,
                  comment: 'Very knowledgeable and helpful session.'
                }
              ],
              education: [
                'PhD in Neuroscience - Harvard',
                'BS in Psychology - Yale'
              ],
              researchAreas: [
                'Neuroscience',
                'Cognitive Psychology',
                'Brain Imaging',
                'Memory Research'
              ],
              lab: 'Neuroscience Lab',
              bio: 'Dr. Park studies memory and cognition using advanced brain imaging techniques.',
              profileImage: null
            },
            confirmedSlot: {
              date: '2024-10-20',
              time: '1:00 PM',
              zoomLink: 'https://harvard.zoom.us/j/7777777777?pwd=neurosci'
            },
            completedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
            price: 90.00,

            // Completed Q&A session additional data
            interviewerFeedback: {
              overallPerformance: 'good',
              performanceScore: 4.2,
              strengths: [
                'Strong interest in neuroscience research',
                'Good analytical thinking',
                'Asked relevant questions about fMRI techniques'
              ],
              areasForImprovement: [
                'Could benefit from more background reading in cognitive neuroscience',
                'Practice explaining complex concepts more simply'
              ],
              detailedFeedback: 'The student showed genuine interest in neuroscience research and asked good questions about our lab\'s fMRI studies. However, some foundational knowledge gaps were evident.',
              recommendations: [
                'Take a cognitive neuroscience course before applying',
                'Consider research assistant positions to gain hands-on experience',
                'Read recent papers in Nature Neuroscience'
              ]
            },
            sessionSummary: {
              durationMinutes: 35,
              topicsCovered: [
                'Neuroscience research overview',
                'Graduate program requirements',
                'fMRI methodology discussion',
                'Lab culture and expectations'
              ],
              questionsAsked: 8,
              interviewerRatingFromStudent: 4,
              wouldRecommendInterviewer: true
            },
            actionItems: [
              'Complete online neuroscience course on Coursera',
              'Read assigned papers on memory research',
              'Contact graduate coordinator for program requirements',
              'Consider scheduling follow-up session after coursework'
            ]
          },

          // Cancelled session
          {
            id: 'dummy-session-8',
            type: 'mock-interview',
            typeDisplay: 'Mock Interview',
            status: 'cancelled',
            createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
            targetLabs: [
              { name: 'Materials Science Lab', university: 'UC Berkeley', field: 'Materials Science', priority: 1 }
            ],
            researchAreas: ['Materials Science', 'Nanotechnology', 'Energy Storage'],
            focusAreas: ['Battery Technology', 'Solar Cells'],
            preferredSlots: ['2024-11-01 at 4:00 PM'],
            researchAreaCount: 3,
            targetLabCount: 1,
            preferredSlotCount: 1,
            primaryResearchArea: 'Materials Science',
            primaryLab: 'Materials Science Lab',
            matchedInterviewer: null,
            confirmedSlot: null,
            cancelledAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
            cancelReason: 'Interviewer unavailable due to conference travel',
            price: 130.00
          }
        ];

        setSessions([...dummySessions, ...transformedSessions]);
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
            <div style={{
              width: '40px',
              height: '40px',
              border: `4px solid ${colors.border}`,
              borderTop: `4px solid ${colors.primary}`,
              borderRadius: '50%',
              margin: `0 auto ${spacing[4]}px auto`,
              animation: 'spin 1s linear infinite'
            }} />
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
                expandedInterviewers={expandedInterviewers}
                setExpandedInterviewers={setExpandedInterviewers}
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
const SessionCard = ({ session, getStatusInfo, getMatchTypeInfo, isMobile, expandedInterviewers, setExpandedInterviewers }) => {
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
              {session.typeDisplay}
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

      {/* Research Areas */}
      {session.researchAreas && session.researchAreas.length > 0 && (
        <div style={{
          marginBottom: spacing[3],
          padding: spacing[4],
          backgroundColor: colors.backgroundSecondary,
          borderRadius: '8px'
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[3]
          }}>
            Research Areas
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: spacing[2]
          }}>
            {Array.isArray(session.researchAreas) ? (
              session.researchAreas.map((area, idx) => {
                const areaText = typeof area === 'string' ? area : area.name || 'Research Area';
                const isPrimary = session.primaryResearchArea && areaText === session.primaryResearchArea;

                return (
                  <div key={idx} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: spacing[1],
                    padding: `${spacing[1]} ${spacing[3]}`,
                    backgroundColor: isPrimary ? colors.primary + '20' : colors.background,
                    border: `1px solid ${isPrimary ? colors.primary + '40' : colors.border}`,
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: isPrimary ? '600' : '500',
                    color: isPrimary ? colors.primary : colors.textSecondary
                  }}>
                    {isPrimary && (
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: colors.primary
                      }} />
                    )}
                    {areaText}
                  </div>
                );
              })
            ) : typeof session.researchAreas === 'string' ? (
              <div style={{
                padding: `${spacing[1]} ${spacing[3]}`,
                backgroundColor: colors.background,
                border: `1px solid ${colors.border}`,
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '500',
                color: colors.textSecondary
              }}>
                {session.researchAreas}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Target Labs */}
      {session.targetLabs && session.targetLabs.length > 0 && (
        <div style={{
          marginBottom: spacing[3],
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
            Target Labs {session.primaryLab && (
              <span style={{
                fontSize: '11px',
                fontWeight: '500',
                color: colors.textSecondary,
                marginLeft: spacing[2]
              }}>
                (Primary: {session.primaryLab})
              </span>
            )}
          </div>
          {Array.isArray(session.targetLabs) ? (
            session.targetLabs.map((lab, idx) => (
              <div key={idx} style={{
                fontSize: '13px',
                color: colors.textSecondary,
                marginBottom: spacing[1]
              }}>
                • {typeof lab === 'string' ? lab : `${lab.name || 'Unknown Lab'} - ${lab.university || 'Unknown University'}`}
              </div>
            ))
          ) : typeof session.targetLabs === 'string' ? (
            <div style={{
              fontSize: '13px',
              color: colors.textSecondary
            }}>
              {session.targetLabs}
            </div>
          ) : null}
        </div>
      )}

      {/* Matched Interviewer (if confirmed) */}
      {session.status === 'confirmed' && session.matchedInterviewer && (
        <div style={{
          marginBottom: spacing[4]
        }}>
          {/* Interviewer Header - Always Visible */}
          <div
            onClick={() => setExpandedInterviewers(prev => ({
              ...prev,
              [session.id]: !prev[session.id]
            }))}
            style={{
              padding: spacing[3],
              backgroundColor: `${colors.success}08`,
              borderRadius: '8px',
              border: `1px solid ${colors.success}40`,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: expandedInterviewers[session.id] ? spacing[2] : 0
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              {/* Left side - Basic interviewer info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[3],
                flex: 1
              }}>
                {/* Profile Image */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: colors.primary + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {session.matchedInterviewer.profileImage ? (
                    <img
                      src={session.matchedInterviewer.profileImage}
                      alt={session.matchedInterviewer.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <User size={18} color={colors.primary} />
                  )}
                </div>

                {/* Basic Info */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.textPrimary,
                    marginBottom: '2px'
                  }}>
                    {session.matchedInterviewer.name}
                  </div>

                  {/* Rating */}
                  {session.matchedInterviewer.averageRating > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[1],
                      marginBottom: '2px'
                    }}>
                      <Star size={12} color={colors.warning} fill={colors.warning} />
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: colors.textPrimary
                      }}>
                        {session.matchedInterviewer.averageRating.toFixed(1)}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        color: colors.textSecondary
                      }}>
                        ({session.matchedInterviewer.reviewCount} reviews)
                      </span>
                    </div>
                  )}

                  <div style={{
                    fontSize: '12px',
                    color: colors.textSecondary
                  }}>
                    {session.matchedInterviewer.position} • {session.matchedInterviewer.university}
                  </div>
                </div>
              </div>

              {/* Right side - Match type and expand button */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2]
              }}>
                <div style={{
                  fontSize: '10px',
                  padding: `${spacing[1]} ${spacing[2]}`,
                  backgroundColor: getMatchTypeInfo(session.matchedInterviewer.matchType).color + '20',
                  color: getMatchTypeInfo(session.matchedInterviewer.matchType).color,
                  borderRadius: '12px',
                  fontWeight: '600'
                }}>
                  {getMatchTypeInfo(session.matchedInterviewer.matchType).label}
                </div>

                {expandedInterviewers[session.id] ? (
                  <ChevronUp size={16} color={colors.textTertiary} />
                ) : (
                  <ChevronDown size={16} color={colors.textTertiary} />
                )}
              </div>
            </div>
          </div>

          {/* Expanded Interviewer Details */}
          {expandedInterviewers[session.id] && (
            <div style={{
              padding: spacing[4],
              backgroundColor: colors.background,
              borderRadius: '8px',
              border: `1px solid ${colors.border}`
            }}>
              {/* Research Areas */}
              {session.matchedInterviewer.researchAreas && session.matchedInterviewer.researchAreas.length > 0 && (
                <div style={{ marginBottom: spacing[4] }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[1],
                    marginBottom: spacing[2]
                  }}>
                    <BookOpen size={14} color={colors.textTertiary} />
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: colors.textPrimary
                    }}>
                      Research Areas
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: spacing[1]
                  }}>
                    {session.matchedInterviewer.researchAreas.slice(0, 5).map((area, index) => (
                      <span
                        key={index}
                        style={{
                          fontSize: '11px',
                          padding: `${spacing[1]} ${spacing[2]}`,
                          backgroundColor: colors.primary + '15',
                          color: colors.primary,
                          borderRadius: '12px',
                          fontWeight: '500'
                        }}
                      >
                        {typeof area === 'string' ? area : area.name}
                      </span>
                    ))}
                    {session.matchedInterviewer.researchAreas.length > 5 && (
                      <span style={{
                        fontSize: '11px',
                        color: colors.textTertiary,
                        padding: `${spacing[1]} ${spacing[2]}`
                      }}>
                        +{session.matchedInterviewer.researchAreas.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Education */}
              {session.matchedInterviewer.education && session.matchedInterviewer.education.length > 0 && (
                <div style={{ marginBottom: spacing[4] }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[1],
                    marginBottom: spacing[2]
                  }}>
                    <GraduationCap size={14} color={colors.textTertiary} />
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: colors.textPrimary
                    }}>
                      Education
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                    {session.matchedInterviewer.education.slice(0, 3).map((edu, index) => (
                      <div key={index} style={{ marginBottom: spacing[1] }}>
                        {typeof edu === 'string' ? edu : `${edu.degree} in ${edu.field} - ${edu.institution}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Reviews */}
              {session.matchedInterviewer.recentReviews && session.matchedInterviewer.recentReviews.length > 0 && (
                <div style={{ marginBottom: spacing[4] }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[1],
                    marginBottom: spacing[2]
                  }}>
                    <MessageSquare size={14} color={colors.textTertiary} />
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: colors.textPrimary
                    }}>
                      Recent Reviews
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                    {session.matchedInterviewer.recentReviews.slice(0, 4).map((review, index) => (
                      <div
                        key={index}
                        style={{
                          padding: spacing[3],
                          backgroundColor: `${colors.primary}05`,
                          borderRadius: '8px',
                          borderLeft: `3px solid ${colors.primary}30`
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: spacing[1],
                          marginBottom: spacing[2]
                        }}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              color={i < (review.rating || 5) ? colors.warning : colors.border}
                              fill={i < (review.rating || 5) ? colors.warning : 'none'}
                            />
                          ))}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: colors.textSecondary,
                          lineHeight: '1.5'
                        }}>
                          "{typeof review === 'string' ? review : review.comment || review.text || 'Great interviewer!'}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                padding: spacing[3],
                backgroundColor: `${colors.success}08`,
                borderRadius: '8px',
                fontSize: '13px'
              }}>
                <Mail size={14} color={colors.textTertiary} />
                <span style={{ color: colors.textSecondary }}>{session.matchedInterviewer.email}</span>
              </div>
            </div>
          )}
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

          {(session.meetingLink || session.confirmedSlot?.zoomLink) && (
            <a
              href={session.meetingLink || session.confirmedSlot?.zoomLink}
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
              Join Zoom Meeting
            </a>
          )}
        </div>
      )}

      {/* Preferred Slots (if not confirmed) */}
      {session.status !== 'confirmed' && session.preferredSlots && (
        <div style={{
          marginBottom: spacing[3],
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
            {session.preferredSlotCount && (
              <span style={{
                fontSize: '11px',
                fontWeight: '500',
                color: colors.textSecondary,
                marginLeft: spacing[2]
              }}>
                ({session.preferredSlotCount} slots)
              </span>
            )}
          </div>
          {typeof session.preferredSlots === 'string' ? (
            <div style={{
              fontSize: '13px',
              color: colors.textSecondary,
              lineHeight: 1.5
            }}>
              {session.preferredSlots}
            </div>
          ) : Array.isArray(session.preferredSlots) ? (
            session.preferredSlots.map((slot, idx) => (
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
                  #{slot.priority || idx + 1}
                </span>
                {typeof slot === 'string' ? slot : slot.date && slot.time ? `${formatDate(slot.date)} at ${formatTime(slot.time)}` : 'Time slot details'}
              </div>
            ))
          ) : null}
        </div>
      )}

      {/* Focus Areas */}
      {session.focusAreas && (
        <div style={{
          marginBottom: spacing[3],
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
