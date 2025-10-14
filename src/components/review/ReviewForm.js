import React, { useState, useEffect, useCallback } from 'react';
import { Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { colors, spacing } from '../../theme';
import StarRating from './StarRating';
import AddUniversityModal from './AddUniversityModal';
import AddDepartmentModal from './AddDepartmentModal';
import AddResearchGroupModal from './AddResearchGroupModal';
import AddLabModal from './AddLabModal';
import { ReviewService } from '../../services/reviewService';
import { UniversityService } from '../../services/universityService';
import { ReviewFormData, POSITION_OPTIONS, DURATION_OPTIONS, VALIDATION_RULES } from '../../models/Review';

const ReviewForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  className = '',
  style = {}
}) => {
  // Form state
  const [formData, setFormData] = useState(new ReviewFormData(initialData));
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data state
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [researchGroups, setResearchGroups] = useState([]);
  const [labs, setLabs] = useState([]);
  const [ratingCategories, setRatingCategories] = useState([]);

  // Loading states
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingResearchGroups, setLoadingResearchGroups] = useState(false);

  // Modal states
  const [showAddUniversity, setShowAddUniversity] = useState(false);
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [showAddResearchGroup, setShowAddResearchGroup] = useState(false);
  const [showAddLab, setShowAddLab] = useState(false);

  // Lab search state
  const [labSearchQuery, setLabSearchQuery] = useState('');
  const [labSearchResults, setLabSearchResults] = useState([]);
  const [showLabSuggestions, setShowLabSuggestions] = useState(false);

  const isMobile = window.innerWidth < 768;

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load universities and rating categories
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [universitiesData, categoriesData] = await Promise.all([
        UniversityService.getAllUniversities(),
        ReviewService.getRatingCategories()
      ]);

      setUniversities(universitiesData);
      setRatingCategories(categoriesData);

      // Initialize category ratings
      const initialCategoryRatings = {};
      categoriesData.forEach(category => {
        initialCategoryRatings[category.name] = formData.categoryRatings[category.name] || 0;
      });
      updateFormData({ categoryRatings: initialCategoryRatings });
    } catch (error) {
      console.error('Error loading initial data:', error);
      setErrors({ general: 'Failed to load form data. Please refresh the page.' });
    } finally {
      setLoading(false);
    }
  };

  // Update form data
  const updateFormData = (updates) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      return new ReviewFormData(newData);
    });

    // Clear related errors
    if (updates && typeof updates === 'object') {
      const newErrors = { ...errors };
      Object.keys(updates).forEach(key => {
        delete newErrors[key];
      });
      setErrors(newErrors);
    }
  };

  // Load departments when university changes
  useEffect(() => {
    if (formData.university) {
      loadDepartments(formData.university);
      // Reset dependent fields
      updateFormData({
        department: '',
        researchGroup: '',
        lab: ''
      });
    } else {
      setDepartments([]);
      setResearchGroups([]);
      setLabs([]);
    }
  }, [formData.university]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load research groups when department changes
  useEffect(() => {
    if (formData.department) {
      loadResearchGroups(formData.department);
      loadLabs(); // Load labs for the department
      // Reset dependent fields
      updateFormData({
        researchGroup: '',
        lab: ''
      });
    } else {
      setResearchGroups([]);
      setLabs([]);
    }
  }, [formData.department]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load labs when research group changes
  useEffect(() => {
    if (formData.researchGroup) {
      loadLabs();
      updateFormData({ lab: '' });
    }
  }, [formData.researchGroup]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load departments
  const loadDepartments = async (universityId) => {
    setLoadingDepartments(true);
    try {
      const departmentsData = await ReviewService.getDepartmentsByUniversity(universityId);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error loading departments:', error);
      setErrors({ department: 'Failed to load departments' });
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Load research groups
  const loadResearchGroups = async (departmentId) => {
    setLoadingResearchGroups(true);
    try {
      const groupsData = await ReviewService.getResearchGroupsByDepartment(departmentId);
      setResearchGroups(groupsData);
    } catch (error) {
      console.error('Error loading research groups:', error);
      // Research groups are optional, so don't show error
    } finally {
      setLoadingResearchGroups(false);
    }
  };

  // Load labs
  const loadLabs = async () => {
    try {
      const labsData = await ReviewService.searchLabsForReview(
        labSearchQuery,
        formData.university,
        formData.department,
        formData.researchGroup || null
      );
      setLabs(labsData);
      setLabSearchResults(labsData);
    } catch (error) {
      console.error('Error loading labs:', error);
      setErrors({ lab: 'Failed to load labs' });
    }
  };

  // Debounced lab search
  const debouncedLabSearch = useCallback((query) => {
    const timeoutId = setTimeout(async () => {
      if (!query.trim()) {
        setLabSearchResults(labs);
        return;
      }

      try {
        const results = await ReviewService.searchLabsForReview(
          query,
          formData.university,
          formData.department,
          formData.researchGroup || null
        );
        setLabSearchResults(results);
      } catch (error) {
        console.error('Error searching labs:', error);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [labs, formData.university, formData.department, formData.researchGroup]);

  // Handle lab search
  const handleLabSearchChange = (query) => {
    setLabSearchQuery(query);
    setShowLabSuggestions(true);
    debouncedLabSearch(query);
  };

  // Handle lab selection
  const handleLabSelect = (lab) => {
    updateFormData({ lab: lab.id });
    setLabSearchQuery(lab.name || `${lab.professor_name} - ${lab.name}`);
    setShowLabSuggestions(false);
  };

  // Handle category rating change
  const handleCategoryRatingChange = (categoryName, rating) => {
    updateFormData({
      categoryRatings: {
        ...formData.categoryRatings,
        [categoryName]: rating
      }
    });
  };

  // Validate form
  const validateForm = () => {
    const validation = formData.validate();
    setErrors(validation.errors);
    return validation.isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const review = formData.toReview();
      await onSubmit(review);
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        ...style
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `3px solid ${colors.border}`,
          borderTop: `3px solid ${colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={className}
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        ...style
      }}
    >
      {/* Error Message */}
      {errors.general && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2],
          padding: spacing[3],
          backgroundColor: colors.error + '10',
          border: `1px solid ${colors.error}`,
          borderRadius: '8px',
          marginBottom: spacing[4]
        }}>
          <AlertCircle size={20} color={colors.error} />
          <span style={{
            fontSize: '14px',
            color: colors.error,
            fontFamily: 'Inter'
          }}>
            {errors.general}
          </span>
        </div>
      )}

      {/* University Selection */}
      <div style={{ marginBottom: spacing[4] }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: spacing[2],
          fontFamily: 'Inter'
        }}>
          University <span style={{ color: colors.error }}>*</span>
        </label>

        <select
          value={formData.university}
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'add_new') {
              setShowAddUniversity(true);
            } else {
              updateFormData({ university: value });
            }
          }}
          style={{
            width: '100%',
            height: '48px',
            padding: `0 ${spacing[4]}`,
            fontSize: '14px',
            border: `2px solid ${errors.university ? colors.error : colors.border}`,
            borderRadius: '8px',
            outline: 'none',
            backgroundColor: colors.background,
            color: colors.textPrimary,
            fontFamily: 'Inter',
            cursor: 'pointer'
          }}
        >
          <option value="">Select your university</option>
          {universities.map(university => (
            <option key={university.id || university} value={university.id || university}>
              {university.name || university}
            </option>
          ))}
          <option value="add_new" style={{ fontStyle: 'italic', color: colors.primary }}>
            + Add New University
          </option>
        </select>

        {errors.university && (
          <p style={{
            fontSize: '12px',
            color: colors.error,
            marginTop: spacing[1],
            fontFamily: 'Inter'
          }}>
            {errors.university}
          </p>
        )}
      </div>

      {/* Department Selection */}
      {formData.university && (
        <div style={{ marginBottom: spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[2],
            fontFamily: 'Inter'
          }}>
            Department <span style={{ color: colors.error }}>*</span>
          </label>

          <select
            value={formData.department}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'add_new') {
                setShowAddDepartment(true);
              } else {
                updateFormData({ department: value });
              }
            }}
            disabled={loadingDepartments || departments.length === 0}
            style={{
              width: '100%',
              height: '48px',
              padding: `0 ${spacing[4]}`,
              fontSize: '14px',
              border: `2px solid ${errors.department ? colors.error : colors.border}`,
              borderRadius: '8px',
              outline: 'none',
              backgroundColor: colors.background,
              color: colors.textPrimary,
              fontFamily: 'Inter',
              cursor: 'pointer',
              opacity: loadingDepartments ? 0.6 : 1
            }}
          >
            <option value="">
              {loadingDepartments ? 'Loading departments...' : 'Select your department'}
            </option>
            {departments.map(department => (
              <option key={department.id || department} value={department.id || department}>
                {department.name || department}
              </option>
            ))}
            {departments.length > 0 && (
              <option value="add_new" style={{ fontStyle: 'italic', color: colors.primary }}>
                + Add New Department
              </option>
            )}
          </select>

          {errors.department && (
            <p style={{
              fontSize: '12px',
              color: colors.error,
              marginTop: spacing[1],
              fontFamily: 'Inter'
            }}>
              {errors.department}
            </p>
          )}
        </div>
      )}

      {/* Research Group Selection (Optional) */}
      {formData.department && (
        <div style={{ marginBottom: spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[2],
            fontFamily: 'Inter'
          }}>
            Research Group (Optional)
          </label>

          <select
            value={formData.researchGroup}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'add_new') {
                setShowAddResearchGroup(true);
              } else {
                updateFormData({ researchGroup: value });
              }
            }}
            disabled={loadingResearchGroups}
            style={{
              width: '100%',
              height: '48px',
              padding: `0 ${spacing[4]}`,
              fontSize: '14px',
              border: `2px solid ${colors.border}`,
              borderRadius: '8px',
              outline: 'none',
              backgroundColor: colors.background,
              color: colors.textPrimary,
              fontFamily: 'Inter',
              cursor: 'pointer',
              opacity: loadingResearchGroups ? 0.6 : 1
            }}
          >
            <option value="">
              {loadingResearchGroups ? 'Loading research groups...' : 'Select research group (optional)'}
            </option>
            {researchGroups.map(group => (
              <option key={group.id || group} value={group.id || group}>
                {group.name || group}
              </option>
            ))}
            {researchGroups.length > 0 && (
              <option value="add_new" style={{ fontStyle: 'italic', color: colors.primary }}>
                + Add New Research Group
              </option>
            )}
          </select>
        </div>
      )}

      {/* Lab/Professor Selection */}
      {formData.department && (
        <div style={{ marginBottom: spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[2],
            fontFamily: 'Inter'
          }}>
            Lab/Professor <span style={{ color: colors.error }}>*</span>
          </label>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={labSearchQuery}
              onChange={(e) => handleLabSearchChange(e.target.value)}
              onFocus={() => setShowLabSuggestions(true)}
              onBlur={() => setTimeout(() => setShowLabSuggestions(false), 150)}
              placeholder="Search for lab or professor..."
              style={{
                width: '100%',
                height: '48px',
                padding: `0 ${spacing[4]}`,
                fontSize: '14px',
                border: `2px solid ${errors.lab ? colors.error : colors.border}`,
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: colors.background,
                color: colors.textPrimary,
                fontFamily: 'Inter'
              }}
            />

            {/* Lab Search Results */}
            {showLabSuggestions && labSearchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                zIndex: 10,
                marginTop: '4px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {labSearchResults.map((lab, index) => (
                  <div
                    key={lab.id || index}
                    onClick={() => handleLabSelect(lab)}
                    style={{
                      padding: spacing[3],
                      cursor: 'pointer',
                      borderBottom: index < labSearchResults.length - 1 ? `1px solid ${colors.border}` : 'none',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = colors.backgroundLight}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ fontSize: '14px', fontWeight: '500', color: colors.textPrimary }}>
                      {lab.professor_name}
                    </div>
                    <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                      {lab.name}
                    </div>
                  </div>
                ))}

                <div
                  onClick={() => setShowAddLab(true)}
                  style={{
                    padding: spacing[3],
                    cursor: 'pointer',
                    borderTop: `1px solid ${colors.border}`,
                    color: colors.primary,
                    fontSize: '14px',
                    fontStyle: 'italic',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[1]
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.backgroundLight}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <Plus size={14} />
                  Add New Lab
                </div>
              </div>
            )}
          </div>

          {errors.lab && (
            <p style={{
              fontSize: '12px',
              color: colors.error,
              marginTop: spacing[1],
              fontFamily: 'Inter'
            }}>
              {errors.lab}
            </p>
          )}
        </div>
      )}

      {/* Position Selection */}
      <div style={{ marginBottom: spacing[4] }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: spacing[2],
          fontFamily: 'Inter'
        }}>
          Your Position <span style={{ color: colors.error }}>*</span>
        </label>

        <select
          value={formData.position}
          onChange={(e) => updateFormData({ position: e.target.value })}
          style={{
            width: '100%',
            height: '48px',
            padding: `0 ${spacing[4]}`,
            fontSize: '14px',
            border: `2px solid ${errors.position ? colors.error : colors.border}`,
            borderRadius: '8px',
            outline: 'none',
            backgroundColor: colors.background,
            color: colors.textPrimary,
            fontFamily: 'Inter',
            cursor: 'pointer'
          }}
        >
          <option value="">Select your position</option>
          {POSITION_OPTIONS.map(position => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </select>

        {errors.position && (
          <p style={{
            fontSize: '12px',
            color: colors.error,
            marginTop: spacing[1],
            fontFamily: 'Inter'
          }}>
            {errors.position}
          </p>
        )}
      </div>

      {/* Duration Selection */}
      <div style={{ marginBottom: spacing[4] }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: spacing[2],
          fontFamily: 'Inter'
        }}>
          Duration in Lab <span style={{ color: colors.error }}>*</span>
        </label>

        <select
          value={formData.duration}
          onChange={(e) => updateFormData({ duration: e.target.value })}
          style={{
            width: '100%',
            height: '48px',
            padding: `0 ${spacing[4]}`,
            fontSize: '14px',
            border: `2px solid ${errors.duration ? colors.error : colors.border}`,
            borderRadius: '8px',
            outline: 'none',
            backgroundColor: colors.background,
            color: colors.textPrimary,
            fontFamily: 'Inter',
            cursor: 'pointer'
          }}
        >
          <option value="">Select duration</option>
          {DURATION_OPTIONS.map(duration => (
            <option key={duration} value={duration}>
              {duration}
            </option>
          ))}
        </select>

        {errors.duration && (
          <p style={{
            fontSize: '12px',
            color: colors.error,
            marginTop: spacing[1],
            fontFamily: 'Inter'
          }}>
            {errors.duration}
          </p>
        )}
      </div>

      {/* Overall Rating */}
      <div style={{ marginBottom: spacing[6] }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: spacing[3],
          fontFamily: 'Inter'
        }}>
          Overall Rating <span style={{ color: colors.error }}>*</span>
        </label>

        <StarRating
          value={formData.rating}
          onChange={(rating) => updateFormData({ rating })}
          size="large"
          showSlider={true}
          showDescription={true}
        />

        {errors.rating && (
          <p style={{
            fontSize: '12px',
            color: colors.error,
            marginTop: spacing[1],
            fontFamily: 'Inter'
          }}>
            {errors.rating}
          </p>
        )}
      </div>

      {/* Category Ratings */}
      {ratingCategories.length > 0 && (
        <div style={{ marginBottom: spacing[6] }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[4],
            fontFamily: 'Inter'
          }}>
            Category Ratings
          </h3>

          {ratingCategories.map(category => (
            <div key={category.id || category.name} style={{ marginBottom: spacing[4] }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.textPrimary,
                marginBottom: spacing[2],
                fontFamily: 'Inter'
              }}>
                {category.name}
                {category.description && (
                  <span style={{
                    fontSize: '12px',
                    color: colors.textSecondary,
                    fontWeight: '400',
                    marginLeft: spacing[1]
                  }}>
                    - {category.description}
                  </span>
                )}
              </label>

              <StarRating
                value={formData.categoryRatings[category.name] || 0}
                onChange={(rating) => handleCategoryRatingChange(category.name, rating)}
                size="medium"
                showSlider={true}
                showDescription={false}
              />
            </div>
          ))}
        </div>
      )}

      {/* Review Text */}
      <div style={{ marginBottom: spacing[4] }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: spacing[2],
          fontFamily: 'Inter'
        }}>
          Review <span style={{ color: colors.error }}>*</span>
          <span style={{
            fontSize: '12px',
            color: colors.textSecondary,
            fontWeight: '400',
            marginLeft: spacing[1]
          }}>
            ({formData.reviewText.length}/{VALIDATION_RULES.REVIEW_TEXT_MAX_LENGTH} characters)
          </span>
        </label>

        <textarea
          value={formData.reviewText}
          onChange={(e) => updateFormData({ reviewText: e.target.value })}
          placeholder="Share your experience in this lab. What was it like to work there? What should others know?"
          rows={6}
          style={{
            width: '100%',
            padding: spacing[3],
            fontSize: '14px',
            border: `2px solid ${errors.reviewText ? colors.error : colors.border}`,
            borderRadius: '8px',
            outline: 'none',
            backgroundColor: colors.background,
            color: colors.textPrimary,
            fontFamily: 'Inter',
            resize: 'vertical',
            minHeight: '120px'
          }}
        />

        {errors.reviewText && (
          <p style={{
            fontSize: '12px',
            color: colors.error,
            marginTop: spacing[1],
            fontFamily: 'Inter'
          }}>
            {errors.reviewText}
          </p>
        )}
      </div>

      {/* Pros */}
      <div style={{ marginBottom: spacing[4] }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: spacing[2],
          fontFamily: 'Inter'
        }}>
          Pros (Optional)
        </label>

        <textarea
          value={formData.pros}
          onChange={(e) => updateFormData({ pros: e.target.value })}
          placeholder="What are the positive aspects? (One per line)"
          rows={3}
          style={{
            width: '100%',
            padding: spacing[3],
            fontSize: '14px',
            border: `2px solid ${colors.border}`,
            borderRadius: '8px',
            outline: 'none',
            backgroundColor: colors.background,
            color: colors.textPrimary,
            fontFamily: 'Inter',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Cons */}
      <div style={{ marginBottom: spacing[6] }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: spacing[2],
          fontFamily: 'Inter'
        }}>
          Cons (Optional)
        </label>

        <textarea
          value={formData.cons}
          onChange={(e) => updateFormData({ cons: e.target.value })}
          placeholder="What could be improved? (One per line)"
          rows={3}
          style={{
            width: '100%',
            padding: spacing[3],
            fontSize: '14px',
            border: `2px solid ${colors.border}`,
            borderRadius: '8px',
            outline: 'none',
            backgroundColor: colors.background,
            color: colors.textPrimary,
            fontFamily: 'Inter',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Form Actions */}
      <div style={{
        display: 'flex',
        gap: spacing[3],
        justifyContent: 'flex-end',
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            style={{
              padding: `${spacing[3]} ${spacing[6]}`,
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'Inter',
              border: `2px solid ${colors.border}`,
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: colors.textSecondary,
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={submitting || !formData.isComplete()}
          style={{
            padding: `${spacing[3]} ${spacing[6]}`,
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'Inter',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: submitting || !formData.isComplete() ? colors.border : colors.primary,
            color: 'white',
            cursor: submitting || !formData.isComplete() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing[2]
          }}
        >
          {submitting ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              Submit Review
            </>
          )}
        </button>
      </div>

      {/* Modal Dialogs */}
      {showAddUniversity && (
        <AddUniversityModal
          onClose={() => setShowAddUniversity(false)}
          onAdd={(university) => {
            setUniversities(prev => [...prev, university]);
            updateFormData({ university: university.id });
            setShowAddUniversity(false);
          }}
        />
      )}

      {showAddDepartment && (
        <AddDepartmentModal
          universityId={formData.university}
          onClose={() => setShowAddDepartment(false)}
          onAdd={(department) => {
            setDepartments(prev => [...prev, department]);
            updateFormData({ department: department.id });
            setShowAddDepartment(false);
          }}
        />
      )}

      {showAddResearchGroup && (
        <AddResearchGroupModal
          departmentId={formData.department}
          onClose={() => setShowAddResearchGroup(false)}
          onAdd={(researchGroup) => {
            setResearchGroups(prev => [...prev, researchGroup]);
            updateFormData({ researchGroup: researchGroup.id });
            setShowAddResearchGroup(false);
          }}
        />
      )}

      {showAddLab && (
        <AddLabModal
          universityId={formData.university}
          departmentId={formData.department}
          researchGroupId={formData.researchGroup}
          onClose={() => setShowAddLab(false)}
          onAdd={(lab) => {
            setLabs(prev => [...prev, lab]);
            handleLabSelect(lab);
            setShowAddLab(false);
          }}
        />
      )}
    </form>
  );
};

export default ReviewForm;