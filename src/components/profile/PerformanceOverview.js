import React from 'react';
import { BarChart3, Calendar, Star, DollarSign, CheckCircle, TrendingUp, Users } from 'lucide-react';
import { colors, spacing } from '../../theme';
import { formatCurrency } from '../../utils/profileUtils';

/**
 * PerformanceOverview Component
 *
 * Displays performance metrics and statistics for service providers.
 * Shows key metrics like bookings, ratings, earnings in a clean card layout.
 *
 * @param {Object} props - Component props
 * @param {Object} props.stats - Statistics object containing performance data
 * @param {boolean} props.isMobile - Whether to use mobile layout
 * @param {string} props.title - Custom title for the component
 */
const PerformanceOverview = ({
  stats = {},
  isMobile = false,
  title = 'Performance Overview'
}) => {

  /**
   * Prepare stat items from data
   */
  const statItems = [
    {
      label: 'This Month Bookings',
      value: stats?.this_month_bookings || stats?.monthlyBookings || 0,
      icon: Calendar,
      color: colors.primary,
      trend: stats?.monthly_booking_trend
    },
    {
      label: 'Average Rating',
      value: `${(stats?.average_rating || stats?.averageRating || 0).toFixed(1)}/5`,
      icon: Star,
      color: colors.warning,
      trend: stats?.rating_trend
    },
    {
      label: 'Total Earnings',
      value: formatCurrency(stats?.total_earnings || stats?.totalEarnings || 0),
      icon: DollarSign,
      color: colors.success,
      trend: stats?.earnings_trend
    },
    {
      label: 'Completed Sessions',
      value: stats?.completed_services || stats?.completedServices || 0,
      icon: CheckCircle,
      color: colors.primary,
      trend: stats?.completion_trend
    }
  ];

  /**
   * Metric Card Component
   */
  const MetricCard = ({ item, index }) => {
    const Icon = item.icon;

    return (
      <div
        style={{
          padding: spacing[4],
          backgroundColor: colors.background,
          borderRadius: '12px',
          textAlign: 'center',
          border: `1px solid ${colors.border}`,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#F8FAFC';
          e.target.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = colors.background;
          e.target.style.transform = 'translateY(0)';
        }}
      >
        {/* Icon */}
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: `${item.color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          marginBottom: spacing[3]
        }}>
          <Icon size={24} color={item.color} />
        </div>

        {/* Value */}
        <div style={{
          fontSize: isMobile ? '20px' : '24px',
          fontWeight: '700',
          color: colors.textPrimary,
          marginBottom: spacing[1]
        }}>
          {item.value}
        </div>

        {/* Label */}
        <div style={{
          fontSize: isMobile ? '11px' : '12px',
          color: colors.textSecondary,
          fontWeight: '500',
          lineHeight: '1.3'
        }}>
          {item.label}
        </div>

        {/* Trend (if available) */}
        {item.trend && (
          <div style={{
            fontSize: '10px',
            color: item.trend.startsWith('+') ? colors.success : colors.danger,
            marginTop: spacing[1],
            fontWeight: '500'
          }}>
            {item.trend}
          </div>
        )}
      </div>
    );
  };

  /**
   * Overview Stat Card (alternative layout for key metrics)
   */
  // eslint-disable-next-line no-unused-vars
  const OverviewStatCard = ({ icon: Icon, label, value, trend, color }) => {
    return (
      <div style={{
        padding: spacing[6],
        backgroundColor: `${color}08`,
        borderRadius: '16px',
        border: `1px solid ${color}20`,
        transition: 'all 0.2s ease'
      }}>
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
            backgroundColor: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={24} color={color} />
          </div>
          {trend && (
            <TrendingUp
              size={16}
              color={trend.startsWith('+') ? colors.success : colors.danger}
            />
          )}
        </div>

        <div style={{
          fontSize: '28px',
          fontWeight: '700',
          color: colors.textPrimary,
          marginBottom: spacing[1]
        }}>
          {value}
        </div>

        <div style={{
          fontSize: '14px',
          color: colors.textPrimary,
          fontWeight: '600',
          marginBottom: spacing[2]
        }}>
          {label}
        </div>

        {trend && (
          <div style={{
            fontSize: '12px',
            color: colors.textSecondary
          }}>
            {trend}
          </div>
        )}
      </div>
    );
  };

  /**
   * Empty State Component
   */
  const EmptyState = () => (
    <div style={{
      padding: spacing[8],
      textAlign: 'center',
      color: colors.textSecondary
    }}>
      <BarChart3
        size={48}
        color={colors.textTertiary}
        style={{ marginBottom: spacing[3] }}
      />
      <div style={{
        fontSize: '16px',
        fontWeight: '500',
        marginBottom: spacing[2]
      }}>
        No performance data yet
      </div>
      <div style={{
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        Start providing services to see your performance metrics
      </div>
    </div>
  );

  // Check if we have any meaningful data
  const hasData = stats && Object.values(stats).some(value =>
    value !== null && value !== undefined && value !== 0
  );

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: spacing[6],
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.05)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: spacing[5]
      }}>
        <BarChart3 size={24} color={colors.primary} />
        <h3 style={{
          fontSize: isMobile ? '18px' : '20px',
          fontWeight: '700',
          color: colors.textPrimary,
          margin: 0,
          marginLeft: spacing[3]
        }}>
          {title}
        </h3>
      </div>

      {/* Content */}
      {!hasData ? (
        <EmptyState />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? 'repeat(2, 1fr)'
            : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: spacing[4]
        }}>
          {statItems.map((item, index) => (
            <MetricCard key={index} item={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Alternative layout component for featured metrics
 */
export const FeaturedPerformanceOverview = ({ stats = {}, title = 'Key Metrics' }) => {
  const featuredStats = [
    {
      icon: Users,
      label: 'Total Sessions',
      value: stats?.total_sessions || 0,
      trend: '+12% this month',
      color: colors.primary
    },
    {
      icon: Star,
      label: 'Average Rating',
      value: `${(stats?.average_rating || 0).toFixed(1)}★`,
      trend: '+0.3 this month',
      color: colors.warning
    },
    {
      icon: DollarSign,
      label: 'Monthly Earnings',
      value: formatCurrency(stats?.monthly_earnings || 0),
      trend: '+24% this month',
      color: colors.success
    },
    {
      icon: TrendingUp,
      label: 'Success Rate',
      value: `${stats?.success_rate || 0}%`,
      trend: '+5% this month',
      color: colors.primary
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: spacing[4],
      marginBottom: spacing[6]
    }}>
      {featuredStats.map((stat, index) => (
        <OverviewStatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default PerformanceOverview;