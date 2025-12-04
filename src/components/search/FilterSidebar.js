import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { colors, spacing } from '../../theme';
import { SearchService } from '../../services/searchService';
import { ApiService } from '../../services/apiService';

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
  const [baseResearchAreas, setBaseResearchAreas] = useState([]);
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
        setBaseResearchAreas(options.researchAreas || []);
      } catch (error) {
        console.error('Error loading filter options:', error);
        // Use fallback options
        setFilterOptions(SearchService.getFallbackFilterOptions());
        setBaseResearchAreas(SearchService.getFallbackFilterOptions().researchAreas || []);
      }
    };

    loadFilterOptions();
  }, []);

  // Load research areas based on selected departments
  useEffect(() => {
    const loadResearchAreas = async () => {
      if (!filters.departments || filters.departments.length === 0) {
        setFilterOptions(prev => ({ ...prev, researchAreas: baseResearchAreas }));
        return;
      }

      const departmentIds = filters.departments
        .map((dept) => {
          if (typeof dept === 'number') return dept;
          if (!dept) return null;
          const match = (filterOptions.departments || []).find(
            (d) => d.id === dept || String(d.id) === String(dept) || d.name === dept
          );
          return match ? match.id : null;
        })
        .filter((id) => Number.isFinite(id));

      if (departmentIds.length === 0) {
        setFilterOptions(prev => ({ ...prev, researchAreas: [] }));
        return;
      }

      try {
        const requests = departmentIds.map((deptId) =>
          ApiService.get(`/research-areas/?department=${deptId}&fields=minimal`)
        );
        const responses = await Promise.all(requests);
        const merged = responses.flatMap((resp) => resp.results || resp || []);
        const uniqueByName = [];
        const seen = new Set();
        merged.forEach((area) => {
          const name = area.name || area;
          if (name && !seen.has(name)) {
            seen.add(name);
            uniqueByName.push(name);
          }
        });

        setFilterOptions(prev => ({ ...prev, researchAreas: uniqueByName }));
      } catch (error) {
        console.error('Error loading research areas by department:', error);
        // Fallback to base list if fetch fails
        setFilterOptions(prev => ({ ...prev, researchAreas: baseResearchAreas }));
      }
    };

    loadResearchAreas();
  }, [filters.departments, baseResearchAreas, filterOptions.departments]);

  // Handle rating change
  const handleRatingChange = (rating) => {
    onFiltersChange({
      ...filters,
      rating: rating === filters.rating ? 0 : rating // Toggle off if same rating selected
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

  // Handle department toggle
  const handleDepartmentToggle = (departmentId) => {
    const newDepartments = filters.departments.includes(departmentId)
      ? filters.departments.filter(d => d !== departmentId)
      : [...filters.departments, departmentId];

    onFiltersChange({
      ...filters,
      departments: newDepartments
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
      departments: [],
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
           filters.departments.length > 0 ||
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
                filters.departments.length,
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
          {[1, 2, 3, 4, 5].map(rating => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                padding: 0,
                border: `1px solid ${filters.rating === rating ? colors.primary : colors.border}`,
                borderRadius: '50%',
                backgroundColor: filters.rating === rating ? colors.primary + '10' : 'transparent',
                color: filters.rating === rating ? colors.primary : colors.textSecondary,
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'Inter',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (filters.rating !== rating) {
                  e.target.style.backgroundColor = colors.border + '50';
                  e.target.style.color = colors.textPrimary;
                }
              }}
              onMouseLeave={(e) => {
                if (filters.rating !== rating) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = colors.textSecondary;
                }
              }}
            >
              {rating}
            </button>
          ))}
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

      {/* Departments */}
      <FilterSection
        title="Departments"
        collapsible={isMobile}
        defaultExpanded={!isMobile}
      >
        <div style={{ maxHeight: isMobile ? '150px' : '200px', overflowY: 'auto' }}>
          {filterOptions.departments.map(department => (
            <CheckboxItem
              key={department.id || department}
              label={department.name || department}
              checked={filters.departments.includes(department.id || department)}
              onChange={() => handleDepartmentToggle(department.id || department)}
            />
          ))}
          {filterOptions.departments.length === 0 && (
            <div style={{
              fontSize: '14px',
              color: colors.textSecondary,
              fontFamily: 'Inter',
              padding: spacing[2],
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              No departments available
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
