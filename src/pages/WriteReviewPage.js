import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Search, X, Plus, Info, Shield } from 'lucide-react';
import { colors, spacing } from '../theme';
import Header from '../components/Header';
import UniversityDepartmentSelector from '../components/UniversityDepartmentSelector';
import StarRating from '../components/review/StarRating';
import { ReviewService } from '../services/reviewService';
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
  const [isFormPreFilled, setIsFormPreFilled] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuthenticationStatus();
  }, []);

  const checkAuthenticationStatus = async () => {
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
  };

  const loadRatingCategories = async () => {
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
  };

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

  const handleDepartmentSelected = (departmentId, departmentName) => {
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: spacing[2]
              }}>
                <label style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  fontFamily: 'Inter',
                  marginRight: spacing[2]
                }}>
                  Research Group
                </label>
                <div style={{
                  padding: `${spacing[1]} ${spacing[2]}`,
                  backgroundColor: colors.primary + '1A',
                  borderRadius: '12px',
                  border: `1px solid ${colors.primary}33`
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: colors.primary,
                    fontWeight: '500',
                    fontFamily: 'Inter'
                  }}>
                    Optional
                  </span>
                </div>
              </div>

              <select
                value={formData.researchGroupId}
                onChange={handleInputChange('researchGroupId')}
                disabled={!formData.departmentId}
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
                  cursor: formData.departmentId ? 'pointer' : 'not-allowed',
                  opacity: !formData.departmentId ? 0.6 : 1
                }}
              >
                <option value="">
                  {!formData.departmentId
                    ? 'Select a department first'
                    : 'Select a research group or add new (optional)'
                  }
                </option>
                <option value="___NONE___">No Research Group</option>
                {formData.departmentId && (
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
    </div>
  );
};

export default WriteReviewPage;