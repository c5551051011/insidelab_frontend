import React from 'react';
import { Star } from 'lucide-react';
import { colors, shadows, textStyles, spacing, sectionSpacing, borderRadius } from '../theme';

const TestimonialsSection = () => {
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'MIT Computer Science',
      avatar: '/assets/images/avatar_sarah.jpg',
      rating: 5,
      testimonial: 'The mock interview sessions were incredibly realistic and helped me identify my weak points. I felt so much more confident during my actual interviews at top-tier programs.',
    },
    {
      name: 'Marcus Johnson',
      role: 'Stanford Economics PhD',
      avatar: '/assets/images/avatar_marcus.jpg',
      rating: 5,
      testimonial: 'The CV feedback service was phenomenal. They caught details I never would have noticed and helped me present my research experience in a much stronger way.',
    },
    {
      name: 'Elena Rodríguez',
      role: 'Harvard Medical School',
      avatar: '/assets/images/avatar_elena.jpg',
      rating: 5,
      testimonial: 'The professor reviews were honest and incredibly detailed. I was able to choose the perfect lab match for my research interests thanks to the insider information from current students.',
    },
  ];

  const renderTestimonials = () => {
    if (isMobile) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      );
    } else if (isTablet) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
          <div style={{ display: 'flex', gap: spacing[6] }}>
            <div style={{ flex: 1 }}>
              <TestimonialCard testimonial={testimonials[0]} />
            </div>
            <div style={{ flex: 1 }}>
              <TestimonialCard testimonial={testimonials[1]} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ maxWidth: '400px', width: '100%' }}>
              <TestimonialCard testimonial={testimonials[2]} />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing[6] }}>
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      );
    }
  };

  return (
    <section
      style={{
        backgroundColor: colors.background,
        padding: `${spacing[20]} ${sectionSpacing.horizontal[isMobile ? 'mobile' : 'desktop']}`,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? spacing[10] : spacing[12] }}>
          <h2
            style={{
              ...textStyles[isMobile ? 'sectionTitleMobile' : 'sectionTitle'],
              color: colors.textPrimary,
              marginBottom: spacing[3],
            }}
          >
            What Our Users Say
          </h2>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <p
              style={{
                ...textStyles.sectionSubtitle,
                color: colors.textSecondary,
              }}
            >
              Real testimonials from students who successfully got into their dream graduate programs.
            </p>
          </div>
        </div>

        {/* Testimonial Cards */}
        {renderTestimonials()}
      </div>
    </section>
  );
};

const TestimonialCard = ({ testimonial }) => {
  const { name, role, avatar, rating, testimonial: text } = testimonial;

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        fill={index < rating ? colors.rating : 'none'}
        color={index < rating ? colors.rating : colors.textTertiary}
      />
    ));
  };

  return (
    <div
      style={{
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        boxShadow: shadows.cardShadowNarrow,
        padding: spacing[6],
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Rating Stars */}
      <div style={{ display: 'flex', gap: spacing[1], marginBottom: spacing[4] }}>
        {renderStars()}
      </div>

      {/* Testimonial Text */}
      <blockquote
        style={{
          fontSize: '16px',
          color: colors.textSecondary,
          lineHeight: 1.6,
          fontStyle: 'italic',
          marginBottom: spacing[6],
          flex: 1,
        }}
      >
        "{text}"
      </blockquote>

      {/* Author Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <img
            src={avatar}
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              // Fallback to initials
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = `
                <div style="
                  width: 100%;
                  height: 100%;
                  background-color: ${colors.primary};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: 600;
                  font-size: 18px;
                ">
                  ${name.split(' ').map(n => n[0]).join('')}
                </div>
              `;
            }}
          />
        </div>
        <div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: colors.textPrimary,
              marginBottom: '2px',
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: '14px',
              color: colors.textSecondary,
            }}
          >
            {role}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;