import React from 'react';
import { Star, ExternalLink, MapPin, Users } from 'lucide-react';
import { colors, spacing } from '../../theme';
import { Lab } from '../../models/Lab';

const LabCard = ({
  lab,
  searchQuery = '',
  onClick,
  className = '',
  style = {}
}) => {
  // Ensure lab is a Lab instance
  const labInstance = lab instanceof Lab ? lab : new Lab(lab);

  // Highlight matching text in search results
  const highlightText = (text, query) => {
    if (!query || !query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span
          key={index}
          style={{
            backgroundColor: colors.warning + '40',
            fontWeight: '600',
            borderRadius: '2px',
            padding: '1px 2px'
          }}
        >
          {part}
        </span>
      ) : part
    );
  };

  // Handle card click
  const handleClick = () => {
    if (onClick) {
      onClick(labInstance);
    }
  };

  // Handle external link clicks (prevent event bubbling)
  const handleExternalClick = (e, url) => {
    e.stopPropagation();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={className}
      onClick={handleClick}
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        padding: spacing[4],
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        position: 'relative',
        ...style
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = colors.primary + '40';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = colors.border;
        }
      }}
    >
      <div style={{ display: 'flex', gap: spacing[4] }}>
        {/* Lab Avatar */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: colors.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            flexShrink: 0,
            fontFamily: 'Inter',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          {labInstance.getInitials()}
        </div>

        {/* Lab Information */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Primary Info - Professor and University */}
          <div
            style={{
              fontSize: '18px',
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: '4px',
              fontFamily: 'Inter',
              lineHeight: 1.2,
              display: 'flex',
              alignItems: 'flex-start',
              gap: spacing[2],
              flexWrap: 'wrap'
            }}
          >
            <span>
              {highlightText(labInstance.professorName, searchQuery)} •{' '}
              {highlightText(labInstance.universityName, searchQuery)}
            </span>

            {/* External link icon for university website */}
            {labInstance.website && (
              <button
                onClick={(e) => handleExternalClick(e, labInstance.website)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: colors.textSecondary,
                  padding: '2px',
                  borderRadius: '4px',
                  transition: 'color 0.2s ease'
                }}
                title="Visit lab website"
                onMouseEnter={(e) => {
                  e.target.style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = colors.textSecondary;
                }}
              >
                <ExternalLink size={14} />
              </button>
            )}
          </div>

          {/* Secondary Info - Lab Name */}
          <div
            style={{
              fontSize: '14px',
              color: colors.textSecondary,
              marginBottom: '4px',
              fontFamily: 'Inter',
              fontWeight: '500'
            }}
          >
            {highlightText(labInstance.labName, searchQuery)}
          </div>

          {/* Hierarchy */}
          <div
            style={{
              fontSize: '12px',
              color: colors.textTertiary,
              marginBottom: spacing[3],
              fontFamily: 'Inter',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <MapPin size={12} />
            {labInstance.getHierarchy()}
          </div>

          {/* Research Areas */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: spacing[1],
              marginBottom: spacing[3]
            }}
          >
            {labInstance.researchAreas.slice(0, 3).map((area, index) => (
              <span
                key={index}
                style={{
                  fontSize: '12px',
                  backgroundColor: colors.primary + '1A',
                  color: colors.primary,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  fontFamily: 'Inter',
                  border: `1px solid ${colors.primary}20`
                }}
              >
                {highlightText(area, searchQuery)}
              </span>
            ))}
            {labInstance.researchAreas.length > 3 && (
              <span
                style={{
                  fontSize: '12px',
                  color: colors.textSecondary,
                  padding: '4px 8px',
                  fontFamily: 'Inter'
                }}
              >
                +{labInstance.researchAreas.length - 3} more
              </span>
            )}
          </div>

          {/* Bottom Row - Rating and Tags */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: spacing[2]
            }}
          >
            {/* Left Side - Rating and Reviews */}
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star
                  size={16}
                  fill={colors.warning}
                  color={colors.warning}
                />
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.textPrimary,
                    fontFamily: 'Inter'
                  }}
                >
                  {labInstance.getFormattedRating()}
                </span>
              </div>

              {/* Review Count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={14} color={colors.textSecondary} />
                <span
                  style={{
                    fontSize: '14px',
                    color: colors.textSecondary,
                    fontFamily: 'Inter'
                  }}
                >
                  {labInstance.getReviewCountText()}
                </span>
              </div>
            </div>

            {/* Right Side - Tags and Recruitment Status */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: spacing[1],
                alignItems: 'center'
              }}
            >
              {/* Recruitment Status Chips */}
              {labInstance.getRecruitmentChips().map((chip, index) => {
                const chipColors = {
                  phd: { bg: colors.success + '20', text: colors.success },
                  postdoc: { bg: colors.info + '20', text: colors.info },
                  intern: { bg: colors.warning + '20', text: colors.warning }
                };

                const chipColor = chipColors[chip.type] || chipColors.phd;

                return (
                  <span
                    key={index}
                    style={{
                      fontSize: '11px',
                      backgroundColor: chipColor.bg,
                      color: chipColor.text,
                      padding: '3px 6px',
                      borderRadius: '4px',
                      fontWeight: '600',
                      fontFamily: 'Inter',
                      border: `1px solid ${chipColor.text}30`
                    }}
                  >
                    {chip.label}
                  </span>
                );
              })}

              {/* Regular Lab Tags */}
              {labInstance.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  style={{
                    fontSize: '11px',
                    backgroundColor: colors.textSecondary + '15',
                    color: colors.textSecondary,
                    padding: '3px 6px',
                    borderRadius: '4px',
                    fontWeight: '500',
                    fontFamily: 'Inter'
                  }}
                >
                  {tag}
                </span>
              ))}

              {/* Show more tags indicator */}
              {labInstance.tags.length > 2 && (
                <span
                  style={{
                    fontSize: '11px',
                    color: colors.textTertiary,
                    fontFamily: 'Inter'
                  }}
                >
                  +{labInstance.tags.length - 2}
                </span>
              )}
            </div>
          </div>

          {/* Lab Description (optional, shown on hover or expanded state) */}
          {labInstance.description && (
            <div
              style={{
                fontSize: '13px',
                color: colors.textSecondary,
                marginTop: spacing[2],
                lineHeight: 1.4,
                fontFamily: 'Inter',
                fontStyle: 'italic'
              }}
            >
              {labInstance.description.length > 100
                ? `${labInstance.description.substring(0, 100)}...`
                : labInstance.description
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Skeleton Loading Component for LabCard
export const LabCardSkeleton = ({ style = {} }) => {
  return (
    <div
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        padding: spacing[4],
        ...style
      }}
    >
      <div style={{ display: 'flex', gap: spacing[4] }}>
        {/* Avatar Skeleton */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: colors.border,
            flexShrink: 0,
            animation: 'pulse 1.5s ease-in-out infinite'
          }}
        />

        {/* Content Skeleton */}
        <div style={{ flex: 1 }}>
          {/* Title skeleton */}
          <div
            style={{
              height: '20px',
              backgroundColor: colors.border,
              borderRadius: '4px',
              marginBottom: '8px',
              width: '70%',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          />

          {/* Subtitle skeleton */}
          <div
            style={{
              height: '16px',
              backgroundColor: colors.border,
              borderRadius: '4px',
              marginBottom: '8px',
              width: '50%',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          />

          {/* Hierarchy skeleton */}
          <div
            style={{
              height: '12px',
              backgroundColor: colors.border,
              borderRadius: '4px',
              marginBottom: spacing[3],
              width: '60%',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          />

          {/* Tags skeleton */}
          <div
            style={{
              display: 'flex',
              gap: spacing[1],
              marginBottom: spacing[3]
            }}
          >
            {[1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  height: '24px',
                  width: '80px',
                  backgroundColor: colors.border,
                  borderRadius: '6px',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}
              />
            ))}
          </div>

          {/* Bottom row skeleton */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                height: '16px',
                width: '100px',
                backgroundColor: colors.border,
                borderRadius: '4px',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}
            />
            <div
              style={{
                display: 'flex',
                gap: spacing[1]
              }}
            >
              {[1, 2].map(i => (
                <div
                  key={i}
                  style={{
                    height: '20px',
                    width: '60px',
                    backgroundColor: colors.border,
                    borderRadius: '4px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabCard;