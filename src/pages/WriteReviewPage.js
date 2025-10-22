import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Search, X, Plus, Info, Shield } from 'lucide-react';
import { colors, spacing } from '../theme';
import Header from '../components/Header';
import UniversityDepartmentSelector from '../components/UniversityDepartmentSelector';
import StarRating from '../components/review/StarRating';
import { ReviewService } from '../services/reviewService';
import { UniversityService } from '../services/universityService';
import { AuthService } from '../services/authService';

const WriteReviewPage = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    universityId: '',
    universityName: '',
    departmentId: '',
    departmentName: '',
    researchGroupId: '',
    researchGroupName: '',
    labId: '',
    labName: '',
    position: 'PhD Student',
    duration: '1 year',
    overallRating: 4.0,
    reviewText: '',
    pros: '',
    cons: ''
  });

  // Category ratings state
  const [categoryRatings, setCategoryRatings] = useState({});
  const [ratingCategories, setRatingCategories] = useState([]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isFormPreFilled] = useState(false);
  const [showAddResearchGroupModal, setShowAddResearchGroupModal] = useState(false);

  // Research groups state
  const [researchGroups, setResearchGroups] = useState([]);
  const [isLoadingResearchGroups, setIsLoadingResearchGroups] = useState(false);

  const loadRatingCategories = useCallback(async () => {
    try {
      const categories = await ReviewService.getRatingCategories();

      if (categories.length === 0) {
        throw new Error('No rating categories returned');
      }

      // Handle both object format {name, description, ...} and string format
      const categoryNames = categories.map(category =>
        typeof category === 'string' ? category : category.name
      );

      setRatingCategories(categoryNames);
      setCategoryRatings(
        categoryNames.reduce((acc, categoryName) => ({
          ...acc,
          [categoryName]: 4.0
        }), {})
      );
      setIsLoadingCategories(false);

    } catch (error) {
      console.error('Error loading rating categories:', error);

      // Fallback categories
      const fallbackCategories = [
        'Research Environment',
        'Advisor Support',
        'Work-Life Balance',
        'Career Support',
        'Funding & Resources',
        'Lab Culture',
        'Mentorship Quality'
      ];

      setRatingCategories(fallbackCategories);
      setCategoryRatings(
        fallbackCategories.reduce((acc, category) => ({
          ...acc,
          [category]: 4.0
        }), {})
      );
      setIsLoadingCategories(false);
    }
  }, []);

  const checkAuthenticationStatus = useCallback(async () => {
    try {
      const isAuthenticated = AuthService.isAuthenticated();

      if (!isAuthenticated) {
        navigate('/sign-in');
        return;
      }

      setIsCheckingAuth(false);
      await loadRatingCategories();

    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/sign-in');
    }
  }, [navigate, loadRatingCategories]);

  // Check authentication on mount
  useEffect(() => {
    checkAuthenticationStatus();
  }, [checkAuthenticationStatus]);

  const handleUniversitySelected = (universityId, universityName) => {
    console.log('University selected:', universityId, universityName);
    setFormData(prev => ({
      ...prev,
      universityId: String(universityId),
      universityName: String(universityName),
      // Clear dependent fields
      departmentId: '',
      departmentName: '',
      researchGroupId: '',
      researchGroupName: '',
      labId: '',
      labName: ''
    }));
  };

  const handleDepartmentSelected = async (departmentId, departmentName) => {
    console.log('Department selected:', departmentId, departmentName);
    setFormData(prev => ({
      ...prev,
      departmentId: String(departmentId),
      departmentName: String(departmentName),
      // Clear dependent fields
      researchGroupId: '',
      researchGroupName: '',
      labId: '',
      labName: ''
    }));

    // Load research groups for the selected department
    if (departmentId) {
      setIsLoadingResearchGroups(true);
      try {
        const groups = await UniversityService.getResearchGroupsByDepartment(departmentId);
        setResearchGroups(groups);
        console.log('✅ Research groups loaded:', groups);
      } catch (error) {
        console.error('❌ Error loading research groups:', error);
        setResearchGroups([]);
      } finally {
        setIsLoadingResearchGroups(false);
      }
    } else {
      setResearchGroups([]);
    }
  };

  const handleResearchGroupChange = (e) => {
    const value = e.target.value;

    if (value === '___ADD_NEW___') {
      setShowAddResearchGroupModal(true);
      return;
    }

    if (value === '___NONE___' || value === '') {
      setFormData(prev => ({
        ...prev,
        researchGroupId: '',
        researchGroupName: '',
        // Clear dependent fields
        labId: '',
        labName: ''
      }));
    } else {
      // Handle existing research group selection
      const selectedGroup = researchGroups.find(group => group.id === value);
      setFormData(prev => ({
        ...prev,
        researchGroupId: value,
        researchGroupName: selectedGroup ? selectedGroup.name : '',
        // Clear dependent fields
        labId: '',
        labName: ''
      }));
    }
  };

  const handleAddResearchGroup = async (researchGroupData) => {
    try {
      console.log('🚀 Starting research group creation process...');
      console.log('📋 University ID:', formData.universityId);
      console.log('📋 Department ID:', formData.departmentId);
      console.log('📋 Department Name:', formData.departmentName);

      // First, ensure department is saved to the university
      let universityDepartmentId = null;

      try {
        // Check if department already exists in university
        console.log('🔍 Checking existing departments for university...');
        const existingDepartments = await UniversityService.getDepartmentsByUniversity(formData.universityId);
        console.log('📋 Existing departments:', existingDepartments);

        const universityDepartment = existingDepartments.find(dept =>
          dept.department_name === formData.departmentName ||
          dept.name === formData.departmentName ||
          String(dept.department) === String(formData.departmentId)
        );

        if (universityDepartment) {
          console.log('✅ Department found in university:', universityDepartment);
          universityDepartmentId = universityDepartment.id;
        } else {
          console.log('📝 Department not found in university, checking if we need to create university-department link...');

          // For now, we'll use the departmentId from form data
          // In a real scenario, you might need to create the university-department relationship
          if (formData.departmentId) {
            console.log('📝 Using existing department ID from form:', formData.departmentId);
            universityDepartmentId = parseInt(formData.departmentId);
          } else {
            throw new Error('No valid university department ID available');
          }
        }
      } catch (error) {
        console.error('❌ Error checking department:', error);
        // Use fallback department ID
        universityDepartmentId = parseInt(formData.departmentId);
      }

      console.log('📍 Final university_department ID to use:', universityDepartmentId);

      // Prepare research group data for API
      const apiData = {
        name: researchGroupData.name,
        university_department: universityDepartmentId,
        description: researchGroupData.description || '',
        website: researchGroupData.website || '',
        research_areas: researchGroupData.researchAreas || []
      };

      console.log('📤 Sending research group data:', apiData);

      // Create research group via API
      const newResearchGroup = await UniversityService.addResearchGroup(apiData);
      console.log('🎉 Research group created successfully:', newResearchGroup);

      // Set the new research group as selected
      setFormData(prev => ({
        ...prev,
        researchGroupId: newResearchGroup.id,
        researchGroupName: newResearchGroup.name,
        // Clear dependent fields
        labId: '',
        labName: ''
      }));

      // Close the modal
      setShowAddResearchGroupModal(false);

      alert(`Research Group "${researchGroupData.name}" created and saved successfully!`);

    } catch (error) {
      console.error('❌ Error creating research group:', error);

      // Show detailed error information
      if (error.response?.data) {
        console.error('❌ API Error Response:', error.response.data);
        throw new Error(`Failed to create research group: ${JSON.stringify(error.response.data)}`);
      } else {
        throw new Error(`Failed to create research group: ${error.message}`);
      }
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      overallRating: rating
    }));
  };

  const handleCategoryRatingChange = (category, rating) => {
    setCategoryRatings(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.universityId || !formData.departmentId || !formData.labId ||
        !formData.reviewText.trim() || formData.overallRating === 0) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        lab: parseInt(formData.labId),
        position: formData.position,
        duration: formData.duration,
        rating: formData.overallRating,
        ratings_input: categoryRatings,
        review_text: formData.reviewText.trim(),
        pros: formData.pros.split('\n').filter(line => line.trim()),
        cons: formData.cons.split('\n').filter(line => line.trim())
      };

      await ReviewService.submitReview(reviewData);

      // Show success and navigate
      alert('Review submitted successfully!');
      navigate('/');

    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit review: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return colors.success || '#10B981';
    if (rating >= 3.5) return colors.primary;
    if (rating >= 2.5) return '#F59E0B';
    return colors.error || '#EF4444';
  };

  const getRatingDescription = (rating) => {
    if (rating >= 4.5) return 'Excellent Experience';
    if (rating >= 3.5) return 'Good Experience';
    if (rating >= 2.5) return 'Average Experience';
    if (rating >= 1.5) return 'Below Average';
    return 'Poor Experience';
  };

  // Loading state
  if (isCheckingAuth || isLoadingCategories) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Header />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: spacing[4]
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: `4px solid ${colors.border}`,
            borderTop: `4px solid ${colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{
            color: colors.textSecondary,
            fontSize: '16px',
            fontFamily: 'Inter'
          }}>
            {isCheckingAuth ? 'Checking authentication...' : 'Loading rating categories...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background
    }}>
      <Header />

      <div style={{
        padding: spacing[6],
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '800px',
          width: '100%'
        }}>
          {/* Header Section */}
          <div style={{ marginBottom: spacing[8] }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: colors.textPrimary,
              margin: 0,
              marginBottom: spacing[2],
              fontFamily: 'Inter'
            }}>
              Write a Review
            </h1>

            <p style={{
              fontSize: '16px',
              color: colors.textSecondary,
              margin: 0,
              marginBottom: spacing[4],
              fontFamily: 'Inter'
            }}>
              {isFormPreFilled
                ? 'Share your honest experience to help future graduate students (form pre-filled)'
                : 'Share your honest experience to help future graduate students'
              }
            </p>

            {isFormPreFilled && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor: colors.success + '1A',
                borderRadius: '16px',
                border: `1px solid ${colors.success}33`,
                marginBottom: spacing[4]
              }}>
                <CheckCircle size={16} color={colors.success} style={{ marginRight: spacing[2] }} />
                <span style={{
                  fontSize: '12px',
                  color: colors.success,
                  fontWeight: '500',
                  fontFamily: 'Inter'
                }}>
                  Lab information pre-filled
                </span>
              </div>
            )}

            {/* Anonymous Notice */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: spacing[4],
              backgroundColor: colors.info + '1A',
              border: `1px solid ${colors.info}33`,
              borderRadius: '8px'
            }}>
              <Info size={20} color={colors.info} style={{ marginRight: spacing[3], flexShrink: 0 }} />
              <p style={{
                fontSize: '14px',
                color: colors.textPrimary,
                margin: 0,
                fontFamily: 'Inter'
              }}>
                Your review will be anonymous. Only your position and duration will be shown publicly.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitReview} style={{
            backgroundColor: colors.surface,
            borderRadius: '12px',
            padding: spacing[6],
            border: `1px solid ${colors.border}`
          }}>
            {/* University & Department Selection */}
            <UniversityDepartmentSelector
              selectedUniversityId={formData.universityId}
              selectedUniversityName={formData.universityName}
              selectedUniversityDepartmentId={formData.departmentId}
              onUniversitySelected={handleUniversitySelected}
              onDepartmentSelected={handleDepartmentSelected}
              isRequired={true}
            />

            {/* Research Group Selection */}
            <div style={{ marginBottom: spacing[6] }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: colors.textPrimary,
                marginBottom: spacing[2],
                fontFamily: 'Inter'
              }}>
                Research Group
              </label>

              <select
                value={formData.researchGroupId}
                onChange={handleResearchGroupChange}
                disabled={!formData.departmentId || isLoadingResearchGroups}
                style={{
                  width: '100%',
                  height: '56px',
                  padding: `0 ${spacing[4]}`,
                  paddingRight: '40px',
                  fontSize: '14px',
                  border: `2px solid ${colors.border}`,
                  borderRadius: '8px',
                  outline: 'none',
                  backgroundColor: colors.background,
                  color: colors.textPrimary,
                  fontFamily: 'Inter',
                  cursor: formData.departmentId && !isLoadingResearchGroups ? 'pointer' : 'not-allowed',
                  opacity: !formData.departmentId || isLoadingResearchGroups ? 0.6 : 1,
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3e%3cpath fill='%23666' d='m2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '12px'
                }}
              >
                <option value="">
                  {!formData.departmentId
                    ? 'Select a department first'
                    : isLoadingResearchGroups
                    ? 'Loading research groups...'
                    : 'Select a research group or add new (optional)'
                  }
                </option>
                <option value="___NONE___">No Research Group</option>

                {/* Show existing research groups */}
                {researchGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}

                {formData.departmentId && !isLoadingResearchGroups && (
                  <option value="___ADD_NEW___" style={{ fontStyle: 'italic', color: colors.primary }}>
                    + Add New Research Group
                  </option>
                )}
              </select>
            </div>

            {/* Lab/Professor Selection */}
            <div style={{ marginBottom: spacing[6] }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
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
                  value={formData.labName}
                  onChange={handleInputChange('labName')}
                  placeholder={formData.universityId
                    ? 'Search or type lab/professor name...'
                    : 'Please select a university first'
                  }
                  disabled={!formData.universityId}
                  style={{
                    width: '100%',
                    height: '56px',
                    padding: `0 ${spacing[4]} 0 ${spacing[4]}`,
                    paddingRight: '48px',
                    fontSize: '14px',
                    border: `2px solid ${colors.border}`,
                    borderRadius: '8px',
                    outline: 'none',
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                    fontFamily: 'Inter',
                    cursor: formData.universityId ? 'text' : 'not-allowed',
                    opacity: !formData.universityId ? 0.6 : 1
                  }}
                />

                <div style={{
                  position: 'absolute',
                  right: spacing[3],
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: formData.labName ? 'pointer' : 'default'
                }}>
                  {formData.labName ? (
                    <X
                      size={20}
                      color={colors.textSecondary}
                      onClick={() => setFormData(prev => ({ ...prev, labName: '', labId: '' }))}
                    />
                  ) : (
                    <Search size={20} color={colors.textSecondary} />
                  )}
                </div>
              </div>

              {/* Add New Lab Button */}
              {formData.universityId && formData.labName && (
                <div style={{
                  marginTop: spacing[2],
                  padding: spacing[4],
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{
                    fontSize: '14px',
                    color: colors.textSecondary,
                    margin: 0,
                    marginBottom: spacing[2],
                    fontFamily: 'Inter'
                  }}>
                    Lab/Professor not found
                  </p>
                  <button
                    type="button"
                    onClick={() => alert('Add new lab/professor functionality')}
                    style={{
                      padding: `${spacing[2]} ${spacing[4]}`,
                      fontSize: '14px',
                      fontWeight: '600',
                      fontFamily: 'Inter',
                      border: 'none',
                      borderRadius: '6px',
                      backgroundColor: colors.primary,
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Add New Lab/Professor
                  </button>
                </div>
              )}

              {(!formData.labId && formData.universityId) && (
                <p style={{
                  fontSize: '12px',
                  color: colors.error,
                  margin: 0,
                  marginTop: spacing[1],
                  fontFamily: 'Inter'
                }}>
                  Please select or add a lab/professor
                </p>
              )}
            </div>

            {/* Position and Duration */}
            <div style={{
              display: window.innerWidth < 600 ? 'block' : 'flex',
              gap: spacing[4],
              marginBottom: spacing[6]
            }}>
              {/* Position */}
              <div style={{
                flex: 1,
                marginBottom: window.innerWidth < 600 ? spacing[4] : 0
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  marginBottom: spacing[2],
                  fontFamily: 'Inter'
                }}>
                  Your Position <span style={{ color: colors.error }}>*</span>
                </label>
                <select
                  value={formData.position}
                  onChange={handleInputChange('position')}
                  style={{
                    width: '100%',
                    height: '56px',
                    padding: `0 ${spacing[4]}`,
                    fontSize: '14px',
                    border: `2px solid ${colors.border}`,
                    borderRadius: '8px',
                    outline: 'none',
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                    fontFamily: 'Inter',
                    cursor: 'pointer'
                  }}
                >
                  <option value="PhD Student">PhD Student</option>
                  <option value="MS Student">MS Student</option>
                  <option value="Undergrad">Undergraduate Student</option>
                  <option value="PostDoc">PostDoc</option>
                  <option value="Research Assistant">Research Assistant</option>
                </select>
              </div>

              {/* Duration */}
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  marginBottom: spacing[2],
                  fontFamily: 'Inter'
                }}>
                  Duration <span style={{ color: colors.error }}>*</span>
                </label>
                <select
                  value={formData.duration}
                  onChange={handleInputChange('duration')}
                  style={{
                    width: '100%',
                    height: '56px',
                    padding: `0 ${spacing[4]}`,
                    fontSize: '14px',
                    border: `2px solid ${colors.border}`,
                    borderRadius: '8px',
                    outline: 'none',
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                    fontFamily: 'Inter',
                    cursor: 'pointer'
                  }}
                >
                  <option value="< 6 months">Less than 6 months</option>
                  <option value="6 months">6 months</option>
                  <option value="1 year">1 year</option>
                  <option value="2 years">2 years</option>
                  <option value="3 years">3 years</option>
                  <option value="4+ years">4+ years</option>
                </select>
              </div>
            </div>

            {/* Overall Rating */}
            <div style={{ marginBottom: spacing[6] }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: colors.textPrimary,
                marginBottom: spacing[2],
                fontFamily: 'Inter'
              }}>
                Overall Rating <span style={{ color: colors.error }}>*</span>
              </label>

              <div style={{
                padding: spacing[5],
                backgroundColor: colors.background,
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
                boxShadow: `0 2px 8px ${colors.primary}1A`
              }}>
                {/* Interactive Star Rating */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing[4]
                }}>
                  <StarRating
                    rating={formData.overallRating}
                    onChange={handleRatingChange}
                    size={36}
                    interactive={true}
                  />

                  <div style={{
                    marginLeft: spacing[5],
                    padding: `${spacing[2]} ${spacing[4]}`,
                    backgroundColor: colors.primary + '1A',
                    borderRadius: '20px',
                    border: `1px solid ${colors.primary}33`
                  }}>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: colors.primary,
                      fontFamily: 'Inter'
                    }}>
                      {formData.overallRating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Rating Slider */}
                <div style={{ textAlign: 'center', marginBottom: spacing[3] }}>
                  <p style={{
                    fontSize: '12px',
                    color: colors.textSecondary,
                    margin: 0,
                    marginBottom: spacing[2],
                    fontFamily: 'Inter'
                  }}>
                    Fine-tune your rating
                  </p>
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.5"
                    value={formData.overallRating}
                    onChange={(e) => handleRatingChange(parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      height: '4px',
                      borderRadius: '2px',
                      background: `linear-gradient(to right, ${colors.primary} 0%, ${colors.primary} ${(formData.overallRating - 0.5) / 4.5 * 100}%, ${colors.border} ${(formData.overallRating - 0.5) / 4.5 * 100}%, ${colors.border} 100%)`,
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none'
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: spacing[1]
                  }}>
                    {['0.5', '1.0', '2.0', '3.0', '4.0', '5.0'].map(label => (
                      <span key={label} style={{
                        fontSize: '12px',
                        color: colors.textTertiary,
                        fontFamily: 'Inter'
                      }}>
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rating Description */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    padding: `${spacing[1]} ${spacing[3]}`,
                    backgroundColor: getRatingColor(formData.overallRating) + '1A',
                    borderRadius: '8px',
                    display: 'inline-block'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: getRatingColor(formData.overallRating),
                      fontFamily: 'Inter'
                    }}>
                      {getRatingDescription(formData.overallRating)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Ratings */}
            <div style={{ marginBottom: spacing[6] }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: colors.textPrimary,
                marginBottom: spacing[2],
                fontFamily: 'Inter'
              }}>
                Category Ratings
              </h3>
              <p style={{
                fontSize: '14px',
                color: colors.textSecondary,
                marginBottom: spacing[4],
                fontFamily: 'Inter'
              }}>
                Rate different aspects of your experience
              </p>

              {ratingCategories.map((category) => (
                <div key={category} style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: spacing[4],
                  gap: spacing[4]
                }}>
                  {/* Category Label */}
                  <div style={{
                    flex: '0 0 200px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.textPrimary,
                    fontFamily: 'Inter'
                  }}>
                    {category}
                  </div>

                  {/* Star Display */}
                  <StarRating
                    rating={categoryRatings[category] || 4.0}
                    size={20}
                    interactive={false}
                  />

                  {/* Rating Value */}
                  <div style={{
                    flex: '0 0 48px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      padding: `${spacing[1]} ${spacing[3]}`,
                      backgroundColor: colors.primary + '1A',
                      borderRadius: '16px',
                      border: `1px solid ${colors.primary}33`
                    }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: colors.primary,
                        fontFamily: 'Inter'
                      }}>
                        {(categoryRatings[category] || 4.0).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Rating Slider */}
                  <div style={{ flex: '1', maxWidth: '300px' }}>
                    <input
                      type="range"
                      min="0.5"
                      max="5.0"
                      step="0.5"
                      value={categoryRatings[category] || 4.0}
                      onChange={(e) => handleCategoryRatingChange(category, parseFloat(e.target.value))}
                      style={{
                        width: '100%',
                        height: '4px',
                        borderRadius: '2px',
                        background: `linear-gradient(to right, ${colors.primary} 0%, ${colors.primary} ${((categoryRatings[category] || 4.0) - 0.5) / 4.5 * 100}%, ${colors.border} ${((categoryRatings[category] || 4.0) - 0.5) / 4.5 * 100}%, ${colors.border} 100%)`,
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Review Text */}
            <div style={{ marginBottom: spacing[6] }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: colors.textPrimary,
                marginBottom: spacing[2],
                fontFamily: 'Inter'
              }}>
                Your Review <span style={{ color: colors.error }}>*</span>
              </label>

              <p style={{
                fontSize: '14px',
                color: colors.textSecondary,
                marginBottom: spacing[2],
                fontFamily: 'Inter'
              }}>
                Share your honest experience and insights
              </p>

              <textarea
                value={formData.reviewText}
                onChange={handleInputChange('reviewText')}
                placeholder="Describe your experience in the lab, the research environment, mentorship quality, and any other relevant details..."
                rows={6}
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
                  resize: 'vertical',
                  minHeight: '120px'
                }}
              />
            </div>

            {/* Pros and Cons */}
            <div style={{
              display: window.innerWidth < 600 ? 'block' : 'flex',
              gap: spacing[4],
              marginBottom: spacing[6]
            }}>
              {/* Pros */}
              <div style={{
                flex: 1,
                marginBottom: window.innerWidth < 600 ? spacing[4] : 0
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.success,
                  marginBottom: spacing[2],
                  fontFamily: 'Inter'
                }}>
                  Pros
                </label>
                <textarea
                  value={formData.pros}
                  onChange={handleInputChange('pros')}
                  placeholder="List the positive aspects (one per line)"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: spacing[3],
                    fontSize: '14px',
                    border: `2px solid ${colors.success}33`,
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
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.error,
                  marginBottom: spacing[2],
                  fontFamily: 'Inter'
                }}>
                  Cons
                </label>
                <textarea
                  value={formData.cons}
                  onChange={handleInputChange('cons')}
                  placeholder="List any drawbacks (one per line)"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: spacing[3],
                    fontSize: '14px',
                    border: `2px solid ${colors.error}33`,
                    borderRadius: '8px',
                    outline: 'none',
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                    fontFamily: 'Inter',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            {/* Community Guidelines */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: spacing[4],
              backgroundColor: colors.warning + '1A',
              border: `1px solid ${colors.warning}33`,
              borderRadius: '8px',
              marginBottom: spacing[6]
            }}>
              <Shield size={20} color={colors.warning} style={{ marginRight: spacing[3], flexShrink: 0 }} />
              <div>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  margin: 0,
                  marginBottom: spacing[1],
                  fontFamily: 'Inter'
                }}>
                  Community Guidelines
                </h4>
                <p style={{
                  fontSize: '12px',
                  color: colors.textSecondary,
                  margin: 0,
                  fontFamily: 'Inter',
                  lineHeight: '1.4'
                }}>
                  Reviews must be honest, respectful, and based on personal experience. Inappropriate content will be removed.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: `${spacing[4]} ${spacing[6]}`,
                fontSize: '16px',
                fontWeight: '600',
                fontFamily: 'Inter',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: isSubmitting ? colors.border : colors.primary,
                color: 'white',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2],
                boxShadow: isSubmitting ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              {isSubmitting ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Submitting Review...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Add Research Group Modal */}
      {showAddResearchGroupModal && (
        <AddResearchGroupModal
          universityName={formData.universityName}
          departmentName={formData.departmentName}
          onAdd={handleAddResearchGroup}
          onCancel={() => setShowAddResearchGroupModal(false)}
        />
      )}
    </div>
  );
};

// Add Research Group Modal Component
const AddResearchGroupModal = ({ universityName, departmentName, onAdd, onCancel }) => {
  const [researchGroupData, setResearchGroupData] = useState({
    name: '',
    description: '',
    website: '',
    researchAreas: []
  });
  const [newResearchArea, setNewResearchArea] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!researchGroupData.name.trim()) {
      alert('Please enter a research group name');
      return;
    }

    setLoading(true);

    try {
      await onAdd(researchGroupData);
    } catch (error) {
      alert(`Failed to add research group: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addResearchArea = () => {
    if (newResearchArea.trim() && !researchGroupData.researchAreas.includes(newResearchArea.trim())) {
      setResearchGroupData(prev => ({
        ...prev,
        researchAreas: [...prev.researchAreas, newResearchArea.trim()]
      }));
      setNewResearchArea('');
    }
  };

  const removeResearchArea = (area) => {
    setResearchGroupData(prev => ({
      ...prev,
      researchAreas: prev.researchAreas.filter(a => a !== area)
    }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: spacing[4]
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: spacing[6],
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: colors.textPrimary,
          marginBottom: spacing[2],
          fontFamily: 'Inter'
        }}>
          Add New Research Group
        </h3>

        <div style={{
          fontSize: '14px',
          color: colors.textSecondary,
          marginBottom: spacing[4],
          fontFamily: 'Inter'
        }}>
          <p style={{ margin: 0, marginBottom: spacing[1] }}>
            University: {universityName}
          </p>
          <p style={{ margin: 0 }}>
            Department: {departmentName}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Research Group Name */}
          <div style={{ marginBottom: spacing[4] }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[2],
              fontFamily: 'Inter'
            }}>
              Research Group Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Machine Learning Lab"
              value={researchGroupData.name}
              onChange={(e) => setResearchGroupData(prev => ({ ...prev, name: e.target.value }))}
              required
              style={{
                width: '100%',
                height: '48px',
                padding: `0 ${spacing[3]}`,
                fontSize: '14px',
                border: `2px solid ${colors.border}`,
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: colors.background,
                color: colors.textPrimary,
                fontFamily: 'Inter'
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: spacing[4] }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[2],
              fontFamily: 'Inter'
            }}>
              Description
            </label>
            <textarea
              placeholder="Brief description of research group"
              value={researchGroupData.description}
              onChange={(e) => setResearchGroupData(prev => ({ ...prev, description: e.target.value }))}
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

          {/* Website */}
          <div style={{ marginBottom: spacing[4] }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[2],
              fontFamily: 'Inter'
            }}>
              Website (Optional)
            </label>
            <input
              type="url"
              placeholder="https://example.com/group"
              value={researchGroupData.website}
              onChange={(e) => setResearchGroupData(prev => ({ ...prev, website: e.target.value }))}
              style={{
                width: '100%',
                height: '48px',
                padding: `0 ${spacing[3]}`,
                fontSize: '14px',
                border: `2px solid ${colors.border}`,
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: colors.background,
                color: colors.textPrimary,
                fontFamily: 'Inter'
              }}
            />
          </div>

          {/* Research Areas */}
          <div style={{ marginBottom: spacing[4] }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[2],
              fontFamily: 'Inter'
            }}>
              Research Areas
            </label>

            <div style={{
              display: 'flex',
              gap: spacing[2],
              marginBottom: spacing[2]
            }}>
              <input
                type="text"
                placeholder="Add research area"
                value={newResearchArea}
                onChange={(e) => setNewResearchArea(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addResearchArea();
                  }
                }}
                style={{
                  flex: 1,
                  height: '40px',
                  padding: `0 ${spacing[3]}`,
                  fontSize: '14px',
                  border: `2px solid ${colors.border}`,
                  borderRadius: '8px',
                  outline: 'none',
                  backgroundColor: colors.background,
                  color: colors.textPrimary,
                  fontFamily: 'Inter'
                }}
              />
              <button
                type="button"
                onClick={addResearchArea}
                style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: 'Inter',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: colors.primary,
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[1]
                }}
              >
                <Plus size={16} />
                Add
              </button>
            </div>

            {/* Research Areas Tags */}
            {researchGroupData.researchAreas.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: spacing[2]
              }}>
                {researchGroupData.researchAreas.map((area, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: `${spacing[1]} ${spacing[2]}`,
                      backgroundColor: colors.primary + '1A',
                      borderRadius: '16px',
                      border: `1px solid ${colors.primary}33`
                    }}
                  >
                    <span style={{
                      fontSize: '12px',
                      color: colors.primary,
                      fontFamily: 'Inter',
                      marginRight: spacing[1]
                    }}>
                      {area}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeResearchArea(area)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <X size={14} color={colors.primary} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: spacing[3], justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                backgroundColor: 'transparent',
                color: colors.textSecondary,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: 'Inter'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                backgroundColor: loading ? colors.textTertiary : colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter'
              }}
            >
              {loading ? 'Adding...' : 'Add Research Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WriteReviewPage;