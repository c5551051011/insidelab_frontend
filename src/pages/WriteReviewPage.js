import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Star, Building } from 'lucide-react';
import { colors, spacing } from '../theme';
import Header from '../components/Header';
import { FormInput } from '../components/FormInput';
import StarRating from '../components/review/StarRating';
import { ReviewService } from '../services/reviewService';
import { UniversityService } from '../services/universityService';
import { AuthService } from '../services/authService';

const WriteReviewPage = () => {
  const navigate = useNavigate();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    university: '',
    department: '',
    labName: '',
    professorName: '',
    position: '',
    duration: '',
    overallRating: 0,
    researchQualityRating: 0,
    workLifeBalanceRating: 0,
    mentorshipRating: 0,
    careerDevelopmentRating: 0,
    compensationRating: 0,
    cultureRating: 0,
    reviewTitle: '',
    reviewContent: '',
    pros: '',
    cons: '',
    advice: ''
  });

  // Dropdown data
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Modal states
  const [showAddUniversity, setShowAddUniversity] = useState(false);
  const [showAddDepartment, setShowAddDepartment] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = AuthService.isAuthenticated();
  const isMobile = window.innerWidth < 768;

  // Load data on component mount
  useEffect(() => {
    loadUniversities();
    loadAllDepartments();
  }, []);

  const loadUniversities = async () => {
    try {
      const universitiesList = await UniversityService.getAllUniversities();
      setUniversities(universitiesList);
    } catch (error) {
      console.error('Error loading universities:', error);
    }
  };

  const loadAllDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const departmentsList = await UniversityService.getAllDepartments();

      // Process departments safely
      const processedDepartments = departmentsList.map((dept, index) => {
        if (!dept) {
          return {
            id: `fallback-${index}`,
            name: 'Unknown Department',
            department_name: 'Unknown Department'
          };
        }

        if (typeof dept === 'string') {
          return {
            id: dept,
            name: dept,
            department_name: dept
          };
        }

        const safeId = String(dept.id || `dept-${index}`);
        const safeName = String(dept.department_name || dept.name || dept.display_name || 'Unknown Department');

        return {
          id: safeId,
          name: safeName,
          department_name: safeName
        };
      });

      setDepartments(processedDepartments);
    } catch (error) {
      console.error('Error loading all departments:', error);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleAddUniversity = async (universityData) => {
    try {
      const newUniversity = await UniversityService.addUniversity(universityData);
      setUniversities(prev => [...prev, newUniversity]);
      setFormData(prev => ({ ...prev, university: newUniversity.id }));
      setShowAddUniversity(false);
      await loadAllDepartments();
    } catch (error) {
      console.error('Error adding university:', error);
      alert('Failed to add university. Please try again.');
    }
  };

  const handleAddDepartment = async (departmentData) => {
    try {
      // Check if department already exists
      const existingDepartment = departments.find(dept => {
        const deptName = dept?.department_name || dept?.name || '';
        return deptName === departmentData.name;
      });

      if (existingDepartment) {
        const safeExistingId = String(existingDepartment.id);
        setFormData(prev => ({ ...prev, department: safeExistingId }));
        setShowAddDepartment(false);
        return;
      }

      // Add new department
      const response = await ReviewService.addDepartment(formData.university, {
        department_name: departmentData.name
      });

      const newDepartment = {
        id: response?.id || response?.department?.id || Date.now().toString(),
        name: response?.department_name || response?.name || departmentData.name,
        department_name: response?.department_name || response?.name || departmentData.name,
        university_id: formData.university
      };

      setDepartments(prev => [...prev, newDepartment]);
      const safeDeptId = String(newDepartment.id);
      setFormData(prev => ({ ...prev, department: safeDeptId }));
      setShowAddDepartment(false);

    } catch (error) {
      console.error('Error adding department:', error);
      if (error.message && error.message.includes('non_field_errors')) {
        await loadAllDepartments();
        const existingDept = departments.find(dept => {
          const deptName = dept?.department_name || dept?.name || '';
          return deptName === departmentData.name;
        });
        if (existingDept) {
          const safeExistingDeptId = String(existingDept.id);
          setFormData(prev => ({ ...prev, department: safeExistingDeptId }));
          setShowAddDepartment(false);
          return;
        }
      }
      alert('Failed to add department. Please try again.');
    }
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;

    if (field === 'university' && value === 'Add New University') {
      setShowAddUniversity(true);
      return;
    }

    if (field === 'department' && value === 'Add New Department') {
      setShowAddDepartment(true);
      return;
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRatingChange = (field) => (rating) => {
    setFormData(prev => ({
      ...prev,
      [field]: rating
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);

    try {
      // Validate required fields
      if (!formData.university || !formData.department || !formData.labName ||
          !formData.professorName || !formData.reviewTitle || !formData.reviewContent) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.overallRating === 0) {
        throw new Error('Please provide an overall rating');
      }

      // Submit the review
      const reviewData = {
        ...formData,
        university_id: formData.university,
        department_id: formData.department
      };

      await ReviewService.submitReview(reviewData);
      setSubmitSuccess(true);

      // Redirect after success
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[4]
      }}>
        <div style={{
          backgroundColor: colors.surface,
          borderRadius: '12px',
          padding: spacing[8],
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%'
        }}>
          <AlertCircle size={48} color={colors.warning} style={{ marginBottom: spacing[4] }} />
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[4],
            fontFamily: 'Inter'
          }}>
            Authentication Required
          </h2>
          <p style={{
            fontSize: '16px',
            color: colors.textSecondary,
            marginBottom: spacing[6],
            fontFamily: 'Inter',
            lineHeight: '1.5'
          }}>
            You need to be logged in to write a review. Please sign in to continue.
          </p>
          <div style={{
            display: 'flex',
            gap: spacing[3],
            justifyContent: 'center'
          }}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: `${spacing[3]} ${spacing[4]}`,
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: 'Inter',
                border: `2px solid ${colors.border}`,
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: colors.textSecondary,
                cursor: 'pointer'
              }}
            >
              Go Home
            </button>
            <button
              onClick={() => navigate('/sign-in')}
              style={{
                padding: `${spacing[3]} ${spacing[4]}`,
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'Inter',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: colors.primary,
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show success message
  if (submitSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[4]
      }}>
        <div style={{
          backgroundColor: colors.surface,
          borderRadius: '12px',
          padding: spacing[8],
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%'
        }}>
          <CheckCircle size={48} color={colors.success} style={{ marginBottom: spacing[4] }} />
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[4],
            fontFamily: 'Inter'
          }}>
            Review Submitted!
          </h2>
          <p style={{
            fontSize: '16px',
            color: colors.textSecondary,
            marginBottom: spacing[6],
            fontFamily: 'Inter',
            lineHeight: '1.5'
          }}>
            Thank you for sharing your experience. Your review will help others make informed decisions about their research opportunities.
          </p>
          <p style={{
            fontSize: '14px',
            color: colors.textTertiary,
            fontFamily: 'Inter'
          }}>
            Redirecting you back to the home page...
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
      {/* Header */}
      <div style={{
        backgroundColor: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        padding: spacing[4]
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: spacing[4]
        }}>
          <button
            onClick={handleCancel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[2]} ${spacing[3]}`,
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'Inter',
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: colors.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: colors.textPrimary,
              margin: 0,
              fontFamily: 'Inter'
            }}>
              Write a Review
            </h1>
            <p style={{
              fontSize: '14px',
              color: colors.textSecondary,
              margin: 0,
              marginTop: spacing[1],
              fontFamily: 'Inter'
            }}>
              Share your research experience to help others
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: spacing[6]
      }}>
        {/* Error Message */}
        {submitError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            padding: spacing[4],
            backgroundColor: colors.error + '10',
            border: `1px solid ${colors.error}`,
            borderRadius: '8px',
            marginBottom: spacing[6]
          }}>
            <AlertCircle size={20} color={colors.error} />
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: colors.error,
                margin: 0,
                fontFamily: 'Inter'
              }}>
                Failed to Submit Review
              </h3>
              <p style={{
                fontSize: '14px',
                color: colors.error,
                margin: 0,
                marginTop: spacing[1],
                fontFamily: 'Inter'
              }}>
                {submitError}
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div style={{
          backgroundColor: colors.surface,
          borderRadius: '12px',
          padding: spacing[6],
          marginBottom: spacing[6],
          border: `1px solid ${colors.border}`
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: colors.textPrimary,
            margin: 0,
            marginBottom: spacing[3],
            fontFamily: 'Inter'
          }}>
            Review Guidelines
          </h2>
          <ul style={{
            fontSize: '14px',
            color: colors.textSecondary,
            fontFamily: 'Inter',
            lineHeight: '1.6',
            margin: 0,
            paddingLeft: spacing[4]
          }}>
            <li style={{ marginBottom: spacing[2] }}>
              Be honest and constructive in your feedback
            </li>
            <li style={{ marginBottom: spacing[2] }}>
              Focus on your personal experience and specific details
            </li>
            <li style={{ marginBottom: spacing[2] }}>
              Respect privacy - avoid sharing sensitive information
            </li>
            <li style={{ marginBottom: spacing[2] }}>
              Your review will be anonymous to protect your privacy
            </li>
            <li>
              Provide ratings across different categories to help others understand the full picture
            </li>
          </ul>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmitReview} style={{
          backgroundColor: colors.surface,
          borderRadius: '12px',
          padding: spacing[6],
          border: `1px solid ${colors.border}`
        }}>
          {/* University Selection */}
          <div style={{ marginBottom: spacing[4] }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '500',
              color: colors.textPrimary,
              marginBottom: spacing[2],
              fontFamily: 'Inter'
            }}>
              University <span style={{ color: colors.error }}>*</span>
            </label>
            <select
              value={formData.university}
              onChange={handleInputChange('university')}
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
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3e%3cpath fill='%23666' d='m2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '12px'
              }}
            >
              <option value="">Select your university</option>
              {universities.map(university => (
                <option key={university.id || university} value={university.id || university}>
                  {university.name || university}
                </option>
              ))}
              <option value="Add New University" style={{ fontStyle: 'italic', color: colors.primary }}>
                + Add New University
              </option>
            </select>
          </div>

          {/* Department Selection */}
          {formData.university && (
            <div style={{ marginBottom: spacing[4] }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '500',
                color: colors.textPrimary,
                marginBottom: spacing[2],
                fontFamily: 'Inter'
              }}>
                Department <span style={{ color: colors.error }}>*</span>
              </label>
              <select
                value={formData.department}
                onChange={handleInputChange('department')}
                disabled={loadingDepartments}
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
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3e%3cpath fill='%23666' d='m2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '12px',
                  opacity: loadingDepartments ? 0.6 : 1
                }}
              >
                <option value="">
                  {loadingDepartments ? 'Loading departments...' : 'Select your department'}
                </option>
                {departments.map((department, index) => {
                  const deptId = String(department?.id || `unknown-${index}`);
                  const deptName = String(department?.department_name || department?.name || 'Unknown Department');
                  return (
                    <option key={deptId} value={deptId}>
                      {deptName}
                    </option>
                  );
                })}
                {formData.university && formData.university !== 'Add New University' && (
                  <option value="Add New Department" style={{ fontStyle: 'italic', color: colors.primary }}>
                    + Add New Department
                  </option>
                )}
              </select>
            </div>
          )}

          {/* Lab Name */}
          <div style={{ marginBottom: spacing[4] }}>
            <FormInput
              label="Lab Name"
              type="text"
              placeholder="Enter the lab name"
              value={formData.labName}
              onChange={handleInputChange('labName')}
              required={true}
            />
          </div>

          {/* Professor Name */}
          <div style={{ marginBottom: spacing[4] }}>
            <FormInput
              label="Professor Name"
              type="text"
              placeholder="Enter the professor's name"
              value={formData.professorName}
              onChange={handleInputChange('professorName')}
              required={true}
            />
          </div>

          {/* Position */}
          <div style={{ marginBottom: spacing[4] }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '500',
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
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3e%3cpath fill='%23666' d='m2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '12px'
              }}
            >
              <option value="">Select your position</option>
              <option value="Undergraduate Researcher">Undergraduate Researcher</option>
              <option value="Graduate Student (MS)">Graduate Student (MS)</option>
              <option value="Graduate Student (PhD)">Graduate Student (PhD)</option>
              <option value="Postdoc">Postdoc</option>
              <option value="Research Assistant">Research Assistant</option>
              <option value="Visiting Researcher">Visiting Researcher</option>
              <option value="Lab Technician">Lab Technician</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Duration */}
          <div style={{ marginBottom: spacing[4] }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '500',
              color: colors.textPrimary,
              marginBottom: spacing[2],
              fontFamily: 'Inter'
            }}>
              Duration in Lab <span style={{ color: colors.error }}>*</span>
            </label>
            <select
              value={formData.duration}
              onChange={handleInputChange('duration')}
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
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3e%3cpath fill='%23666' d='m2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '12px'
              }}
            >
              <option value="">Select duration</option>
              <option value="Less than 6 months">Less than 6 months</option>
              <option value="6 months - 1 year">6 months - 1 year</option>
              <option value="1 - 2 years">1 - 2 years</option>
              <option value="2 - 3 years">2 - 3 years</option>
              <option value="3 - 4 years">3 - 4 years</option>
              <option value="More than 4 years">More than 4 years</option>
            </select>
          </div>

          {/* Overall Rating */}
          <div style={{ marginBottom: spacing[6] }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[3],
              fontFamily: 'Inter'
            }}>
              Overall Rating *
            </label>
            <StarRating
              value={formData.overallRating}
              onChange={handleRatingChange('overallRating')}
              size={24}
              showValue={true}
            />
          </div>

          {/* Category Ratings */}
          <div style={{ marginBottom: spacing[6] }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[4],
              fontFamily: 'Inter'
            }}>
              Category Ratings
            </h3>

            {[
              { key: 'researchQualityRating', label: 'Research Quality' },
              { key: 'workLifeBalanceRating', label: 'Work-Life Balance' },
              { key: 'mentorshipRating', label: 'Mentorship' },
              { key: 'careerDevelopmentRating', label: 'Career Development' },
              { key: 'compensationRating', label: 'Compensation' },
              { key: 'cultureRating', label: 'Lab Culture' }
            ].map(({ key, label }) => (
              <div key={key} style={{ marginBottom: spacing[4] }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: colors.textPrimary,
                  marginBottom: spacing[2],
                  fontFamily: 'Inter'
                }}>
                  {label}
                </label>
                <StarRating
                  value={formData[key]}
                  onChange={handleRatingChange(key)}
                  size={20}
                  showValue={true}
                />
              </div>
            ))}
          </div>

          {/* Review Title */}
          <div style={{ marginBottom: spacing[4] }}>
            <FormInput
              label="Review Title"
              type="text"
              placeholder="Give your review a title"
              value={formData.reviewTitle}
              onChange={handleInputChange('reviewTitle')}
              required={true}
            />
          </div>

          {/* Review Content */}
          <div style={{ marginBottom: spacing[4] }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[2],
              fontFamily: 'Inter'
            }}>
              Review Content *
            </label>
            <textarea
              value={formData.reviewContent}
              onChange={(e) => setFormData(prev => ({ ...prev, reviewContent: e.target.value }))}
              placeholder="Share your detailed experience in this lab. What was it like to work there? What should others know?"
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

          {/* Pros */}
          <div style={{ marginBottom: spacing[4] }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[2],
              fontFamily: 'Inter'
            }}>
              Pros (Optional)
            </label>
            <textarea
              value={formData.pros}
              onChange={(e) => setFormData(prev => ({ ...prev, pros: e.target.value }))}
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
          <div style={{ marginBottom: spacing[4] }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[2],
              fontFamily: 'Inter'
            }}>
              Cons (Optional)
            </label>
            <textarea
              value={formData.cons}
              onChange={(e) => setFormData(prev => ({ ...prev, cons: e.target.value }))}
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

          {/* Advice */}
          <div style={{ marginBottom: spacing[6] }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[2],
              fontFamily: 'Inter'
            }}>
              Advice to Future Lab Members (Optional)
            </label>
            <textarea
              value={formData.advice}
              onChange={(e) => setFormData(prev => ({ ...prev, advice: e.target.value }))}
              placeholder="Any advice for future researchers joining this lab?"
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

          {/* Submit Buttons */}
          <div style={{
            display: 'flex',
            gap: spacing[3],
            justifyContent: 'flex-end',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              style={{
                padding: `${spacing[3]} ${spacing[6]}`,
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: 'Inter',
                border: `2px solid ${colors.border}`,
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: colors.textSecondary,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: `${spacing[3]} ${spacing[6]}`,
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'Inter',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: loading ? colors.border : colors.primary,
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2]
              }}
            >
              {loading ? (
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
                'Submit Review'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Add University Modal */}
      {showAddUniversity && (
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
          <AddUniversityModal
            onAdd={handleAddUniversity}
            onCancel={() => setShowAddUniversity(false)}
          />
        </div>
      )}

      {/* Add Department Modal */}
      {showAddDepartment && (
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
          <AddDepartmentModal
            onAdd={handleAddDepartment}
            onCancel={() => setShowAddDepartment(false)}
          />
        </div>
      )}
    </div>
  );
};

// Add University Modal Component
const AddUniversityModal = ({ onAdd, onCancel }) => {
  const [universityData, setUniversityData] = useState({
    name: '',
    website: '',
    country: '',
    state: '',
    city: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!universityData.name.trim() || !universityData.website.trim()) {
      alert('Please fill in university name and website');
      return;
    }

    setLoading(true);
    try {
      await onAdd(universityData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: spacing[6],
      maxWidth: '500px',
      width: '100%',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing[4],
        fontFamily: 'Inter'
      }}>
        Add New University
      </h3>

      <form onSubmit={handleSubmit}>
        <FormInput
          label="University Name"
          type="text"
          placeholder="e.g., Stanford University"
          value={universityData.name}
          onChange={(e) => setUniversityData(prev => ({ ...prev, name: e.target.value }))}
          required
        />

        <FormInput
          label="Website"
          type="text"
          placeholder="e.g., https://www.stanford.edu"
          value={universityData.website}
          onChange={(e) => setUniversityData(prev => ({ ...prev, website: e.target.value }))}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[3], marginBottom: spacing[4] }}>
          <FormInput
            label="Country"
            type="text"
            placeholder="e.g., United States"
            value={universityData.country}
            onChange={(e) => setUniversityData(prev => ({ ...prev, country: e.target.value }))}
          />

          <FormInput
            label="State/Province"
            type="text"
            placeholder="e.g., California"
            value={universityData.state}
            onChange={(e) => setUniversityData(prev => ({ ...prev, state: e.target.value }))}
          />
        </div>

        <FormInput
          label="City"
          type="text"
          placeholder="e.g., Stanford"
          value={universityData.city}
          onChange={(e) => setUniversityData(prev => ({ ...prev, city: e.target.value }))}
        />

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
            {loading ? 'Adding...' : 'Add University'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Simple Add Department Modal Component (only department name)
const AddDepartmentModal = ({ onAdd, onCancel }) => {
  const [departmentName, setDepartmentName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!departmentName.trim()) {
      alert('Please enter department name');
      return;
    }

    setLoading(true);
    try {
      await onAdd({ name: departmentName.trim() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: spacing[6],
      maxWidth: '400px',
      width: '100%'
    }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing[4],
        fontFamily: 'Inter'
      }}>
        Add New Department
      </h3>

      <form onSubmit={handleSubmit}>
        <FormInput
          label="Department Name"
          type="text"
          placeholder="e.g., Computer Science"
          value={departmentName}
          onChange={(e) => setDepartmentName(e.target.value)}
          required
        />

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
            {loading ? 'Adding...' : 'Add Department'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WriteReviewPage;