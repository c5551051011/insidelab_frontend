import React from 'react';
import { Star } from 'lucide-react';
import { colors, spacing, textStyles, typography } from '../theme';

const RecruitmentCard = ({ recruitment, onClick }) => {
  const getInitials = (name) => {
    return name.split(' ').map(n => n.charAt(0)).slice(0, 2).join('').toUpperCase();
  };

  const getPositionBadges = () => {
    const badges = [];
    if (recruitment.isRecruitingPhd) badges.push({ label: 'PhD', color: '#3b82f6' });
    if (recruitment.isRecruitingPostdoc) badges.push({ label: 'Postdoc', color: '#10b981' });
    if (recruitment.isRecruitingIntern) badges.push({ label: 'Intern', color: '#f59e0b' });
    return badges;
  };

  const badges = getPositionBadges();

  return (
    <div
      onClick={() => onClick(recruitment)}
      style={{
        minWidth: '300px',
        maxWidth: '300px',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: spacing[5],
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
      }}
    >
      {/* Lab Icon and Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[3],
        marginBottom: spacing[4]
      }}>
        {/* Professor Avatar */}
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          ...textStyles.cardTitle,
          flexShrink: 0
        }}>
          {getInitials(recruitment.professorName)}
        </div>

        {/* Lab Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            ...textStyles.cardTitle,
            color: colors.textPrimary,
            margin: 0,
            marginBottom: spacing[1],
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {recruitment.professorName}
          </h3>

          <p style={{
            ...textStyles.bodyMedium,
            color: colors.textSecondary,
            margin: 0,
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {recruitment.universityName}
          </p>
        </div>
      </div>

      {/* Open Positions */}
      <div style={{ marginBottom: spacing[4] }}>
        <h4 style={{
          ...textStyles.bodyMedium,
          fontWeight: typography.weights.semibold,
          color: colors.textPrimary,
          margin: 0,
          marginBottom: spacing[2]
        }}>
          Open Positions
        </h4>
        <div style={{
          display: 'flex',
          gap: spacing[2],
          flexWrap: 'wrap'
        }}>
          {badges.map((badge, index) => (
            <span
              key={index}
              style={{
                backgroundColor: `${badge.color}15`,
                color: badge.color,
                padding: `${spacing[1]} ${spacing[3]}`,
                borderRadius: '20px',
                ...textStyles.buttonTextSmall,
                border: `1px solid ${badge.color}30`
              }}
            >
              {badge.label}
            </span>
          ))}
        </div>
      </div>

      {/* Rating & Reviews */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2]
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[1]
        }}>
          <Star size={16} fill={recruitment.overallRating > 0 ? "gold" : "none"} color={recruitment.overallRating > 0 ? "gold" : colors.textTertiary} />
          <span style={{
            ...textStyles.cardTitle,
            color: colors.textPrimary
          }}>
            {recruitment.overallRating > 0 ? recruitment.overallRating.toFixed(1) : 'No rating'}
          </span>
        </div>
        <span style={{
          ...textStyles.bodyMedium,
          color: colors.textTertiary
        }}>
          ({recruitment.reviewCount || 0} reviews)
        </span>
      </div>
    </div>
  );
};

export default RecruitmentCard;