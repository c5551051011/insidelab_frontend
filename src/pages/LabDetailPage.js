import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Star,
  Users,
  Building2,
  GraduationCap,
  Globe,
  ArrowLeft,
  Bookmark,
  Info,
  CheckCircle,
  XCircle,
  MessageCircle,
  ThumbsUp,
  Clock
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { colors, spacing } from '../theme';
import { SearchService } from '../services/searchService';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useTranslation } from '../i18n';
import { trackLabView, trackPageView, AnalyticsEvents, trackEvent } from '../lib/analytics/trackEvent';

// Helper function to add mock publications based on lab/professor name and research areas
const addMockPublications = (labData) => {
  if (!labData) return labData;

  // Generate publications based on lab/professor info
  const professorName = labData.professorName || labData.name;
  const researchAreas = labData.researchAreas || [];

  // Sample publication templates based on common research areas
  const publicationTemplates = {
    'Machine Learning': [
      {
        title: 'Deep Learning Approaches for Complex Pattern Recognition',
        journal: 'Nature Machine Intelligence',
        year: 2024,
        volume: '5',
        issue: '3',
        pages: '234-251',
        citations: 127,
        impact_factor: 15.508,
        type: 'Journal Article',
        abstract: 'We present novel deep learning architectures for complex pattern recognition tasks, demonstrating significant improvements over existing methods across multiple benchmarks.',
        keywords: ['Deep Learning', 'Pattern Recognition', 'Neural Networks', 'Computer Vision'],
        doi: '10.1038/s42256-024-00000-0',
        url: 'https://doi.org/10.1038/s42256-024-00000-0',
        pdf_url: 'https://arxiv.org/pdf/2024.00000.pdf',
        code_url: 'https://github.com/lab/pattern-recognition',
        dataset_url: 'https://dataset.example.com/pattern-data'
      },
      {
        title: 'Federated Learning in Healthcare: Privacy and Performance',
        journal: 'Journal of Medical Internet Research',
        year: 2023,
        volume: '25',
        issue: '8',
        pages: 'e45123',
        citations: 89,
        impact_factor: 7.076,
        type: 'Journal Article',
        abstract: 'A comprehensive study on federated learning applications in healthcare, addressing privacy concerns while maintaining model performance.',
        keywords: ['Federated Learning', 'Healthcare', 'Privacy', 'Medical AI'],
        doi: '10.2196/45000',
        url: 'https://doi.org/10.2196/45000',
        pdf_url: 'https://www.jmir.org/2023/8/e45123/PDF'
      }
    ],
    'Computer Vision': [
      {
        title: 'Advanced Object Detection in Real-time Video Streams',
        journal: 'IEEE Transactions on Pattern Analysis and Machine Intelligence',
        year: 2024,
        volume: '46',
        issue: '7',
        pages: '3421-3438',
        citations: 156,
        impact_factor: 24.314,
        type: 'Journal Article',
        abstract: 'Novel real-time object detection algorithms optimized for video stream processing with enhanced accuracy and reduced computational overhead.',
        keywords: ['Object Detection', 'Real-time Processing', 'Video Analysis', 'Computer Vision'],
        doi: '10.1109/TPAMI.2024.00000',
        url: 'https://doi.org/10.1109/TPAMI.2024.00000',
        pdf_url: 'https://arxiv.org/pdf/2024.cv001.pdf',
        code_url: 'https://github.com/lab/realtime-detection'
      },
      {
        title: 'Multi-modal Scene Understanding with Transformer Networks',
        journal: 'Computer Vision and Image Understanding',
        year: 2023,
        volume: '231',
        pages: '103695',
        citations: 78,
        impact_factor: 4.886,
        type: 'Journal Article',
        abstract: 'A comprehensive approach to scene understanding using multi-modal transformer architectures for enhanced visual reasoning.',
        keywords: ['Scene Understanding', 'Transformers', 'Multi-modal', 'Visual Reasoning'],
        doi: '10.1016/j.cviu.2023.00000',
        url: 'https://doi.org/10.1016/j.cviu.2023.00000'
      }
    ],
    'Artificial Intelligence': [
      {
        title: 'Explainable AI for Critical Decision Making Systems',
        journal: 'Artificial Intelligence',
        year: 2024,
        volume: '328',
        pages: '104078',
        citations: 203,
        impact_factor: 14.050,
        type: 'Journal Article',
        abstract: 'Developing interpretable AI systems for high-stakes decision making with focus on transparency and accountability.',
        keywords: ['Explainable AI', 'Decision Making', 'Interpretability', 'AI Ethics'],
        doi: '10.1016/j.artint.2024.00000',
        url: 'https://doi.org/10.1016/j.artint.2024.00000',
        pdf_url: 'https://arxiv.org/pdf/2024.ai001.pdf'
      },
      {
        title: 'Reinforcement Learning in Complex Multi-Agent Environments',
        journal: 'Journal of Artificial Intelligence Research',
        year: 2023,
        volume: '78',
        pages: '445-482',
        citations: 134,
        impact_factor: 4.757,
        type: 'Journal Article',
        abstract: 'Advanced reinforcement learning techniques for complex multi-agent systems with emergent behaviors and coordination strategies.',
        keywords: ['Reinforcement Learning', 'Multi-Agent Systems', 'Coordination', 'Emergent Behavior'],
        doi: '10.1613/jair.1.00000',
        url: 'https://doi.org/10.1613/jair.1.00000',
        code_url: 'https://github.com/lab/multi-agent-rl'
      }
    ],
    'Robotics': [
      {
        title: 'Autonomous Navigation in Dynamic Environments',
        journal: 'IEEE Robotics and Automation Letters',
        year: 2024,
        volume: '9',
        issue: '4',
        pages: '3567-3574',
        citations: 92,
        impact_factor: 5.282,
        type: 'Journal Article',
        abstract: 'Novel algorithms for autonomous robot navigation in highly dynamic environments with real-time obstacle avoidance.',
        keywords: ['Autonomous Navigation', 'Dynamic Environments', 'Robotics', 'Path Planning'],
        doi: '10.1109/LRA.2024.00000',
        url: 'https://doi.org/10.1109/LRA.2024.00000',
        pdf_url: 'https://arxiv.org/pdf/2024.robotics001.pdf',
        video_url: 'https://youtube.com/watch?v=demo123'
      },
      {
        title: 'Human-Robot Collaboration in Manufacturing',
        journal: 'International Journal of Robotics Research',
        year: 2023,
        volume: '42',
        issue: '12',
        pages: '823-841',
        citations: 167,
        impact_factor: 6.314,
        type: 'Journal Article',
        abstract: 'Investigating safe and efficient human-robot collaboration strategies in industrial manufacturing settings.',
        keywords: ['Human-Robot Interaction', 'Manufacturing', 'Collaboration', 'Industrial Robotics'],
        doi: '10.1177/00000000000000',
        url: 'https://doi.org/10.1177/00000000000000'
      }
    ],
    'Data Science': [
      {
        title: 'Large-Scale Data Processing with Distributed Computing',
        journal: 'IEEE Transactions on Big Data',
        year: 2024,
        volume: '10',
        issue: '2',
        pages: '156-171',
        citations: 145,
        impact_factor: 7.901,
        type: 'Journal Article',
        abstract: 'Scalable algorithms and architectures for processing massive datasets using distributed computing frameworks.',
        keywords: ['Big Data', 'Distributed Computing', 'Scalability', 'Data Processing'],
        doi: '10.1109/TBDATA.2024.00000',
        url: 'https://doi.org/10.1109/TBDATA.2024.00000',
        code_url: 'https://github.com/lab/distributed-processing'
      },
      {
        title: 'Predictive Analytics in Complex Systems',
        journal: 'Data Mining and Knowledge Discovery',
        year: 2023,
        volume: '37',
        issue: '8',
        pages: '2134-2158',
        citations: 98,
        impact_factor: 3.306,
        type: 'Journal Article',
        abstract: 'Advanced predictive modeling techniques for complex systems with applications in various domains.',
        keywords: ['Predictive Analytics', 'Complex Systems', 'Data Mining', 'Machine Learning'],
        doi: '10.1007/s10618-023-00000-0',
        url: 'https://doi.org/10.1007/s10618-023-00000-0',
        dataset_url: 'https://data.example.com/complex-systems'
      }
    ]
  };

  // Default publications if no specific research areas match
  const defaultPublications = [
    {
      title: 'Novel Computational Methods for Scientific Discovery',
      journal: 'Science',
      year: 2024,
      volume: '384',
      issue: '6692',
      pages: '245-251',
      citations: 342,
      impact_factor: 63.714,
      type: 'Journal Article',
      abstract: 'We introduce novel computational methodologies that accelerate scientific discovery across multiple domains.',
      keywords: ['Computational Methods', 'Scientific Discovery', 'Interdisciplinary Research'],
      doi: '10.1126/science.00000',
      url: 'https://doi.org/10.1126/science.00000',
      pdf_url: 'https://science.sciencemag.org/content/384/6692/245.full.pdf'
    },
    {
      title: 'Interdisciplinary Approaches to Complex Problem Solving',
      journal: 'Proceedings of the National Academy of Sciences',
      year: 2023,
      volume: '120',
      issue: '45',
      pages: 'e2308456120',
      citations: 198,
      impact_factor: 12.779,
      type: 'Journal Article',
      abstract: 'A comprehensive framework for interdisciplinary collaboration in solving complex scientific and societal challenges.',
      keywords: ['Interdisciplinary Research', 'Problem Solving', 'Collaboration'],
      doi: '10.1073/pnas.00000',
      url: 'https://doi.org/10.1073/pnas.00000'
    },
    {
      title: 'Advancing Research Through Innovative Methodologies',
      journal: 'Annual Review of Computer Science',
      year: 2023,
      volume: '7',
      pages: '123-145',
      citations: 156,
      impact_factor: 8.234,
      type: 'Review Article',
      abstract: 'A review of cutting-edge research methodologies transforming computational science and their broader implications.',
      keywords: ['Research Methodology', 'Innovation', 'Computer Science'],
      doi: '10.1146/annurev-cs-00000-00000',
      url: 'https://doi.org/10.1146/annurev-cs-00000-00000'
    }
  ];

  // Select publications based on research areas
  let selectedPublications = [];

  for (const area of researchAreas) {
    if (publicationTemplates[area]) {
      selectedPublications = selectedPublications.concat(publicationTemplates[area]);
    }
  }

  // If no specific matches, use default publications
  if (selectedPublications.length === 0) {
    selectedPublications = defaultPublications;
  }

  // Add author names and additional fields, limit to 6 publications
  const publications = selectedPublications.slice(0, 6).map((pub, index) => ({
    ...pub,
    id: `pub_${index}`,
    authors: generateAuthors(professorName),
    primaryVenueTier: getRandomVenueTier(),
    isAwardPaper: Math.random() < 0.15, // 15% chance of award paper
    githubStars: Math.random() < 0.3 ? Math.floor(Math.random() * 500) + 10 : 0, // 30% chance of having GitHub stars
    arxivId: Math.random() < 0.5 ? `2024.${String(Math.floor(Math.random() * 9999)).padStart(5, '0')}` : null,
    isOpenAccess: Math.random() < 0.8, // 80% chance of open access
    additionalNotes: Math.random() < 0.2 ? getRandomNote() : null // 20% chance of having notes
  }));

  // Add publication stats
  const totalCitations = publications.reduce((sum, pub) => sum + (pub.citations || 0), 0);
  const thisYearPubs = publications.filter(pub => pub.year >= new Date().getFullYear() - 1).length;
  const avgCitations = publications.length > 0 ? (totalCitations / publications.length) : 0;
  const hIndex = calculateHIndex(publications);

  return {
    ...labData,
    publications,
    publicationStats: {
      totalPublications: publications.length,
      totalCitations,
      thisYearPublications: thisYearPubs,
      averageCitationsPerPaper: avgCitations,
      hIndex,
      openAccessRate: Math.round((publications.filter(p => p.isOpenAccess).length / publications.length) * 100)
    },
    yearlyStats: generateYearlyStats()
  };
};

// Helper function to get random venue tier
const getRandomVenueTier = () => {
  const tiers = ['Top', 'High', 'Medium', 'General'];
  const weights = [0.2, 0.3, 0.35, 0.15]; // 20% top, 30% high, 35% medium, 15% general
  const rand = Math.random();
  let cumulative = 0;

  for (let i = 0; i < tiers.length; i++) {
    cumulative += weights[i];
    if (rand <= cumulative) {
      return tiers[i];
    }
  }
  return 'Medium';
};

// Helper function to calculate H-index
const calculateHIndex = (publications) => {
  if (!publications || publications.length === 0) return 0;

  // Sort publications by citation count in descending order
  const sortedCitations = publications
    .map(pub => pub.citations || 0)
    .sort((a, b) => b - a);

  let hIndex = 0;
  for (let i = 0; i < sortedCitations.length; i++) {
    if (sortedCitations[i] >= i + 1) {
      hIndex = i + 1;
    } else {
      break;
    }
  }

  return hIndex;
};

// Helper function to generate yearly publication statistics
const generateYearlyStats = () => {
  const currentYear = new Date().getFullYear();
  const stats = [];

  for (let year = currentYear - 4; year <= currentYear; year++) {
    const publications = Math.floor(Math.random() * 8) + 1; // 1-8 publications per year
    const totalCitations = Math.floor(Math.random() * 200) + 20; // 20-220 citations per year

    stats.push({
      year,
      publications,
      citations: totalCitations,
      h_index: Math.floor(Math.random() * 10) + 1
    });
  }

  return stats;
};

// Helper function to get random additional notes
const getRandomNote = () => {
  const notes = [
    'Best paper award recipient',
    'Featured in Nature News & Views',
    'Highlighted in Science Magazine',
    'Oral presentation at top-tier conference',
    'Most downloaded paper of the month',
    'Editor\'s choice article',
    'Cover story feature',
    'Invited keynote presentation',
    'Featured in university press release',
    'Collaborative work with industry partners'
  ];

  return notes[Math.floor(Math.random() * notes.length)];
};

// Helper function to generate realistic author lists
const generateAuthors = (professorName) => {
  const authorPools = [
    'J. Smith', 'A. Johnson', 'M. Davis', 'S. Wilson', 'R. Brown', 'L. Miller',
    'K. Garcia', 'T. Rodriguez', 'C. Martinez', 'D. Anderson', 'P. Taylor', 'N. Thomas'
  ];

  const numAuthors = Math.floor(Math.random() * 4) + 2; // 2-5 authors
  const selectedAuthors = [];

  // Always include the professor as first or last author
  if (professorName) {
    const professorInitials = professorName.split(' ')
      .map(name => name.charAt(0).toUpperCase() + '.')
      .join(' ') + ' ' + professorName.split(' ').pop();
    selectedAuthors.push(professorInitials);
  }

  // Add random co-authors
  const shuffledPool = [...authorPools].sort(() => 0.5 - Math.random());
  for (let i = 0; i < numAuthors - 1 && i < shuffledPool.length; i++) {
    selectedAuthors.push(shuffledPool[i]);
  }

  return selectedAuthors;
};

const LabDetailPage = () => {
  const { id } = useParams();
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

        // Use lab ID directly from URL
        console.log('Loading lab with ID:', id);
        const labData = await SearchService.getLabById(id);

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
          const finalLabData = professorData || labData;
          setLab(addMockPublications(finalLabData));
        } else {
          // Data is already complete
          setLab(addMockPublications(labData));
        }
      } catch (err) {
        console.error('Error loading lab details:', err);
        setError(err.message || 'Failed to load lab details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadLabDetails();
    }
  }, [id]);

  // Track lab view when lab data is loaded
  useEffect(() => {
    if (lab && lab.id) {
      trackLabView(lab.id, {
        labName: lab.labName,
        professorName: lab.professorName,
        universityName: lab.universityName,
        univId: lab.universityId,
        from: location.state?.from || 'direct',
      });

      // Track page view
      trackPageView(`/lab/${id}`, {
        labId: lab.id,
        labName: lab.labName,
      });
    }
  }, [lab, id, location.state]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBookmarkToggle = () => {
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);

    // Track bookmark event
    trackEvent(
      newBookmarkState ? AnalyticsEvents.LAB_FAVORITE_ADDED : AnalyticsEvents.LAB_FAVORITE_REMOVED,
      {
        labId: lab?.id,
        labName: lab?.labName,
        professorName: lab?.professorName,
      }
    );

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

    // Track review write started
    trackEvent(AnalyticsEvents.REVIEW_WRITE_STARTED, {
      labId: lab.id || lab.labId,
      labName: lab.labName || lab.name,
      professorName: lab.professorName,
    });

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
          <MobileLayout lab={lab} onWebsiteClick={handleWebsiteClick} onWriteReview={handleWriteReview} />
        ) : (
          <DesktopLayout lab={lab} onWebsiteClick={handleWebsiteClick} onWriteReview={handleWriteReview} />
        )}
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
const DesktopLayout = ({ lab, onWebsiteClick, onWriteReview }) => {
  return (
    <div style={{
      display: 'flex',
      gap: spacing[6],
      alignItems: 'flex-start'
    }}>
      {/* Left Column */}
      <div style={{ flex: 2.5 }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[6]
        }}>
          <LabInformation lab={lab} onWebsiteClick={onWebsiteClick} />
          {lab.publications && lab.publications.length > 0 && (
            <PublicationsSection publications={lab.publications} lab={lab} />
          )}
        </div>
      </div>

      {/* Right Column */}
      <div style={{ flex: 1.5 }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[6]
        }}>
          <RatingBreakdown lab={lab} />
          <ReviewsSection lab={lab} onWriteReview={onWriteReview} />
          <RecruitmentStatus lab={lab} />
        </div>
      </div>
    </div>
  );
};

// Mobile Layout Component
const MobileLayout = ({ lab, onWebsiteClick, onWriteReview }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[6]
    }}>
      <LabInformation lab={lab} onWebsiteClick={onWebsiteClick} />
      {lab.publications && lab.publications.length > 0 && (
        <PublicationsSection publications={lab.publications} lab={lab} />
      )}
      <RatingBreakdown lab={lab} />
      <ReviewsSection lab={lab} onWriteReview={onWriteReview} />
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

// Rating Breakdown Component - Hexagon Radar Chart
const RatingBreakdown = ({ lab }) => {
  const { t } = useTranslation();
  const { width } = useBreakpoint();
  const isMobile = width < 768;

  // Use actual rating breakdown from API, or fallback to mock data
  const getRatingBreakdown = () => {
    if (lab.ratingBreakdown) {
      return lab.ratingBreakdown;
    }

    // Fallback to mock data if API doesn't provide rating breakdown
    const baseRating = lab.overallRating;
    return {
      [t('writeReview.categories.mentorshipQuality', 'Mentorship')]: Math.min(5, Math.max(1, baseRating + 0.2)),
      [t('writeReview.categories.researchEnvironment', 'Research')]: Math.min(5, Math.max(1, baseRating - 0.1)),
      [t('writeReview.categories.workLifeBalance', 'Work-Life')]: Math.min(5, Math.max(1, baseRating - 0.3)),
      [t('writeReview.categories.careerSupport', 'Career')]: Math.min(5, Math.max(1, baseRating + 0.1)),
      [t('writeReview.categories.fundingResources', 'Funding')]: baseRating,
      [t('writeReview.categories.collaborationCulture', 'Collaboration')]: Math.min(5, Math.max(1, baseRating + 0.2))
    };
  };

  const ratings = getRatingBreakdown();
  const categories = Object.keys(ratings);
  const values = Object.values(ratings);

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
        marginBottom: spacing[5]
      }}>
        Rating Breakdown
      </h3>

      <RadarChart
        categories={categories}
        values={values}
        maxValue={5}
        isMobile={isMobile}
      />
    </div>
  );
};

// Radar Chart Component
const RadarChart = ({ categories, values, maxValue = 5, isMobile = false }) => {
  const size = isMobile ? 280 : 320;
  const center = size / 2;
  const radius = (size / 2) - 80;
  const levels = 5;

  // Calculate polygon points
  const getPoint = (value, index, total) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const distance = (value / maxValue) * radius;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle)
    };
  };

  // Generate polygon points string for the data
  const dataPoints = values.map((value, index) => {
    const point = getPoint(value, index, values.length);
    return `${point.x},${point.y}`;
  }).join(' ');

  // Generate level circles
  const levelCircles = [];
  for (let i = 1; i <= levels; i++) {
    const levelRadius = (radius / levels) * i;
    levelCircles.push(
      <circle
        key={`level-${i}`}
        cx={center}
        cy={center}
        r={levelRadius}
        fill="none"
        stroke={colors.border}
        strokeWidth="1"
        opacity="0.3"
      />
    );
  }

  // Generate axis lines
  const axisLines = categories.map((_, index) => {
    const point = getPoint(maxValue, index, categories.length);
    return (
      <line
        key={`axis-${index}`}
        x1={center}
        y1={center}
        x2={point.x}
        y2={point.y}
        stroke={colors.border}
        strokeWidth="1"
        opacity="0.3"
      />
    );
  });

  // Generate labels
  const labels = categories.map((category, index) => {
    const point = getPoint(maxValue + 1.5, index, categories.length);

    // Adjust text anchor based on position
    let textAnchor = 'middle';
    if (point.x > center + 10) textAnchor = 'start';
    if (point.x < center - 10) textAnchor = 'end';

    return (
      <g key={`label-${index}`}>
        <text
          x={point.x}
          y={point.y}
          textAnchor={textAnchor}
          fontSize={isMobile ? '11px' : '12px'}
          fontWeight="600"
          fill={colors.textPrimary}
          fontFamily="Inter"
        >
          {category}
        </text>
        <text
          x={point.x}
          y={point.y + (isMobile ? 14 : 16)}
          textAnchor={textAnchor}
          fontSize={isMobile ? '12px' : '14px'}
          fontWeight="700"
          fill={colors.primary}
          fontFamily="Inter"
        >
          {values[index].toFixed(1)}
        </text>
      </g>
    );
  });

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        {/* Background grid */}
        {levelCircles}
        {axisLines}

        {/* Data polygon - background */}
        <polygon
          points={dataPoints}
          fill={colors.primary}
          fillOpacity="0.1"
          stroke="none"
        />

        {/* Data polygon - stroke */}
        <polygon
          points={dataPoints}
          fill="none"
          stroke={colors.primary}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {values.map((value, index) => {
          const point = getPoint(value, index, values.length);
          return (
            <circle
              key={`point-${index}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={colors.primary}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}

        {/* Labels */}
        {labels}
      </svg>
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

// Publications Section Component - Enhanced version
const PublicationsSection = ({ publications, lab }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedPubs = showAll ? publications : publications.slice(0, 3);

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

  // Calculate publication stats
  const stats = {
    totalCitations: publications.reduce((sum, pub) => sum + (pub.citationCount || 0), 0),
    averageCitations: Math.round(publications.reduce((sum, pub) => sum + (pub.citationCount || 0), 0) / publications.length) || 0,
    recentPubs: publications.filter(pub => new Date(pub.publicationDate || pub.createdAt).getFullYear() >= new Date().getFullYear() - 2).length,
    topVenuePubs: publications.filter(pub => pub.primaryVenueTier === 'Top').length
  };

  // Get unique research areas from publications
  const researchAreas = [...new Set(publications.flatMap(pub => pub.researchAreaNames || []))].slice(0, 8);

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: spacing[6],
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${colors.border}`
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing[5]
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: colors.textPrimary,
          margin: 0
        }}>
          Publications & Research
        </h3>
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

      {/* Publication Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: spacing[4],
        marginBottom: spacing[5],
        padding: spacing[4],
        backgroundColor: colors.background,
        borderRadius: '8px',
        border: `1px solid ${colors.border}`
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: colors.primary,
            marginBottom: spacing[1]
          }}>
            {stats.totalCitations}
          </div>
          <div style={{
            fontSize: '12px',
            color: colors.textSecondary,
            fontWeight: '500'
          }}>
            Total Citations
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: colors.primary,
            marginBottom: spacing[1]
          }}>
            {stats.averageCitations}
          </div>
          <div style={{
            fontSize: '12px',
            color: colors.textSecondary,
            fontWeight: '500'
          }}>
            Avg Citations
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: colors.primary,
            marginBottom: spacing[1]
          }}>
            {stats.recentPubs}
          </div>
          <div style={{
            fontSize: '12px',
            color: colors.textSecondary,
            fontWeight: '500'
          }}>
            Recent (2Y)
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: colors.primary,
            marginBottom: spacing[1]
          }}>
            {stats.topVenuePubs}
          </div>
          <div style={{
            fontSize: '12px',
            color: colors.textSecondary,
            fontWeight: '500'
          }}>
            Top Venue
          </div>
        </div>
      </div>

      {/* Research Areas */}
      {researchAreas.length > 0 && (
        <div style={{ marginBottom: spacing[5] }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[3],
            margin: '0 0 16px 0'
          }}>
            Research Areas
          </h4>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: spacing[2]
          }}>
            {researchAreas.map((area, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: `${colors.primary}10`,
                  color: colors.primary,
                  padding: `${spacing[1]} ${spacing[3]}`,
                  borderRadius: '16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: `1px solid ${colors.primary}20`
                }}
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Publications Header */}
      <h4 style={{
        fontSize: '16px',
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing[4],
        margin: '0 0 16px 0'
      }}>
        Recent Publications
      </h4>

      {/* Publications List - Pill Style */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[3]
      }}>
        {displayedPubs.map((pub, index) => (
          <div
            key={index}
            style={{
              padding: spacing[4],
              backgroundColor: 'white',
              borderRadius: '16px',
              border: `1px solid ${colors.border}`,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease',
              cursor: pub.url ? 'pointer' : 'default'
            }}
            onClick={() => handlePublicationClick(pub.url)}
          >
            {/* Top Row - Venue and Award */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing[2]
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                flexWrap: 'wrap'
              }}>
                {/* Venue Pill */}
                {(pub.primaryVenueName || pub.journal) && (
                  <span style={{
                    backgroundColor: `${colors.primary}10`,
                    color: colors.primary,
                    padding: `${spacing[1]} ${spacing[3]}`,
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: `1px solid ${colors.primary}20`
                  }}>
                    {pub.primaryVenueName || pub.journal}
                  </span>
                )}

                {/* Year Pill */}
                {(pub.publicationYear || pub.year) && (
                  <span style={{
                    backgroundColor: colors.background,
                    color: colors.textSecondary,
                    padding: `${spacing[1]} ${spacing[3]}`,
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    border: `1px solid ${colors.border}`
                  }}>
                    {pub.publicationYear || pub.year}
                  </span>
                )}

                {/* Top Venue Indicator */}
                {pub.primaryVenueTier === 'Top' && (
                  <span style={{
                    backgroundColor: '#f59e0b10',
                    color: '#f59e0b',
                    padding: `${spacing[1]} ${spacing[2]}`,
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    border: '1px solid #f59e0b30'
                  }}>
                    TOP
                  </span>
                )}
              </div>

              {/* Award Badge */}
              {pub.isAwardPaper && (
                <span style={{
                  backgroundColor: '#dc262620',
                  color: '#dc2626',
                  padding: `${spacing[1]} ${spacing[2]}`,
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '600',
                  border: '1px solid #dc262640',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  🏆 Award
                </span>
              )}
            </div>

            {/* Title */}
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              margin: 0,
              marginBottom: spacing[2],
              lineHeight: 1.3
            }}>
              {pub.title || 'Untitled Publication'}
            </h4>

            {/* Authors */}
            <p style={{
              fontSize: '14px',
              color: colors.textSecondary,
              margin: 0,
              marginBottom: spacing[3],
              fontStyle: 'italic'
            }}>
              {formatAuthors(pub.authors)}
            </p>

            {/* Bottom Row - Stats and Links */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: spacing[2]
            }}>
              {/* Citation Count */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2]
              }}>
                {(pub.citationCount > 0 || pub.citations > 0) && (
                  <span style={{
                    fontSize: '13px',
                    color: colors.textTertiary,
                    backgroundColor: colors.background,
                    padding: `2px ${spacing[2]}`,
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`
                  }}>
                    📈 {pub.citationCount || pub.citations} citations
                  </span>
                )}

                {pub.isOpenAccess && (
                  <span style={{
                    fontSize: '12px',
                    color: '#059669',
                    backgroundColor: '#05966910',
                    padding: `2px ${spacing[2]}`,
                    borderRadius: '6px',
                    fontWeight: '500'
                  }}>
                    Open Access
                  </span>
                )}
              </div>

              {/* External Link Indicator */}
              {pub.url && (
                <span style={{
                  fontSize: '12px',
                  color: colors.primary,
                  fontWeight: '500'
                }}>
                  View Paper →
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {publications.length > 3 && (
        <div style={{ textAlign: 'center', marginTop: spacing[4] }}>
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
              fontWeight: '600'
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
          <p style={{ fontSize: '16px', margin: 0 }}>
            No publications available yet
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
      if (!lab?.professorId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const API_BASE_URL = 'https://insidelab.up.railway.app/api/v1';
        const response = await fetch(`${API_BASE_URL}/reviews/?professor=${lab.professorId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch reviews: ${response.status}`);
        }

        const data = await response.json();
        console.log('Loaded reviews for professor:', lab.professorId, data);

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
  }, [lab?.professorId]);

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
          gap: spacing[3]
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: colors.textPrimary,
            margin: 0
          }}>
            Recent Reviews
          </h3>
          <span style={{
            fontSize: '14px',
            color: colors.textSecondary,
            fontWeight: '500'
          }}>
            ({reviews.length})
          </span>
        </div>
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
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          Write Review
        </button>
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
