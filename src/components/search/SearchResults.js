import React from 'react';
import { Search, AlertCircle, ChevronDown } from 'lucide-react';
import { colors, spacing } from '../../theme';
import LabCard, { LabCardSkeleton } from './LabCard';
import { Lab } from '../../models/Lab';

const SearchResults = ({
  results = [],
  loading = false,
  error = null,
  query = '',
  totalCount = 0,
  hasMore = false,
  onLoadMore,
  onLabClick,
  className = '',
  style = {}
}) => {
  // Convert raw data to Lab instances if needed
  const labInstances = results.map(result =>
    result instanceof Lab ? result : new Lab(result)
  );

  // Handle load more
  const handleLoadMore = () => {
    if (onLoadMore && hasMore && !loading) {
      onLoadMore();
    }
  };

  // Loading skeleton
  if (loading && labInstances.length === 0) {
    return (
      <div className={className} style={style}>
        <ResultsHeader
          count={0}
          query={query}
          loading={true}
        />
        <div style={{
          display: 'grid',
          gap: spacing[4],
          gridTemplateColumns: '1fr'
        }}>
          {Array.from({ length: 5 }, (_, index) => (
            <LabCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={className} style={style}>
        <ErrorMessage error={error} />
      </div>
    );
  }

  // No results
  if (labInstances.length === 0 && !loading) {
    return (
      <div className={className} style={style}>
        <EmptyState query={query} />
      </div>
    );
  }

  // Results
  return (
    <div className={className} style={style}>
      <ResultsHeader
        count={totalCount || labInstances.length}
        query={query}
        loading={loading}
      />

      <div style={{
        display: 'grid',
        gap: spacing[4],
        gridTemplateColumns: '1fr'
      }}>
        {labInstances.map((lab, index) => (
          <LabCard
            key={lab.id || index}
            lab={lab}
            searchQuery={query}
            onClick={onLabClick}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: spacing[6]
        }}>
          <button
            onClick={handleLoadMore}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[3]} ${spacing[6]}`,
              backgroundColor: loading ? colors.border : colors.surface,
              border: `2px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: loading ? colors.textSecondary : colors.textPrimary,
              fontFamily: 'Inter',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = colors.backgroundLight;
                e.target.style.borderColor = colors.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = colors.surface;
                e.target.style.borderColor = colors.border;
              }
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: `2px solid ${colors.border}`,
                  borderTop: `2px solid ${colors.primary}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Loading more...
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Load more labs
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading more indicator */}
      {loading && labInstances.length > 0 && (
        <div style={{
          display: 'grid',
          gap: spacing[4],
          gridTemplateColumns: '1fr',
          marginTop: spacing[4]
        }}>
          {Array.from({ length: 3 }, (_, index) => (
            <LabCardSkeleton key={`loading-${index}`} />
          ))}
        </div>
      )}
    </div>
  );
};

// Results Header Component
const ResultsHeader = ({ count, query, loading }) => {
  const getResultText = () => {
    if (loading && count === 0) {
      return 'Searching...';
    }

    if (count === 0) {
      return 'No labs found';
    }

    if (count === 1) {
      return '1 lab found';
    }

    return `${count.toLocaleString()} labs found`;
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[4],
      flexWrap: 'wrap',
      gap: spacing[2]
    }}>
      <h2 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: colors.textPrimary,
        margin: 0,
        fontFamily: 'Inter'
      }}>
        {getResultText()}
        {query && (
          <span style={{
            fontSize: '16px',
            fontWeight: '400',
            color: colors.textSecondary,
            marginLeft: spacing[2]
          }}>
            for "{query}"
          </span>
        )}
      </h2>

      {loading && count > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[1],
          color: colors.textSecondary,
          fontSize: '14px',
          fontFamily: 'Inter'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            border: `2px solid ${colors.border}`,
            borderTop: `2px solid ${colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Loading more...
        </div>
      )}
    </div>
  );
};

// Empty State Component
const EmptyState = ({ query }) => {
  const suggestions = [
    'Try searching for specific universities like "Stanford" or "MIT"',
    'Search for research areas like "Machine Learning" or "Computer Vision"',
    'Look for professor names or lab names',
    'Use broader search terms',
    'Check your spelling and try again'
  ];

  return (
    <div style={{
      textAlign: 'center',
      padding: `${spacing[8]} ${spacing[4]}`,
      color: colors.textSecondary
    }}>
      <Search
        size={64}
        color={colors.textTertiary}
        style={{ marginBottom: spacing[4] }}
      />

      <h3 style={{
        fontSize: '20px',
        fontWeight: '600',
        marginBottom: spacing[2],
        fontFamily: 'Inter',
        color: colors.textPrimary
      }}>
        {query ? 'No labs found' : 'Start your search'}
      </h3>

      <p style={{
        fontSize: '16px',
        marginBottom: spacing[4],
        fontFamily: 'Inter',
        lineHeight: 1.5,
        maxWidth: '500px',
        margin: `0 auto ${spacing[4]} auto`
      }}>
        {query
          ? 'We couldn\'t find any labs matching your search criteria. Try adjusting your search terms or filters.'
          : 'Search for research labs by university, professor name, research area, or lab name to get started.'
        }
      </p>

      {query && (
        <div style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          padding: spacing[4],
          textAlign: 'left',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: spacing[2],
            fontFamily: 'Inter',
            color: colors.textPrimary
          }}>
            Try these suggestions:
          </h4>
          <ul style={{
            margin: 0,
            paddingLeft: spacing[4],
            listStyle: 'disc'
          }}>
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                style={{
                  fontSize: '14px',
                  marginBottom: '4px',
                  fontFamily: 'Inter',
                  color: colors.textSecondary
                }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Error Message Component
const ErrorMessage = ({ error }) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: `${spacing[8]} ${spacing[4]}`,
      color: colors.error
    }}>
      <AlertCircle
        size={64}
        color={colors.error}
        style={{ marginBottom: spacing[4] }}
      />

      <h3 style={{
        fontSize: '20px',
        fontWeight: '600',
        marginBottom: spacing[2],
        fontFamily: 'Inter',
        color: colors.error
      }}>
        Something went wrong
      </h3>

      <p style={{
        fontSize: '16px',
        marginBottom: spacing[4],
        fontFamily: 'Inter',
        lineHeight: 1.5,
        maxWidth: '500px',
        margin: `0 auto ${spacing[4]} auto`,
        color: colors.textSecondary
      }}>
        {typeof error === 'string' ? error : 'Failed to load search results. Please try again.'}
      </p>

      <button
        onClick={() => window.location.reload()}
        style={{
          padding: `${spacing[2]} ${spacing[4]}`,
          backgroundColor: colors.error,
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          fontFamily: 'Inter',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = colors.errorDark || '#dc2626';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = colors.error;
        }}
      >
        Try Again
      </button>
    </div>
  );
};

export default SearchResults;