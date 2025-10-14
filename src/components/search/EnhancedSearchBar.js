import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, School, User, Beaker } from 'lucide-react';
import { colors, spacing } from '../../theme';
import { SearchService } from '../../services/searchService';

const EnhancedSearchBar = ({
  value,
  onChange,
  onSubmit,
  placeholder,
  isMobile = false,
  className = '',
  style = {}
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchIntent, setSearchIntent] = useState('general');
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // Get icon component based on intent
  const getIntentIcon = (intent) => {
    const iconMap = {
      university: School,
      professor: User,
      labName: Beaker,
      researchArea: Beaker,
      general: Search
    };
    return iconMap[intent] || Search;
  };

  // Debounced suggestion fetching
  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const results = await SearchService.getSearchSuggestions(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Detect search intent
    const intent = SearchService.detectSearchIntent(newValue);
    setSearchIntent(intent);

    // Reset selection
    setSelectedIndex(-1);

    // Debounce suggestion fetching
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSubmit(value);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSubmit(suggestion);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    if (value.length > 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle input blur (with delay for suggestion clicks)
  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 150);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Get intent info
  const intentInfo = SearchService.getSearchIntentInfo(searchIntent);
  const IconComponent = getIntentIcon(searchIntent);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        ...style
      }}
    >
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        {/* Search Icon and Intent Chip */}
        <div
          style={{
            position: 'absolute',
            left: spacing[4],
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            zIndex: 2,
            pointerEvents: 'none'
          }}
        >
          <IconComponent
            size={20}
            color={intentInfo.color}
          />
          {value && searchIntent !== 'general' && (
            <span
              style={{
                fontSize: '12px',
                color: intentInfo.color,
                backgroundColor: intentInfo.color + '1A',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: '500',
                fontFamily: 'Inter'
              }}
            >
              {intentInfo.label}
            </span>
          )}
        </div>

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || intentInfo.placeholder}
          style={{
            width: '100%',
            height: isMobile ? '48px' : '56px',
            padding: `0 ${spacing[4]} 0 ${value && searchIntent !== 'general' ? '120px' : '56px'}`,
            fontSize: isMobile ? '14px' : '16px',
            border: `2px solid ${colors.border}`,
            borderRadius: '12px',
            outline: 'none',
            backgroundColor: colors.surface,
            color: colors.textPrimary,
            fontFamily: 'Inter',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = colors.primary;
            e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
            handleFocus();
          }}
          onBlur={(e) => {
            e.target.style.borderColor = colors.border;
            e.target.style.boxShadow = 'none';
            handleBlur();
          }}
        />

        {/* Loading Indicator */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              right: spacing[4],
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              border: `2px solid ${colors.border}`,
              borderTop: `2px solid ${colors.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            marginTop: '4px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionSelect(suggestion)}
              style={{
                padding: spacing[3],
                cursor: 'pointer',
                borderBottom: index < suggestions.length - 1 ? `1px solid ${colors.border}` : 'none',
                backgroundColor: selectedIndex === index ? colors.backgroundLight : 'transparent',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div
                style={{
                  fontSize: '14px',
                  color: colors.textPrimary,
                  fontFamily: 'Inter'
                }}
              >
                {suggestion}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchBar;