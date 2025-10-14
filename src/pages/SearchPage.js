import React, { useState, useEffect, useCallback } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import Header from '../components/Header';
import EnhancedSearchBar from '../components/search/EnhancedSearchBar';
import FilterSidebar from '../components/search/FilterSidebar';
import SearchResults from '../components/search/SearchResults';
import { colors, spacing } from '../theme';
import { SearchService } from '../services/searchService';
import { SearchFilter } from '../models/Lab';

const SearchPage = () => {
  // State management
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(new SearchFilter());
  const [searchResults, setSearchResults] = useState({
    results: [],
    total: 0,
    page: 1,
    hasMore: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Responsive breakpoints
  const isMobile = window.innerWidth < 1000;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1000;

  // Debounced search function
  const performSearch = useCallback(async (searchQuery, searchFilters, page = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await SearchService.searchLabs(
        searchQuery,
        searchFilters.toJSON(),
        page,
        20 // page size
      );

      setSearchResults(prev => ({
        results: append ? [...prev.results, ...response.results] : response.results,
        total: response.total,
        page: response.page,
        hasMore: response.hasMore
      }));

    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search labs');

      if (!append) {
        setSearchResults({
          results: [],
          total: 0,
          page: 1,
          hasMore: false
        });
      }
    } finally {
      setLoading(false);
      if (initialLoad) {
        setInitialLoad(false);
      }
    }
  }, [initialLoad]);

  // Handle search query change
  const handleSearchChange = (newQuery) => {
    setQuery(newQuery);
  };

  // Handle search submit
  const handleSearchSubmit = (searchQuery) => {
    performSearch(searchQuery, filters, 1, false);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    const filterInstance = new SearchFilter(newFilters);
    setFilters(filterInstance);

    // Perform search with new filters if there's a query or active filters
    if (query.trim() || filterInstance.hasActiveFilters()) {
      performSearch(query, filterInstance, 1, false);
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    if (searchResults.hasMore && !loading) {
      performSearch(query, filters, searchResults.page + 1, true);
    }
  };

  // Handle lab card click
  const handleLabClick = (lab) => {
    // TODO: Navigate to lab detail page
    console.log('Lab clicked:', lab);
    // For now, just log the lab. Later this should navigate to lab detail page
    // navigate(`/lab/${lab.id}`);
  };

  // Load initial popular labs on mount
  useEffect(() => {
    const loadInitialLabs = async () => {
      try {
        setLoading(true);
        const popularLabs = await SearchService.getPopularLabs();
        setSearchResults({
          results: popularLabs.results,
          total: popularLabs.total,
          page: popularLabs.page,
          hasMore: popularLabs.hasMore
        });
      } catch (err) {
        console.error('Error loading initial labs:', err);
        setError('Failed to load labs');
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    loadInitialLabs();
  }, []);

  // Auto-search when filters change (debounced)
  useEffect(() => {
    if (!initialLoad && (query.trim() || filters.hasActiveFilters())) {
      const timeoutId = setTimeout(() => {
        performSearch(query, filters, 1, false);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [query, filters, performSearch, initialLoad]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
      <Header />

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: `${spacing[6]} ${spacing[4]}`,
        display: 'flex',
        gap: spacing[6]
      }}>
        {/* Desktop Filter Sidebar */}
        {!isMobile && (
          <div style={{ width: '300px', flexShrink: 0 }}>
            <FilterSidebar
              filters={filters.toJSON()}
              onFiltersChange={handleFiltersChange}
            />
          </div>
        )}

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Page Header */}
          <div style={{ marginBottom: spacing[6] }}>
            <h1 style={{
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: spacing[2],
              fontFamily: 'Inter'
            }}>
              Search Research Labs
            </h1>

            <p style={{
              fontSize: isMobile ? '14px' : '16px',
              color: colors.textSecondary,
              marginBottom: spacing[6],
              fontFamily: 'Inter',
              lineHeight: 1.5
            }}>
              Find the perfect research lab with detailed reviews and ratings from current students
            </p>

            {/* Search Bar */}
            <div style={{ marginBottom: spacing[4] }}>
              <EnhancedSearchBar
                value={query}
                onChange={handleSearchChange}
                onSubmit={handleSearchSubmit}
                isMobile={isMobile}
                style={{ marginBottom: spacing[4] }}
              />

              {/* Mobile Filter Toggle */}
              {isMobile && (
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    padding: `${spacing[2]} ${spacing[4]}`,
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    color: colors.textPrimary,
                    transition: 'all 0.2s ease',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colors.backgroundLight;
                    e.target.style.borderColor = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = colors.surface;
                    e.target.style.borderColor = colors.border;
                  }}
                >
                  <Filter size={16} />
                  Filters
                  {filters.hasActiveFilters() && (
                    <span style={{
                      backgroundColor: colors.primary,
                      color: 'white',
                      borderRadius: '10px',
                      padding: '2px 6px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {filters.getActiveFilterCount()}
                    </span>
                  )}
                  <ChevronDown
                    size={16}
                    style={{
                      transform: showMobileFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      marginLeft: 'auto'
                    }}
                  />
                </button>
              )}
            </div>

            {/* Mobile Filters */}
            {isMobile && showMobileFilters && (
              <div style={{ marginBottom: spacing[6] }}>
                <FilterSidebar
                  filters={filters.toJSON()}
                  onFiltersChange={handleFiltersChange}
                  isMobile={true}
                />
              </div>
            )}
          </div>

          {/* Search Results */}
          <SearchResults
            results={searchResults.results}
            loading={loading}
            error={error}
            query={query}
            totalCount={searchResults.total}
            hasMore={searchResults.hasMore}
            onLoadMore={handleLoadMore}
            onLabClick={handleLabClick}
          />

          {/* Search Tips (shown when no results and no query) */}
          {!loading && !error && searchResults.results.length === 0 && !query && !filters.hasActiveFilters() && (
            <SearchTips />
          )}
        </div>
      </div>
    </div>
  );
};

// Search Tips Component
const SearchTips = () => {
  const tips = [
    {
      title: 'Search by University',
      description: 'Try "Stanford", "MIT", "Carnegie Mellon"',
      example: 'Stanford University'
    },
    {
      title: 'Search by Research Area',
      description: 'Try "Machine Learning", "Computer Vision", "NLP"',
      example: 'Machine Learning'
    },
    {
      title: 'Search by Professor',
      description: 'Try "Dr. Sarah Chen", "Prof. Johnson"',
      example: 'Dr. Sarah Chen'
    },
    {
      title: 'Search by Lab Name',
      description: 'Try "Computer Vision Lab", "AI Research"',
      example: 'Computer Vision Lab'
    }
  ];

  return (
    <div style={{
      backgroundColor: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: spacing[6],
      marginTop: spacing[6]
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing[4],
        fontFamily: 'Inter',
        textAlign: 'center'
      }}>
        Search Tips
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: spacing[4]
      }}>
        {tips.map((tip, index) => (
          <div
            key={index}
            style={{
              padding: spacing[3],
              backgroundColor: colors.backgroundLight,
              borderRadius: '8px',
              border: `1px solid ${colors.border}`
            }}
          >
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: '4px',
              fontFamily: 'Inter'
            }}>
              {tip.title}
            </h4>
            <p style={{
              fontSize: '12px',
              color: colors.textSecondary,
              marginBottom: '8px',
              fontFamily: 'Inter',
              lineHeight: 1.4
            }}>
              {tip.description}
            </p>
            <code style={{
              fontSize: '12px',
              color: colors.primary,
              backgroundColor: colors.primary + '10',
              padding: '2px 6px',
              borderRadius: '4px',
              fontFamily: 'monospace'
            }}>
              {tip.example}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;