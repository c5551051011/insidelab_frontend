import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Search, Filter, ExternalLink, Users } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { colors, spacing } from '../theme';
import { useBreakpoint } from '../hooks/useBreakpoint';

const NewsPage = () => {
  const { width } = useBreakpoint();
  const isMobile = width < 768;
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newsItems, setNewsItems] = useState([]);

  // Mock data - 실제로는 API에서 가져올 데이터
  const mockNewsData = [
    {
      id: 1,
      title: "Stanford AI Lab Open House 2024",
      category: "event",
      type: "seminar",
      date: "2024-12-15",
      time: "14:00",
      location: "Stanford University, Gates Building",
      description: "Join us for an exclusive tour of Stanford's AI Laboratory and learn about cutting-edge research in machine learning and computer vision.",
      organizer: "Stanford AI Lab",
      isExternal: true,
      registrationLink: "https://stanford.edu/ai-open-house",
      capacity: 50,
      imageUrl: "/api/placeholder/400/200",
      tags: ["AI", "Machine Learning", "Research"]
    },
    {
      id: 2,
      title: "InsideLab Platform Update: New Review Features",
      category: "announcement",
      type: "platform",
      date: "2024-12-10",
      description: "We're excited to announce new features for lab reviews including enhanced filtering, better search capabilities, and improved user profiles.",
      organizer: "InsideLab Team",
      isExternal: false,
      imageUrl: "/api/placeholder/400/200",
      tags: ["Platform", "Updates", "Features"]
    },
    {
      id: 3,
      title: "MIT CSAIL Robotics Workshop",
      category: "event",
      type: "workshop",
      date: "2024-12-20",
      time: "10:00",
      location: "MIT CSAIL, Stata Center",
      description: "Hands-on workshop covering the latest developments in robotics and autonomous systems. Open to graduate students and researchers.",
      organizer: "MIT CSAIL",
      isExternal: true,
      registrationLink: "https://csail.mit.edu/robotics-workshop",
      capacity: 30,
      imageUrl: "/api/placeholder/400/200",
      tags: ["Robotics", "Workshop", "MIT"]
    },
    {
      id: 4,
      title: "Berkeley Lab Virtual Seminar Series",
      category: "event",
      type: "seminar",
      date: "2024-12-18",
      time: "16:00",
      location: "Virtual Event",
      description: "Weekly seminar series featuring renowned researchers discussing breakthroughs in computational biology and bioinformatics.",
      organizer: "UC Berkeley",
      isExternal: true,
      registrationLink: "https://berkeley.edu/seminar-series",
      imageUrl: "/api/placeholder/400/200",
      tags: ["Biology", "Computational", "Virtual"]
    },
    {
      id: 5,
      title: "New Partnership: InsideLab x University Network",
      category: "announcement",
      type: "partnership",
      date: "2024-12-08",
      description: "InsideLab announces strategic partnerships with 20+ universities to expand our database and provide better insights into research opportunities worldwide.",
      organizer: "InsideLab Team",
      isExternal: false,
      imageUrl: "/api/placeholder/400/200",
      tags: ["Partnership", "Universities", "Expansion"]
    }
  ];

  useEffect(() => {
    setNewsItems(mockNewsData);
  }, [mockNewsData]);

  const categories = [
    { value: 'all', label: 'All', icon: '📋' },
    { value: 'event', label: 'Events', icon: '📅' },
    { value: 'announcement', label: 'Announcements', icon: '📢' }
  ];

  const types = [
    { value: 'all', label: 'All Types' },
    { value: 'seminar', label: 'Seminars' },
    { value: 'workshop', label: 'Workshops' },
    { value: 'platform', label: 'Platform Updates' },
    { value: 'partnership', label: 'Partnerships' }
  ];

  const filteredNews = newsItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesSearch = searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesType && matchesSearch;
  });


  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
      <Header />

      <main>
        {/* Hero Section */}
        <section style={{
          background: `linear-gradient(135deg, ${colors.primary}15, ${colors.primary}05)`,
          padding: isMobile ? `${spacing[8]} ${spacing[4]}` : `${spacing[12]} ${spacing[6]}`,
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h1 style={{
              fontSize: isMobile ? '32px' : '48px',
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: spacing[4],
              fontFamily: 'Inter'
            }}>
              News & Events
            </h1>
            <p style={{
              fontSize: isMobile ? '16px' : '20px',
              color: colors.textSecondary,
              lineHeight: 1.6,
              fontFamily: 'Inter'
            }}>
              Stay updated with the latest research opportunities, lab events, and platform announcements
            </p>
          </div>
        </section>

        {/* Filters Section */}
        <section style={{
          padding: `${spacing[6]} ${spacing[4]}`,
          borderBottom: `1px solid ${colors.border}`
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Search Bar */}
            <div style={{
              position: 'relative',
              marginBottom: spacing[6]
            }}>
              <Search
                size={20}
                color={colors.textSecondary}
                style={{
                  position: 'absolute',
                  left: spacing[3],
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news and events..."
                style={{
                  width: '100%',
                  padding: `${spacing[3]} ${spacing[3]} ${spacing[3]} ${spacing[10]}`,
                  fontSize: '16px',
                  border: `2px solid ${colors.border}`,
                  borderRadius: '12px',
                  outline: 'none',
                  fontFamily: 'Inter',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                }}
              />
            </div>

            {/* Category and Type Filters */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: spacing[4],
              alignItems: isMobile ? 'stretch' : 'center'
            }}>
              {/* Categories */}
              <div style={{
                display: 'flex',
                gap: spacing[2],
                flexWrap: 'wrap'
              }}>
                {categories.map(category => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[2],
                      padding: `${spacing[2]} ${spacing[4]}`,
                      borderRadius: '24px',
                      border: `2px solid ${selectedCategory === category.value ? colors.primary : colors.border}`,
                      backgroundColor: selectedCategory === category.value ? colors.primary : colors.background,
                      color: selectedCategory === category.value ? 'white' : colors.textPrimary,
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontFamily: 'Inter',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>{category.icon}</span>
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  borderRadius: '8px',
                  border: `2px solid ${colors.border}`,
                  backgroundColor: colors.background,
                  color: colors.textPrimary,
                  fontSize: '14px',
                  fontFamily: 'Inter',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {types.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* News Items */}
        <section style={{
          padding: `${spacing[8]} ${spacing[4]} ${spacing[12]}`
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {filteredNews.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: `${spacing[12]} 0`,
                color: colors.textSecondary
              }}>
                <Filter size={48} color={colors.textTertiary} style={{ marginBottom: spacing[4] }} />
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: spacing[2],
                  fontFamily: 'Inter'
                }}>
                  No items found
                </h3>
                <p style={{
                  fontSize: '16px',
                  fontFamily: 'Inter'
                }}>
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: spacing[6]
              }}>
                {filteredNews.map(item => (
                  <NewsCard key={item.id} item={item} isMobile={isMobile} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const NewsCard = ({ item, isMobile }) => {
  const isEvent = item.category === 'event';
  const upcoming = isEvent && isUpcoming(item.date);

  return (
    <div style={{
      backgroundColor: colors.background,
      border: `1px solid ${colors.border}`,
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
    }}
    >
      {/* Image */}
      <div style={{
        height: '200px',
        backgroundColor: colors.backgroundLight,
        backgroundImage: `url(${item.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        {/* Category Badge */}
        <div style={{
          position: 'absolute',
          top: spacing[3],
          left: spacing[3],
          padding: `${spacing[1]} ${spacing[3]}`,
          backgroundColor: item.category === 'event' ? colors.primary : colors.success,
          color: 'white',
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: '600',
          fontFamily: 'Inter'
        }}>
          {item.category === 'event' ? '📅 Event' : '📢 News'}
        </div>

        {/* Upcoming Badge */}
        {upcoming && (
          <div style={{
            position: 'absolute',
            top: spacing[3],
            right: spacing[3],
            padding: `${spacing[1]} ${spacing[2]}`,
            backgroundColor: colors.warning,
            color: colors.textPrimary,
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '600',
            fontFamily: 'Inter'
          }}>
            Upcoming
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: spacing[5] }}>
        {/* Title */}
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: spacing[3],
          fontFamily: 'Inter',
          lineHeight: 1.4
        }}>
          {item.title}
        </h3>

        {/* Event Details */}
        {isEvent && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[2],
            marginBottom: spacing[3],
            padding: `${spacing[3]}`,
            backgroundColor: colors.surface,
            borderRadius: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              fontSize: '14px',
              color: colors.textSecondary,
              fontFamily: 'Inter'
            }}>
              <Calendar size={16} />
              {formatDate(item.date)}
              {item.time && (
                <>
                  <Clock size={16} style={{ marginLeft: spacing[2] }} />
                  {item.time}
                </>
              )}
            </div>
            {item.location && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                fontSize: '14px',
                color: colors.textSecondary,
                fontFamily: 'Inter'
              }}>
                <MapPin size={16} />
                {item.location}
              </div>
            )}
            {item.capacity && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                fontSize: '14px',
                color: colors.textSecondary,
                fontFamily: 'Inter'
              }}>
                <Users size={16} />
                {item.capacity} seats available
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <p style={{
          fontSize: '14px',
          color: colors.textSecondary,
          lineHeight: 1.5,
          marginBottom: spacing[4],
          fontFamily: 'Inter'
        }}>
          {item.description}
        </p>

        {/* Tags */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: spacing[2],
          marginBottom: spacing[4]
        }}>
          {item.tags.map(tag => (
            <span
              key={tag}
              style={{
                padding: `${spacing[1]} ${spacing[2]}`,
                backgroundColor: `${colors.primary}10`,
                color: colors.primary,
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '500',
                fontFamily: 'Inter'
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: spacing[3],
          borderTop: `1px solid ${colors.border}`
        }}>
          <span style={{
            fontSize: '12px',
            color: colors.textTertiary,
            fontFamily: 'Inter'
          }}>
            By {item.organizer}
          </span>

          {item.registrationLink && (
            <a
              href={item.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[1],
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor: colors.primary,
                color: 'white',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                textDecoration: 'none',
                fontFamily: 'Inter',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.primaryDark || '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = colors.primary;
              }}
            >
              Register
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const isUpcoming = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  return date >= today;
};

export default NewsPage;