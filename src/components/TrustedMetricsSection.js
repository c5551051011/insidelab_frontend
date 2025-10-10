import React from 'react';
import { School, Trophy, Building2, TrendingUp } from 'lucide-react';
import { colors, textStyles, spacing, sectionSpacing } from '../theme';

const TrustedMetricsSection = () => {
  const isMobile = window.innerWidth < 768;

  const metrics = [
    {
      icon: School,
      number: '15,000+',
      label: 'Graduate Programs Reviewed',
    },
    {
      icon: Trophy,
      number: '3,200+',
      label: 'Successful Applicants',
    },
    {
      icon: Building2,
      number: '500+',
      label: 'Universities Covered',
    },
    {
      icon: TrendingUp,
      number: '98%',
      label: 'Success Rate',
    },
  ];

  return (
    <section
      style={{
        backgroundColor: colors.metricsBackground,
        padding: `${sectionSpacing[isMobile ? 'mobile' : 'desktop'].small} ${sectionSpacing.horizontal[isMobile ? 'mobile' : 'desktop']}`,
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
              color: colors.metricsText,
              marginBottom: isMobile ? spacing[3] : spacing[4],
            }}
          >
            Trusted by Students Worldwide
          </h2>
          <p
            style={{
              ...textStyles.sectionSubtitle,
              color: colors.metricsSubtext,
            }}
          >
            Join thousands of successful graduate school applicants
          </p>
        </div>

        {/* Metrics Grid */}
        <div
          style={{
            display: isMobile ? 'flex' : 'grid',
            flexDirection: isMobile ? 'column' : undefined,
            gridTemplateColumns: isMobile ? undefined : 'repeat(4, 1fr)',
            gap: isMobile ? spacing[8] : spacing[4],
            alignItems: 'center',
            justifyContent: 'space-around',
          }}
        >
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
      </div>
    </section>
  );
};

const MetricCard = ({ metric }) => {
  const { icon: Icon, number, label } = metric;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {/* Icon with circular background */}
      <div
        style={{
          width: '56px',
          height: '56px',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing[4],
        }}
      >
        <Icon size={28} color={colors.metricsText} />
      </div>

      {/* Number */}
      <div
        style={{
          ...textStyles.metricNumber,
          color: colors.metricsText,
          marginBottom: spacing[2],
        }}
      >
        {number}
      </div>

      {/* Label */}
      <div
        style={{
          ...textStyles.metricLabel,
          color: colors.metricsSubtext,
          maxWidth: '200px',
        }}
      >
        {label}
      </div>
    </div>
  );
};

export default TrustedMetricsSection;