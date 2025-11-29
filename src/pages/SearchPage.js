import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, ChevronDown } from 'lucide-react';
import Header from '../components/Header';
import EnhancedSearchBar from '../components/search/EnhancedSearchBar';
import FilterSidebar from '../components/search/FilterSidebar';
import SearchResults from '../components/search/SearchResults';
import { colors, spacing } from '../theme';
import { SearchService } from '../services/searchService';
import { ApiService } from '../services/apiService';
import { AuthService } from '../services/authService';
import { BookmarkService } from '../services/bookmarkService';
import { SearchFilter } from '../models/Lab';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { trackSearch, trackFilterChange, trackPageView } from '../lib/analytics/trackEvent';

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Helper function to parse filters from URL params
  const parseFiltersFromURL = useCallback(() => {
    const filterData = {};

    // Parse rating
    const rating = searchParams.get('rating');
    if (rating) filterData.rating = parseInt(rating, 10);

    // Parse universities (comma-separated, convert to numbers)
    const universities = searchParams.get('universities');
    if (universities) {
      filterData.universities = universities.split(',').filter(Boolean).map(u => {
        const num = Number(u);
        return isNaN(num) ? u : num; // Return number if valid, otherwise keep as string
      });
    }

    // Parse departments (comma-separated)
    const departments = searchParams.get('departments');
    if (departments) filterData.departments = departments.split(',').filter(Boolean);

    // Parse research areas (comma-separated)
    const researchAreas = searchParams.get('researchAreas');
    if (researchAreas) filterData.researchAreas = researchAreas.split(',').filter(Boolean);

    // Parse tags (comma-separated)
    const tags = searchParams.get('tags');
    if (tags) filterData.tags = tags.split(',').filter(Boolean);

    // Parse sortBy
    const sortBy = searchParams.get('sortBy');
    if (sortBy) filterData.sortBy = sortBy;

    // Parse recruitmentOnly
    const recruitmentOnly = searchParams.get('recruitmentOnly');
    if (recruitmentOnly === 'true') filterData.recruitmentOnly = true;

    return new SearchFilter(filterData);
  }, [searchParams]);

  // Helper function to update URL params with filters
  const updateURLParams = useCallback((query, filters) => {
    const params = new URLSearchParams();

    // Add query
    if (query) params.set('q', query);

    // Add filters
    if (filters.rating > 0) params.set('rating', filters.rating.toString());
    if (filters.universities.length > 0) params.set('universities', filters.universities.join(','));
    if (filters.departments.length > 0) params.set('departments', filters.departments.join(','));
    if (filters.researchAreas.length > 0) params.set('researchAreas', filters.researchAreas.join(','));
    if (filters.tags.length > 0) params.set('tags', filters.tags.join(','));
    if (filters.sortBy !== 'rating') params.set('sortBy', filters.sortBy);
    if (filters.recruitmentOnly) params.set('recruitmentOnly', 'true');

    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // State management - initialize from URL params
  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [filters, setFilters] = useState(() => parseFiltersFromURL());
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
  const [interestedProfessorIds, setInterestedProfessorIds] = useState(new Set());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { width } = useBreakpoint();
  const isMobile = width < 1000;

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

      if (append) {
        // For load more errors (when no more data available), keep existing data but hide load more button
        setSearchResults(prev => ({
          ...prev,
          hasMore: false
        }));
        console.log('No more data available on page', page, '- hiding load more button');
        // Don't set error state for load more failures to avoid disrupting user experience
      } else {
        // For initial search errors, clear results and show error
        setError(err.message || 'Failed to search labs');
        setSearchResults({
          results: [],
          total: 0,
          page: 1,
          hasMore: false
        });
      }
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  // Handle search query change
  const handleSearchChange = (newQuery) => {
    setQuery(newQuery);
  };

  // Handle search submit
  const handleSearchSubmit = (searchQuery) => {
    // Track search event
    trackSearch(searchQuery, filters.toJSON());

    // Update URL params
    updateURLParams(searchQuery, filters);

    performSearch(searchQuery, filters, 1, false);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    const filterInstance = new SearchFilter(newFilters);

    // Track filter change
    const changedFilters = Object.keys(newFilters).filter(key => {
      return JSON.stringify(newFilters[key]) !== JSON.stringify(filters.toJSON()[key]);
    });

    if (changedFilters.length > 0) {
      trackFilterChange(
        changedFilters.join(','),
        changedFilters.map(key => newFilters[key]).join(','),
        newFilters
      );
    }

    setFilters(filterInstance);

    // Update URL params with new filters
    updateURLParams(query, filterInstance);

    // Always perform search when filters change to update results
    performSearch(query, filterInstance, 1, false);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (searchResults.hasMore && !loading) {
      performSearch(query, filters, searchResults.page + 1, true);
    }
  };

  // Handle lab card click
  const handleLabClick = (lab) => {
    // Navigate using lab ID directly in URL
    navigate(`/lab/${lab.id}`, { state: { from: 'search' } });
  };

  // Handle lab added
  const handleLabAdded = (newLab) => {
    // Optionally refresh search results or add the new lab to results
    console.log('New lab added:', newLab);
    // You could trigger a fresh search here if needed
    // performSearch(query, filters, 1, false);
  };

  // Handle interest change for a lab
  const handleInterestChange = async (labId, isInterested, professorId) => {
    // LabCard already handles the API call, just update the UI state
    if (isInterested) {
      // Add professor ID to the interested set
      if (professorId) {
        setInterestedProfessorIds(prev => new Set(prev).add(Number(professorId)));
      }
    } else {
      // Remove professor ID from the interested set
      if (professorId) {
        setInterestedProfessorIds(prev => {
          const updated = new Set(prev);
          updated.delete(Number(professorId));
          return updated;
        });
      }
    }
  };

  // Load user authentication status and interested labs
  useEffect(() => {
    const loadUserData = async () => {
      const authenticated = AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        try {
          // Load lab interest data for search page display using BookmarkService
          const labInterests = await BookmarkService.getLabInterests();

          console.log('DEBUG: Lab interests from BookmarkService:', labInterests);

          // Extract professor IDs from lab interests and create a Set for fast lookup
          // For now, use labId since the professor matching might be based on lab
          const professorIds = new Set();
          const labIds = new Set();

          labInterests.forEach(interest => {
            console.log('Processing interest:', interest);

            // Add lab ID to the set as well
            if (interest.labId) {
              labIds.add(Number(interest.labId));
            }

            // Try to extract professor ID if available
            const professorId = interest.labProfessorId ||
                               interest.professorId ||
                               interest.lab_professor_id;

            if (professorId && !isNaN(professorId)) {
              professorIds.add(Number(professorId));
              console.log('Added professor ID:', professorId);
            }
          });

          setInterestedProfessorIds(professorIds);
          console.log('Loaded interested professor IDs:', Array.from(professorIds));
          console.log('Loaded interested lab IDs:', Array.from(labIds));
        } catch (error) {
          console.error('Error loading interested labs:', error);
          // Don't set error state for this, just continue without interest data
        }
      }
    };

    loadUserData();
  }, []);

  // Load initial data on mount - either from URL query or popular labs
  useEffect(() => {
    if (!initialLoad) return; // Only run once on initial load

    const loadInitialData = async () => {
      try {
        setLoading(true);

        // Parse query and filters from URL
        const urlQuery = searchParams.get('q') || '';
        const urlFilters = parseFiltersFromURL();

        if (urlQuery || urlFilters.hasActiveFilters()) {
          // If there's a query or filters in URL, search with them
          const response = await SearchService.searchLabs(
            urlQuery,
            urlFilters.toJSON(),
            1,
            20
          );

          setSearchResults({
            results: response.results,
            total: response.total,
            page: response.page,
            hasMore: response.hasMore
          });
        } else {
          // Otherwise, load popular labs
          const popularLabs = await SearchService.getPopularLabs();
          setSearchResults({
            results: popularLabs.results,
            total: popularLabs.total,
            page: popularLabs.page,
            hasMore: popularLabs.hasMore
          });
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to search labs');
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    loadInitialData();
  }, [initialLoad, searchParams, parseFiltersFromURL]);

  // Auto-search when filters change (debounced)
  useEffect(() => {
    if (!initialLoad && (query.trim() || filters.hasActiveFilters())) {
      const timeoutId = setTimeout(() => {
        performSearch(query, filters, 1, false);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [query, filters, performSearch, initialLoad]);

  // Track page view on mount
  useEffect(() => {
    trackPageView('/search', {
      hasQuery: !!searchParams.get('q'),
      query: searchParams.get('q') || undefined,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
            onLabAdded={handleLabAdded}
            interestedProfessorIds={interestedProfessorIds}
            onInterestChange={handleInterestChange}
            isAuthenticated={isAuthenticated}
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
