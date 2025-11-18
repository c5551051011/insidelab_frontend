import React, { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { colors, spacing } from '../../theme';
import { SearchService } from '../../services/searchService';

const FilterSidebar = ({
  filters,
  onFiltersChange,
  isMobile = false,
  className = '',
  style = {}
}) => {
  const [filterOptions, setFilterOptions] = useState({
    countries: [],
    universities: [],
    departments: [],
    researchGroups: [],
    researchAreas: [],
    tags: [],
    sortOptions: []
  });
  const [selectedCountry, setSelectedCountry] = useState('');
  const [mappedUniversityIds, setMappedUniversityIds] = useState([]);

  // Convert university names/IDs from filters to IDs, and set selectedCountry
  useEffect(() => {
    if (filterOptions.universities.length > 0 && filters.universities.length > 0) {
      console.log('FilterSidebar - Original filters.universities:', filters.universities);
      console.log('FilterSidebar - Available universities:', filterOptions.universities.slice(0, 3));

      const ids = filters.universities.map(uniValue => {
        // If it's already a number (ID), use it
        if (typeof uniValue === 'number') {
          console.log(`University ${uniValue} is already a number`);
          return uniValue;
        }

        // Otherwise, try to find by name or convert string ID to number
        const matchingUni = filterOptions.universities.find(
          uni => uni.name === uniValue || String(uni.id) === uniValue || uni.id === Number(uniValue)
        );

        if (matchingUni) {
          console.log(`Matched university "${uniValue}" to ID ${matchingUni.id} (${matchingUni.name})`);
        } else {
          console.log(`Could not match university "${uniValue}"`);
        }

        return matchingUni ? matchingUni.id : uniValue;
      });

      console.log('FilterSidebar - Mapped university IDs:', ids);
      setMappedUniversityIds(ids);

      // Set country based on first selected university
      if (ids.length > 0) {
        const firstSelectedUni = filterOptions.universities.find(uni => ids.includes(uni.id));
        if (firstSelectedUni && firstSelectedUni.country) {
          setSelectedCountry(firstSelectedUni.country);
        }
      }
    }
  }, [filters.universities, filterOptions.universities]);

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await SearchService.getFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error('Error loading filter options:', error);
        // Use fallback options
        setFilterOptions(SearchService.getFallbackFilterOptions());
      }
    };

    loadFilterOptions();
  }, []);

  // Handle rating change
  const handleRatingChange = (rating) => {
    onFiltersChange({
      ...filters,
      rating: parseFloat(rating)
    });
  };

  // Handle university toggle
  const handleUniversityToggle = (universityId) => {
    const newUniversities = filters.universities.includes(universityId)
      ? filters.universities.filter(u => u !== universityId)
      : [...filters.universities, universityId];

    onFiltersChange({
      ...filters,
      universities: newUniversities
    });
  };

  // Handle research area toggle
  const handleResearchAreaToggle = (area) => {
    const newAreas = filters.researchAreas.includes(area)
      ? filters.researchAreas.filter(a => a !== area)
      : [...filters.researchAreas, area];

    onFiltersChange({
      ...filters,
      researchAreas: newAreas
    });
  };

  // Handle tag toggle
  const handleTagToggle = (tag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];

    onFiltersChange({
      ...filters,
      tags: newTags
    });
  };

  // Handle sort change
  const handleSortChange = (sortBy) => {
    onFiltersChange({
      ...filters,
      sortBy
    });
  };

  // Handle recruitment only toggle
  const handleRecruitmentToggle = (checked) => {
    onFiltersChange({
      ...filters,
      recruitmentOnly: checked
    });
  };

  // Handle country selection
  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    // Reset university selection when country changes
    onFiltersChange({
      ...filters,
      universities: []
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCountry('');
    onFiltersChange({
      rating: 0,
      universities: [],
      researchAreas: [],
      tags: [],
      sortBy: 'rating',
      recruitmentOnly: false
    });
  };

  // Get filtered universities based on selected country
  const getFilteredUniversities = () => {
    if (!selectedCountry) return filterOptions.universities;
    return filterOptions.universities.filter(uni =>
      uni.country === selectedCountry
    );
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return filters.rating > 0 ||
           filters.universities.length > 0 ||
           filters.researchAreas.length > 0 ||
           filters.tags.length > 0 ||
           filters.recruitmentOnly;
  };

  return (
    <div
      className={className}
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        padding: spacing[4],
        height: 'fit-content',
        ...style
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing[4]
        }}
      >
        <h3
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: colors.textPrimary,
            margin: 0,
            fontFamily: 'Inter'
          }}
        >
          Filters
          {hasActiveFilters() && (
            <span
              style={{
                marginLeft: spacing[2],
                fontSize: '12px',
                backgroundColor: colors.primary,
                color: 'white',
                padding: '2px 6px',
                borderRadius: '10px',
                fontWeight: '500'
              }}
            >
              {[
                filters.rating > 0 ? 1 : 0,
                filters.universities.length,
                filters.researchAreas.length,
                filters.tags.length,
                filters.recruitmentOnly ? 1 : 0
              ].reduce((a, b) => a + b)}
            </span>
          )}
        </h3>

        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '14px',
              color: colors.primary,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Inter',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colors.primary + '10';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <X size={14} />
            Clear All
          </button>
        )}
      </div>

      {/* Sort By */}
      <FilterSection title="Sort By">
        <select
          value={filters.sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          style={{
            width: '100%',
            padding: spacing[2],
            border: `1px solid ${colors.border}`,
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'Inter',
            backgroundColor: colors.background,
            color: colors.textPrimary,
            cursor: 'pointer'
          }}
        >
          {filterOptions.sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* Minimum Rating */}
      <FilterSection title="Minimum Rating">
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={filters.rating}
            onChange={(e) => handleRatingChange(e.target.value)}
            style={{
              flex: 1,
              height: '4px',
              background: colors.border,
              borderRadius: '2px',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star
              size={16}
              fill={filters.rating > 0 ? colors.warning : 'none'}
              color={colors.warning}
            />
            <span
              style={{
                fontSize: '14px',
                fontWeight: '500',
                minWidth: '30px',
                fontFamily: 'Inter',
                color: colors.textPrimary
              }}
            >
              {filters.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </FilterSection>

      {/* Recruitment Status */}
      <FilterSection title="Recruitment Status">
        <CheckboxItem
          label="Currently recruiting"
          checked={filters.recruitmentOnly}
          onChange={(checked) => handleRecruitmentToggle(checked)}
        />
      </FilterSection>

      {/* Countries */}
      <FilterSection title="Country">
        <select
          value={selectedCountry}
          onChange={(e) => handleCountryChange(e.target.value)}
          style={{
            width: '100%',
            padding: spacing[2],
            border: `1px solid ${colors.border}`,
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'Inter',
            backgroundColor: colors.background,
            color: colors.textPrimary,
            cursor: 'pointer'
          }}
        >
          <option value="">All Countries</option>
          {filterOptions.countries.map(country => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* Universities */}
      <FilterSection
        title="Universities"
        collapsible={isMobile}
        defaultExpanded={!isMobile}
      >
        <div style={{ maxHeight: isMobile ? '150px' : '200px', overflowY: 'auto' }}>
          {getFilteredUniversities().map(university => (
            <CheckboxItem
              key={university.id || university.name}
              label={university.name || university}
              checked={mappedUniversityIds.includes(university.id)}
              onChange={() => handleUniversityToggle(university.id || university)}
            />
          ))}
          {selectedCountry && getFilteredUniversities().length === 0 && (
            <div style={{
              fontSize: '14px',
              color: colors.textSecondary,
              fontFamily: 'Inter',
              padding: spacing[2],
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              No universities found in {selectedCountry}
            </div>
          )}
        </div>
      </FilterSection>

      {/* Research Areas */}
      <FilterSection
        title="Research Areas"
        collapsible={isMobile}
        defaultExpanded={!isMobile}
      >
        <div style={{ maxHeight: isMobile ? '150px' : '200px', overflowY: 'auto' }}>
          {filterOptions.researchAreas.map(area => (
            <CheckboxItem
              key={area}
              label={area}
              checked={filters.researchAreas.includes(area)}
              onChange={() => handleResearchAreaToggle(area)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Lab Characteristics */}
      <FilterSection
        title="Lab Characteristics"
        collapsible={isMobile}
        defaultExpanded={!isMobile}
      >
        <div style={{ maxHeight: isMobile ? '150px' : '200px', overflowY: 'auto' }}>
          {filterOptions.tags.map(tag => (
            <CheckboxItem
              key={tag}
              label={tag}
              checked={filters.tags.includes(tag)}
              onChange={() => handleTagToggle(tag)}
            />
          ))}
        </div>
      </FilterSection>
    </div>
  );
};

// Filter Section Component
const FilterSection = ({
  title,
  children,
  collapsible = false,
  defaultExpanded = true
}) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  return (
    <div style={{ marginBottom: spacing[4] }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing[2],
          cursor: collapsible ? 'pointer' : 'default'
        }}
        onClick={collapsible ? () => setExpanded(!expanded) : undefined}
      >
        <h4
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            margin: 0,
            fontFamily: 'Inter'
          }}
        >
          {title}
        </h4>
        {collapsible && (
          <span
            style={{
              fontSize: '12px',
              color: colors.textSecondary,
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          >
            ▼
          </span>
        )}
      </div>

      {(!collapsible || expanded) && (
        <div>
          {children}
        </div>
      )}
    </div>
  );
};

// Checkbox Item Component
const CheckboxItem = ({ label, checked, onChange }) => {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2],
        marginBottom: spacing[1],
        cursor: 'pointer',
        fontSize: '14px',
        color: colors.textSecondary,
        fontFamily: 'Inter',
        padding: '4px 0',
        transition: 'color 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.color = colors.textPrimary;
      }}
      onMouseLeave={(e) => {
        e.target.style.color = colors.textSecondary;
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          width: '16px',
          height: '16px',
          accentColor: colors.primary,
          cursor: 'pointer'
        }}
      />
      <span style={{ userSelect: 'none' }}>
        {label}
      </span>
    </label>
  );
};

export default FilterSidebar;