import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Search, X, Info, Shield } from 'lucide-react';
import { colors, spacing } from '../theme';
import Header from '../components/Header';
import UniversityDepartmentSelector from '../components/UniversityDepartmentSelector';
import StarRating from '../components/StarRating';
import AddLabModal from '../components/AddLabModal';
import AddResearchGroupModal from '../components/AddResearchGroupModal';
import { ReviewService } from '../services/reviewService';
import { UniversityService } from '../services/universityService';
import { AuthService } from '../services/authService';
import { ApiService } from '../services/apiService';
import { DropdownField } from '../components/Dropdown';
import { useBreakpoint } from '../hooks/useBreakpoint';

const WriteReviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { width } = useBreakpoint();
  const isCompact600 = width < 600;
  const isCompact640 = width < 640;

  // Helper function to get translated category names
  const getCategoryDisplayName = (category) => {
    const categoryKey = category.toLowerCase().replace(/\s+/g, '');
    const categoryKeyMap = {
      'mentorshipquality': 'mentorshipQuality',
      'researchenvironment': 'researchEnvironment',
      'worklifebalance': 'workLifeBalance',
      'careersupport': 'careerSupport',
      'fundingresources': 'fundingResources',
      'collaborationculture': 'collaborationCulture'
    };

    const mappedKey = categoryKeyMap[categoryKey] || categoryKey;
    return t(`writeReview.categories.${mappedKey}`, category);
  };

  // Form state
  const [formData, setFormData] = useState({
    universityId: '',
    universityName: '',
    departmentId: '',
    departmentName: '',
    researchGroupId: '',
    researchGroupName: '',
    professorId: '',
    labId: '',
    labName: '',
    position: 'PhD Student',
    duration: '1 year',
    overallRating: 4,
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
  const [isPrefillingForm, setIsPrefillingForm] = useState(false);
  const [showAddResearchGroupModal, setShowAddResearchGroupModal] = useState(false);
  const [showAddLabModal, setShowAddLabModal] = useState(false);

  // Research groups state
  const [researchGroups, setResearchGroups] = useState([]);
  const [isLoadingResearchGroups, setIsLoadingResearchGroups] = useState(false);

  // Professor/Lab state
  const [professors, setProfessors] = useState([]);
  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [isLoadingProfessors, setIsLoadingProfessors] = useState(false);
  const [showProfessorDropdown, setShowProfessorDropdown] = useState(false);

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
        t('writeReview.categories.mentorshipQuality', 'Mentorship Quality'),
        t('writeReview.categories.researchEnvironment', 'Research Environment'),
        t('writeReview.categories.workLifeBalance', 'Work-Life Balance'),
        t('writeReview.categories.careerSupport', 'Career Support'),
        t('writeReview.categories.fundingResources', 'Funding & Resources'),
        t('writeReview.categories.collaborationCulture', 'Collaboration Culture')
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
  }, [t]);

  const checkAuthenticationStatus = useCallback(async () => {
    try {
      const isAuthenticated = AuthService.isAuthenticated();

      if (!isAuthenticated) {
        navigate('/sign-in');
        return;
      }

      setIsCheckingAuth(false);

    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/sign-in');
    }
  }, [navigate]);

  // Pre-fill form from navigation state
  const prefillFormFromState = useCallback(async () => {
    const labData = location.state?.labData;
    console.log('DEBUG: location.state:', location.state);
    console.log('DEBUG: labData received:', labData);

    if (labData) {
      console.log('DEBUG: Prefilling form with lab data from navigation state:', labData);
      setIsPrefillingForm(true);
      setIsFormPreFilled(true);

      try {
        const newFormData = {
          universityId: labData.universityId || '',
          universityName: labData.universityName || '',
          departmentId: labData.departmentId || '',
          departmentName: labData.departmentName || '',
          researchGroupId: labData.researchGroupId || '',
          researchGroupName: labData.researchGroupName || '',
          professorId: labData.professorId || '',
          labId: labData.labId || '',
          labName: labData.labName || `${labData.professorName}'s Research`
        };

        console.log('DEBUG: New form data to set:', newFormData);
        console.log('DEBUG: Individual fields:');
        console.log('  - universityId:', labData.universityId);
        console.log('  - universityName:', labData.universityName);
        console.log('  - departmentId:', labData.departmentId);
        console.log('  - departmentName:', labData.departmentName);
        console.log('  - researchGroupId:', labData.researchGroupId);
        console.log('  - researchGroupName:', labData.researchGroupName);
        console.log('  - professorId:', labData.professorId);
        console.log('  - professorName:', labData.professorName);
        console.log('  - labId:', labData.labId);
        console.log('  - labName:', labData.labName);

        // Use the lab data passed from the previous page
        setFormData(prev => ({
          ...prev,
          ...newFormData
        }));

        // If we have names but missing IDs, try to fetch them
        if (labData.universityName && !labData.universityId) {
          console.log('DEBUG: Missing universityId, will be populated when university is selected');
        }
        if (labData.departmentName && !labData.departmentId) {
          console.log('DEBUG: Missing departmentId, will be populated when department is selected');
        }
        if (labData.researchGroupName && !labData.researchGroupId) {
          console.log('DEBUG: Missing researchGroupId, will be populated when research group is selected');
        }

        console.log('DEBUG: Form prefilled successfully with lab data');
      } catch (error) {
        console.error('Error prefilling form:', error);
      } finally {
        setIsPrefillingForm(false);
      }
    } else {
      console.log('DEBUG: No lab data found in navigation state');
    }
  }, [location.state]);

  // Check authentication on mount
  useEffect(() => {
    checkAuthenticationStatus();
  }, [checkAuthenticationStatus]);

  // Load rating categories once after auth check
  useEffect(() => {
    if (!isCheckingAuth) {
      loadRatingCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckingAuth]); // Only depends on isCheckingAuth to prevent infinite loop

  // Prefill form after authentication and categories are loaded
  useEffect(() => {
    if (!isCheckingAuth && !isLoadingCategories) {
      prefillFormFromState();
    }
  }, [isCheckingAuth, isLoadingCategories, prefillFormFromState]);

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
      professorId: '',
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
      professorId: '',
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

      // Load professors for the selected department
      if (formData.universityId) {
        loadProfessors({
          university: formData.universityId,
          university_department: departmentId
        });
      }
    } else {
      setResearchGroups([]);
      setProfessors([]);
      setFilteredProfessors([]);
    }
  };

  const loadProfessors = useCallback(async (filters = {}) => {
    if (!filters.university && !formData.universityId) {
      setProfessors([]);
      setFilteredProfessors([]);
      return;
    }

    setIsLoadingProfessors(true);
    try {
      const professorFilters = {
        university: filters.university || formData.universityId,
        ...(filters.university_department || formData.departmentId ? {
          university_department: filters.university_department || formData.departmentId
        } : {}),
        ...(filters.research_group || formData.researchGroupId ? {
          research_group: filters.research_group || formData.researchGroupId
        } : {}),
        ...(filters.search ? { search: filters.search } : {})
      };

      const professorData = await UniversityService.getProfessors(professorFilters);

      setProfessors(professorData || []);
      setFilteredProfessors(professorData || []);
    } catch (error) {
      console.error('❌ Error loading professors:', error);
      setProfessors([]);
      setFilteredProfessors([]);
    } finally {
      setIsLoadingProfessors(false);
    }
  }, [formData.universityId, formData.departmentId, formData.researchGroupId]);

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
        professorId: '',
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
        professorId: '',
        labId: '',
        labName: ''
      }));
    }

    // Load professors when research group changes
    if (formData.universityId) {
      loadProfessors({
        university: formData.universityId,
        university_department: formData.departmentId,
        research_group: value === '___NONE___' || value === '' ? undefined : value
      });
    }
  };


  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleProfessorSearchChange = (e) => {
    const searchTerm = e.target.value;
    setFormData(prev => ({
      ...prev,
      labName: searchTerm,
      professorId: '', // Clear professor ID when typing
      labId: '' // Clear lab ID when typing
    }));

    // Filter professors based on search term
    if (searchTerm) {
      const filtered = professors.filter(professor =>
        professor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (professor.lab && professor.lab.name && professor.lab.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProfessors(filtered);
      setShowProfessorDropdown(filtered.length > 0);
    } else {
      setFilteredProfessors(professors);
      setShowProfessorDropdown(false);
    }
  };

  const handleProfessorSelect = (professor) => {
    const displayName = professor.lab && professor.lab.name
      ? `${professor.name} - ${professor.lab.name}`
      : professor.name;

    setFormData(prev => ({
      ...prev,
      professorId: professor.id,
      labId: professor.lab ? professor.lab.id : '',
      labName: displayName
    }));
    setShowProfessorDropdown(false);
  };

  const handleProfessorInputFocus = () => {
    if (professors.length > 0) {
      setShowProfessorDropdown(true);
      setFilteredProfessors(professors);
    }
  };

  const handleProfessorInputBlur = () => {
    // Delay hiding dropdown to allow clicks
    setTimeout(() => setShowProfessorDropdown(false), 200);
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

  const handleResearchGroupAdded = (newGroup) => {
    setResearchGroups(prev => [...prev, newGroup]);
    setFormData(prev => ({
      ...prev,
      researchGroupId: newGroup.id,
      researchGroupName: newGroup.name
    }));
    setShowAddResearchGroupModal(false);
  };

  const handleLabAdded = (newLab) => {
    // Add to the lab options if we have a lab selector
    setFormData(prev => ({
      ...prev,
      professorId: newLab.professor_id || newLab.professor,
      labId: newLab.id,
      labName: newLab.name
    }));
    setShowAddLabModal(false);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.universityId || !formData.departmentId || !formData.professorId ||
        !formData.reviewText.trim() || formData.overallRating === 0) {
      alert(t('writeReview.validation.fillAllFields', 'Please fill in all required fields'));
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        professor: parseInt(formData.professorId),
        lab: formData.labId ? parseInt(formData.labId) : null,
        position: formData.position,
        duration: formData.duration,
        rating: formData.overallRating,
        ratings_input: categoryRatings,
        review_text: formData.reviewText.trim(),
        pros: formData.pros.split('\n').filter(line => line.trim()),
        cons: formData.cons.split('\n').filter(line => line.trim())
      };

      // Submit directly to API instead of using Review model
      await ApiService.post('/reviews/', reviewData, true);

      // Show success and navigate
      alert(t('writeReview.validation.reviewSubmitted', 'Review submitted successfully!'));
      navigate('/');

    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit review: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  // Loading state
  if (isCheckingAuth || isLoadingCategories || isPrefillingForm) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.background
      }}>
        <Header />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 72px)', // Subtract header height
          padding: spacing[6]
        }}>
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
              {isCheckingAuth ? t('writeReview.loading.authentication', 'Checking authentication...') : isLoadingCategories ? t('writeReview.loading.categories', 'Loading rating categories...') : t('writeReview.loading.prefilling', 'Pre-filling form data...')}
            </p>
          </div>
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
              {t('writeReview.title', 'Write a Review')}
            </h1>

            <p style={{
              fontSize: '16px',
              color: colors.textSecondary,
              margin: 0,
              marginBottom: spacing[4],
              fontFamily: 'Inter'
            }}>
              {isFormPreFilled
                ? t('writeReview.subtitlePrefilled', 'Share your honest experience to help future graduate students (form pre-filled)')
                : t('writeReview.subtitle', 'Share your honest experience to help future graduate students')
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
                  {t('writeReview.labInfoPrefilled', 'Lab information pre-filled')}
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
                {t('writeReview.anonymousNotice', 'Your review will be anonymous. Only your position and duration will be shown publicly.')}
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
              selectedUniversityDepartmentName={formData.departmentName}
              onUniversitySelected={handleUniversitySelected}
              onDepartmentSelected={handleDepartmentSelected}
              isRequired={true}
              layout="responsive"
            />

            {/* Research Group Selection */}
            <DropdownField
              label={t('writeReview.form.researchGroup', 'Research Group')}
              value={formData.researchGroupId}
              onChange={handleResearchGroupChange}
              options={[
                { value: "___NONE___", label: t('writeReview.form.noResearchGroup', 'No Research Group') },
                ...researchGroups.map((group) => ({
                  value: group.id,
                  label: group.name
                })),
                ...(formData.departmentId && !isLoadingResearchGroups ? [{
                  value: "___ADD_NEW___",
                  label: t('writeReview.form.addNewResearchGroup', '+ Add New Research Group'),
                  style: { fontStyle: 'italic', color: colors.primary }
                }] : [])
              ]}
              placeholder={
                !formData.departmentId
                  ? t('writeReview.form.selectDepartmentFirst', 'Select a department first')
                  : t('writeReview.form.selectResearchGroup', 'Select a research group or add new (optional)')
              }
              disabled={!formData.departmentId}
              loading={isLoadingResearchGroups}
              style={{ marginBottom: spacing[6] }}
            />

            {/* Professor/Lab Selection */}
            <div style={{ marginBottom: spacing[6] }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: colors.textPrimary,
                marginBottom: spacing[2],
                fontFamily: 'Inter'
              }}>
                {t('writeReview.form.professorLab', 'Professor/Lab')} <span style={{ color: colors.error }}>{t('writeReview.form.required', '*')}</span>
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={formData.labName}
                  onChange={handleProfessorSearchChange}
                  onFocus={handleProfessorInputFocus}
                  onBlur={handleProfessorInputBlur}
                  placeholder={formData.universityId
                    ? t('writeReview.form.professorLabPlaceholder', 'Search professor or lab name...')
                    : t('writeReview.form.selectUniversityFirst', 'Please select a university first')
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
                  {isLoadingProfessors ? (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: `2px solid ${colors.border}`,
                      borderTop: `2px solid ${colors.primary}`,
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  ) : formData.labName ? (
                    <X
                      size={20}
                      color={colors.textSecondary}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, labName: '', professorId: '', labId: '' }));
                        setShowProfessorDropdown(false);
                      }}
                    />
                  ) : (
                    <Search size={20} color={colors.textSecondary} />
                  )}
                </div>

                {/* Professor Dropdown */}
                {showProfessorDropdown && filteredProfessors.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: `2px solid ${colors.border}`,
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    zIndex: 1000,
                    maxHeight: '240px',
                    overflowY: 'auto',
                    marginTop: '2px'
                  }}>
                    {filteredProfessors.map((professor) => {
                      const displayName = professor.lab && professor.lab.name
                        ? `${professor.name} - ${professor.lab.name}`
                        : professor.name;

                      return (
                        <div
                          key={professor.id}
                          onClick={() => handleProfessorSelect(professor)}
                          style={{
                            padding: `${spacing[3]} ${spacing[4]}`,
                            cursor: 'pointer',
                            backgroundColor: 'white',
                            fontSize: '14px',
                            fontFamily: 'Inter',
                            color: colors.textPrimary,
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#E8E8E8';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                          }}
                        >
                          <div style={{ fontWeight: '500', color: colors.textPrimary }}>
                            {displayName}
                          </div>
                          {professor.university_department_name && (
                            <div style={{
                              fontSize: '12px',
                              color: colors.textSecondary,
                              marginTop: spacing[1]
                            }}>
                              {professor.university_department_name}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Add New Lab/Professor Option at bottom */}
                    <div
                      onClick={() => {
                        setShowProfessorDropdown(false);
                        setShowAddLabModal(true);
                      }}
                      style={{
                        padding: `${spacing[3]} ${spacing[4]}`,
                        cursor: 'pointer',
                        backgroundColor: 'white',
                        fontSize: '14px',
                        fontFamily: 'Inter',
                        color: colors.primary,
                        fontStyle: 'italic',
                        fontWeight: '600',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#E8E8E8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                    >
                      + Add New Professor/Lab
                    </div>
                  </div>
                )}
              </div>

              {/* Add New Lab Button */}
              {formData.universityId && formData.labName && !formData.professorId && !showProfessorDropdown && (
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
                    {t('writeReview.form.professorNotFound', 'Professor/Lab not found')}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddLabModal(true)}
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
                    {t('writeReview.form.addNewProfessorLab', 'Add New Professor/Lab')}
                  </button>
                </div>
              )}

              {(!formData.professorId && formData.universityId) && (
                <p style={{
                  fontSize: '12px',
                  color: colors.error,
                  margin: 0,
                  marginTop: spacing[1],
                  fontFamily: 'Inter'
                }}>
                  {t('writeReview.form.pleaseSelectProfessor', 'Please select or add a professor/lab')}
                </p>
              )}
            </div>

            {/* Position and Duration */}
            <div style={{
              display: isCompact600 ? 'block' : 'flex',
              gap: spacing[4],
              marginBottom: spacing[6]
            }}>
              {/* Position */}
              <div style={{
                flex: 1,
                marginBottom: isCompact600 ? spacing[4] : 0
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  marginBottom: spacing[2],
                  fontFamily: 'Inter'
                }}>
                  {t('writeReview.form.position', 'Your Position')} <span style={{ color: colors.error }}>{t('writeReview.form.required', '*')}</span>
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
                  <option value="PhD Student">{t('writeReview.form.positions.phd', 'PhD Student')}</option>
                  <option value="MS Student">{t('writeReview.form.positions.ms', 'MS Student')}</option>
                  <option value="Undergrad">{t('writeReview.form.positions.undergrad', 'Undergraduate Student')}</option>
                  <option value="PostDoc">{t('writeReview.form.positions.postdoc', 'PostDoc')}</option>
                  <option value="Research Assistant">{t('writeReview.form.positions.researchAssistant', 'Research Assistant')}</option>
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
                  {t('writeReview.form.duration', 'Duration')} <span style={{ color: colors.error }}>{t('writeReview.form.required', '*')}</span>
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
                  <option value="< 6 months">{t('writeReview.form.durations.lessThan6Months', 'Less than 6 months')}</option>
                  <option value="6 months">{t('writeReview.form.durations.6months', '6 months')}</option>
                  <option value="1 year">{t('writeReview.form.durations.1year', '1 year')}</option>
                  <option value="2 years">{t('writeReview.form.durations.2years', '2 years')}</option>
                  <option value="3 years">{t('writeReview.form.durations.3years', '3 years')}</option>
                  <option value="4+ years">{t('writeReview.form.durations.4plusYears', '4+ years')}</option>
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
                {t('writeReview.form.overallRating', 'Overall Rating')} <span style={{ color: colors.error }}>{t('writeReview.form.required', '*')}</span>
              </label>

              <div style={{
                display: 'flex',
                gap: isCompact600 ? spacing[1] : spacing[2],
                maxWidth: isCompact600 ? '280px' : '400px'
              }}>
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingChange(rating)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: isCompact600 ? `${spacing[1]} 0` : spacing[2],
                      border: `2px solid ${formData.overallRating === rating ? colors.primary : colors.border}`,
                      borderRadius: '6px',
                      backgroundColor: formData.overallRating === rating ? colors.primary + '10' : colors.background,
                      color: formData.overallRating === rating ? colors.primary : colors.textSecondary,
                      fontSize: isCompact600 ? '14px' : '16px',
                      fontWeight: '700',
                      fontFamily: 'Inter',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      minHeight: isCompact600 ? '36px' : '44px',
                      minWidth: isCompact600 ? '36px' : '44px'
                    }}
                    onMouseEnter={(e) => {
                      if (formData.overallRating !== rating) {
                        e.currentTarget.style.backgroundColor = colors.border + '50';
                        e.currentTarget.style.borderColor = colors.textSecondary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (formData.overallRating !== rating) {
                        e.currentTarget.style.backgroundColor = colors.background;
                        e.currentTarget.style.borderColor = colors.border;
                      }
                    }}
                  >
                    {rating}
                  </button>
                ))}
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
                {t('writeReview.form.categoryRatings', 'Category Ratings')}
              </h3>
              <p style={{
                fontSize: '14px',
                color: colors.textSecondary,
                marginBottom: spacing[4],
                fontFamily: 'Inter'
              }}>
                {t('writeReview.form.categoryDescription', 'Rate different aspects of your experience')}
              </p>

              {ratingCategories.map((category, index) => {
                const isMobile = isCompact640;

                return (
                  <div key={category} style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'stretch' : 'center',
                    marginBottom: spacing[4],
                    paddingBottom: spacing[3],
                    borderBottom: index < ratingCategories.length - 1 ? `1px solid ${colors.border}` : 'none',
                    gap: isMobile ? spacing[2] : 0
                  }}>
                    {/* Category Label and Stars Row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flex: isMobile ? 'none' : '0 0 260px'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: colors.textPrimary,
                        fontFamily: 'Inter'
                      }}>
                        {getCategoryDisplayName(category)}
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing[2]
                      }}>
                        <StarRating
                          rating={categoryRatings[category] || 4.0}
                          size={16}
                          interactive={false}
                          showNumber={false}
                        />
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: colors.primary,
                          fontFamily: 'Inter',
                          minWidth: '30px',
                          textAlign: 'center'
                        }}>
                          {(categoryRatings[category] || 4.0).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Rating Slider */}
                    <div style={{
                      flex: '1',
                      display: 'flex',
                      alignItems: 'center',
                      marginLeft: isMobile ? 0 : spacing[3]
                    }}>
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
                );
              })}
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
                {t('writeReview.form.reviewText', 'Your Review')} <span style={{ color: colors.error }}>{t('writeReview.form.required', '*')}</span>
              </label>

              <p style={{
                fontSize: '14px',
                color: colors.textSecondary,
                marginBottom: spacing[2],
                fontFamily: 'Inter'
              }}>
                {t('writeReview.form.reviewDescription', 'Share your honest experience and insights')}
              </p>

              <textarea
                value={formData.reviewText}
                onChange={handleInputChange('reviewText')}
                placeholder={t('writeReview.form.reviewPlaceholder', 'Describe your experience in the lab, the research environment, mentorship quality, and any other relevant details...')}
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
              display: isCompact600 ? 'block' : 'flex',
              gap: spacing[4],
              marginBottom: spacing[6]
            }}>
              {/* Pros */}
              <div style={{
                flex: 1,
                marginBottom: isCompact600 ? spacing[4] : 0
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.success,
                  marginBottom: spacing[2],
                  fontFamily: 'Inter'
                }}>
                  {t('writeReview.form.pros', 'Pros')}
                </label>
                <textarea
                  value={formData.pros}
                  onChange={handleInputChange('pros')}
                  placeholder={t('writeReview.form.prosPlaceholder', 'List the positive aspects (one per line)')}
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
                  {t('writeReview.form.cons', 'Cons')}
                </label>
                <textarea
                  value={formData.cons}
                  onChange={handleInputChange('cons')}
                  placeholder={t('writeReview.form.consPlaceholder', 'List any drawbacks (one per line)')}
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
                  {t('writeReview.form.communityGuidelines', 'Community Guidelines')}
                </h4>
                <p style={{
                  fontSize: '12px',
                  color: colors.textSecondary,
                  margin: 0,
                  fontFamily: 'Inter',
                  lineHeight: '1.4'
                }}>
                  {t('writeReview.form.guidelinesDescription', 'Reviews must be honest, respectful, and based on personal experience. Inappropriate content will be removed.')}
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
                  {t('writeReview.form.submittingButton', 'Submitting Review...')}
                </>
              ) : (
                t('writeReview.form.submitButton', 'Submit Review')
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Add Research Group Modal */}
      <AddResearchGroupModal
        isOpen={showAddResearchGroupModal}
        onClose={() => setShowAddResearchGroupModal(false)}
        selectedUniversity={{
          id: formData.universityId,
          name: formData.universityName
        }}
        selectedDepartment={{
          id: formData.departmentId,
          name: formData.departmentName
        }}
        onGroupAdded={handleResearchGroupAdded}
      />

      {/* Add Lab Modal */}
      <AddLabModal
        isOpen={showAddLabModal}
        onClose={() => setShowAddLabModal(false)}
        selectedUniversity={{
          id: formData.universityId,
          name: formData.universityName
        }}
        selectedDepartment={{
          id: formData.departmentId,
          name: formData.departmentName
        }}
        selectedResearchGroup={{
          id: formData.researchGroupId,
          name: formData.researchGroupName
        }}
        onLabAdded={handleLabAdded}
      />
    </div>
  );
};

export default WriteReviewPage;
