import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader, Plus } from 'lucide-react';
import { colors, spacing } from '../theme';
import { UniversityService } from '../services/universityService';
import { ReviewService } from '../services/reviewService';
import { useTranslation } from '../i18n';
import UniversityDepartmentSelector from './UniversityDepartmentSelector';
import { DropdownField } from './Dropdown';
import AddResearchGroupModal from './AddResearchGroupModal';

const AddLabModal = ({
  isOpen,
  onClose,
  selectedUniversity,
  selectedDepartment,
  selectedResearchGroup,
  onLabAdded,
  showUniversitySelector = false  // New prop for search page
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    // Professor fields
    professorName: '',
    professorEmail: '',
    professorWebsite: '',
    profileUrl: '',
    googleScholarUrl: '',
    researchInterests: [],
    bio: '',
    // Lab fields (optional)
    createLab: false,
    labName: '',
    labWebsite: '',
    labDescription: '',
    labSize: '',
    labResearchAreas: [],
    recruitmentStatus: {
      is_recruiting_phd: false,
      is_recruiting_postdoc: false,
      is_recruiting_intern: false,
      is_recruiting_master: false,
      note: ''
    }
  });
  const [newResearchInterest, setNewResearchInterest] = useState('');
  const [errors, setErrors] = useState({});
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // University/Department selection state (for search page)
  const [selectedUniversityId, setSelectedUniversityId] = useState('');
  const [selectedUniversityName, setSelectedUniversityName] = useState('');
  const [selectedUniversityDepartmentId, setSelectedUniversityDepartmentId] = useState('');
  const [selectedDepartmentName, setSelectedDepartmentName] = useState('');

  // Research group state (for search page)
  const [researchGroups, setResearchGroups] = useState([]);
  const [selectedResearchGroupId, setSelectedResearchGroupId] = useState('');
  const [isLoadingResearchGroups, setIsLoadingResearchGroups] = useState(false);
  const [showAddResearchGroupModal, setShowAddResearchGroupModal] = useState(false);

  // Lab form helpers
  const [newLabResearchArea, setNewLabResearchArea] = useState('');

  // Handlers for UniversityDepartmentSelector
  const handleUniversitySelected = (universityId, universityName) => {
    setSelectedUniversityId(universityId);
    setSelectedUniversityName(universityName);
    setSelectedUniversityDepartmentId('');
    setSelectedDepartmentName('');
  };

  const handleDepartmentSelected = async (departmentId, departmentName, departmentObject) => {
    setSelectedUniversityDepartmentId(departmentId);
    setSelectedDepartmentName(departmentName);

    // Load research groups for the selected department (if in search mode)
    if (showUniversitySelector && departmentId) {
      setIsLoadingResearchGroups(true);
      try {
        const groups = await UniversityService.getResearchGroupsByDepartment(departmentId);
        setResearchGroups(groups);
      } catch (error) {
        console.error('Error loading research groups:', error);
        setResearchGroups([]);
      } finally {
        setIsLoadingResearchGroups(false);
      }
    }
  };

  const handleResearchGroupChange = (e) => {
    const value = e.target.value;

    if (value === '___ADD_NEW___') {
      setShowAddResearchGroupModal(true);
      return;
    }

    setSelectedResearchGroupId(value);
  };

  const handleResearchGroupAdded = (newGroup) => {
    setResearchGroups(prev => [...prev, newGroup]);
    setSelectedResearchGroupId(newGroup.id);
    setShowAddResearchGroupModal(false);
  };

  const resetForm = useCallback(() => {
    setFormData({
      professorName: '',
      professorEmail: '',
      professorWebsite: '',
      profileUrl: '',
      googleScholarUrl: '',
      researchInterests: [],
      bio: '',
      createLab: false,
      labName: '',
      labWebsite: '',
      labDescription: '',
      labSize: '',
      labResearchAreas: [],
      recruitmentStatus: {
        is_recruiting_phd: false,
        is_recruiting_postdoc: false,
        is_recruiting_intern: false,
        is_recruiting_master: false,
        note: ''
      }
    });
    setNewResearchInterest('');
    setNewLabResearchArea('');
    setErrors({});
    setVerificationStatus(null);

    // Reset university/department selection if in search mode
    if (showUniversitySelector) {
      setSelectedUniversityId('');
      setSelectedUniversityName('');
      setSelectedUniversityDepartmentId('');
      setSelectedDepartmentName('');
      setResearchGroups([]);
      setSelectedResearchGroupId('');
    }
  }, [showUniversitySelector]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const addResearchInterest = () => {
    const interest = newResearchInterest.trim();
    if (interest && !formData.researchInterests.includes(interest)) {
      setFormData(prev => ({
        ...prev,
        researchInterests: [...prev.researchInterests, interest]
      }));
      setNewResearchInterest('');
    }
  };

  const removeResearchInterest = (index) => {
    setFormData(prev => ({
      ...prev,
      researchInterests: prev.researchInterests.filter((_, i) => i !== index)
    }));
  };

  const addLabResearchArea = () => {
    const area = newLabResearchArea.trim();
    if (area && !formData.labResearchAreas.includes(area)) {
      setFormData(prev => ({
        ...prev,
        labResearchAreas: [...prev.labResearchAreas, area]
      }));
      setNewLabResearchArea('');
    }
  };

  const removeLabResearchArea = (index) => {
    setFormData(prev => ({
      ...prev,
      labResearchAreas: prev.labResearchAreas.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addResearchInterest();
    }
  };

  const handleLabResearchAreaKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLabResearchArea();
    }
  };

  const validateUrl = (url) => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Professor validation
    if (!formData.professorName.trim()) {
      newErrors.professorName = t('writeReview.modals.addProfessorLab.validation.professorNameRequired', 'Professor name is required');
    }

    if (formData.professorEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.professorEmail)) {
      newErrors.professorEmail = t('writeReview.modals.addProfessorLab.validation.validEmail', 'Please enter a valid email address');
    }

    // URL validations
    const urlFields = ['professorWebsite', 'profileUrl', 'googleScholarUrl', 'labWebsite'];
    urlFields.forEach(field => {
      if (formData[field].trim() && !validateUrl(formData[field])) {
        newErrors[field] = t('writeReview.modals.addProfessorLab.validation.validUrl', 'Please enter a valid URL (including https://)');
      }
    });

    // Lab validation (if creating lab)
    if (formData.createLab && !formData.labName.trim()) {
      newErrors.labName = t('writeReview.modals.addProfessorLab.validation.labNameRequired', 'Lab name is required when creating a lab');
    }

    // University/Department validation (if in search mode)
    if (showUniversitySelector) {
      if (!selectedUniversityId) {
        newErrors.university = t('writeReview.modals.addProfessorLab.validation.universityRequired', 'Please select a university');
      }
      if (!selectedUniversityDepartmentId) {
        newErrors.department = t('writeReview.modals.addProfessorLab.validation.departmentRequired', 'Please select a department');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (formData.labWebsite.trim() && (verificationStatus === 'failed' || verificationStatus === 'invalid')) {
      return;
    }

    setIsSubmitting(true);

    try {
      const professorData = {
        professorName: formData.professorName.trim(),
        professorEmail: formData.professorEmail.trim(),
        professorWebsite: formData.professorWebsite.trim(),
        profileUrl: formData.profileUrl.trim(),
        googleScholarUrl: formData.googleScholarUrl.trim(),
        researchInterests: formData.researchInterests,
        bio: formData.bio.trim(),
        universityId: showUniversitySelector ? selectedUniversityId : selectedUniversity.id,
        departmentId: showUniversitySelector ? selectedUniversityDepartmentId : selectedDepartment.id,
        department: showUniversitySelector ? selectedDepartmentName : selectedDepartment.name,
        researchGroupId: showUniversitySelector
          ? (selectedResearchGroupId === '___NONE___' || !selectedResearchGroupId ? null : selectedResearchGroupId)
          : (selectedResearchGroup?.id || null)
      };

      if (formData.createLab) {
        // Step 1: First save professor and get the professor ID
        let newProfessor;
        try {
          newProfessor = await UniversityService.addProfessor(professorData);
        } catch (professorError) {
          console.error('Error saving professor:', professorError);
          throw new Error(t('writeReview.modals.addProfessorLab.validation.professorSaveError', 'Failed to save professor information. Please try again.'));
        }

        // Step 2: Then save lab with head_professor_id set to the saved professor's ID
        try {
          const labData = {
            name: formData.labName.trim(),
            website: formData.labWebsite.trim(),
            description: formData.labDescription.trim(),
            lab_size: formData.labSize.trim() ? parseInt(formData.labSize) : null,
            research_areas: formData.labResearchAreas,
            recruitment_status: formData.recruitmentStatus,
            head_professor: newProfessor.id,
            university_department: showUniversitySelector ? selectedUniversityDepartmentId : selectedDepartment.id
          };

          const newLab = await ReviewService.addLab(labData);

          // Step 3: Update professor with lab information
          try {
            await UniversityService.updateProfessor(newProfessor.id, {
              lab: newLab.id
            });
          } catch (updateError) {
            console.error('Error updating professor with lab:', updateError);
            // Continue even if professor update fails - lab was created successfully
          }

          // Return lab data with professor information for the parent component
          onLabAdded({
            ...newLab,
            professor_id: newProfessor.id,
            professor: newProfessor
          });
        } catch (labError) {
          console.error('Error saving lab:', labError);
          throw new Error(t('writeReview.modals.addProfessorLab.validation.labSaveError', 'Professor saved successfully, but failed to create lab. Please try creating the lab again.'));
        }
      } else {
        // Create professor only
        const newProfessor = await UniversityService.addProfessor(professorData);
        onLabAdded(newProfessor); // Pass professor data to parent
      }

      onClose();
    } catch (error) {
      console.error('Error adding professor/lab:', error);
      setErrors({ submit: error.message || t('writeReview.modals.addProfessorLab.validation.submitError', 'Failed to add professor/lab. Please try again.') });
    } finally {
      setIsSubmitting(false);
    }
  };


  if (!isOpen) return null;

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
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          padding: spacing[6],
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: colors.textPrimary,
              margin: 0,
              marginBottom: spacing[1]
            }}>
              {t('writeReview.modals.addProfessorLab.title', 'Add New Professor/Lab')}
            </h2>
            {!showUniversitySelector && (
              <p style={{
                fontSize: '14px',
                color: colors.textSecondary,
                margin: 0
              }}>
                {selectedUniversity?.name} • {selectedDepartment?.name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: spacing[2],
              borderRadius: '6px',
              color: colors.textTertiary
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: spacing[6] }}>
          {/* University/Department Selection (only for search page) */}
          {showUniversitySelector && (
            <div style={{ marginBottom: spacing[3] }} className="compact-dropdowns university-department-section">
              <UniversityDepartmentSelector
                selectedUniversityId={selectedUniversityId}
                selectedUniversityName={selectedUniversityName}
                selectedUniversityDepartmentId={selectedUniversityDepartmentId}
                onUniversitySelected={handleUniversitySelected}
                onDepartmentSelected={handleDepartmentSelected}
                layout="vertical"
              />
              {/* Display validation errors */}
              {errors.university && (
                <p style={{
                  fontSize: '12px',
                  color: colors.error,
                  margin: `${spacing[1]} 0 0 0`
                }}>
                  {errors.university}
                </p>
              )}
              {errors.department && (
                <p style={{
                  fontSize: '12px',
                  color: colors.error,
                  margin: `${spacing[1]} 0 0 0`
                }}>
                  {errors.department}
                </p>
              )}
            </div>
          )}

          {/* Research Group Selection */}
          {(showUniversitySelector && selectedUniversityDepartmentId) && (
            <div style={{ marginBottom: spacing[8] }} className="compact-dropdowns research-group-section">
              <DropdownField
                label="Research Group (Optional)"
                value={selectedResearchGroupId}
                onChange={handleResearchGroupChange}
                options={[
                  { value: "___NONE___", label: 'No Research Group' },
                  ...researchGroups.map((group) => ({
                    value: group.id,
                    label: group.name
                  })),
                  ...(selectedUniversityDepartmentId && !isLoadingResearchGroups ? [{
                    value: "___ADD_NEW___",
                    label: '+ Add New Research Group',
                    style: { fontStyle: 'italic', color: colors.primary }
                  }] : [])
                ]}
                placeholder={
                  !selectedUniversityDepartmentId
                    ? 'Select a department first'
                    : 'Select a research group or add new (optional)'
                }
                loading={isLoadingResearchGroups}
                disabled={!selectedUniversityDepartmentId}
              />
            </div>
          )}

          {/* Professor Section */}
          <div style={{ marginBottom: spacing[6] }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[4],
              fontFamily: 'Inter'
            }}>
              {t('writeReview.modals.addProfessorLab.sections.professor', 'Professor Information')}
            </h3>

            {/* Professor Name */}
            <div style={{ marginBottom: spacing[4] }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.textPrimary,
                marginBottom: spacing[2]
              }}>
{t('writeReview.modals.addProfessorLab.fields.professorName', 'Professor Name')} *
              </label>
              <input
                type="text"
                value={formData.professorName}
                onChange={(e) => setFormData(prev => ({ ...prev, professorName: e.target.value }))}
                placeholder={t('writeReview.modals.addProfessorLab.placeholders.professorName', 'Enter professor name')}
                style={{
                  width: '100%',
                  padding: spacing[3],
                  border: `1px solid ${errors.professorName ? colors.error : colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Inter',
                  outline: 'none'
                }}
              />
              {errors.professorName && (
                <p style={{
                  fontSize: '12px',
                  color: colors.error,
                  margin: `${spacing[1]} 0 0 0`
                }}>
                  {errors.professorName}
                </p>
              )}
            </div>

            {/* Professor Email */}
            <div style={{ marginBottom: spacing[4] }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.textPrimary,
                marginBottom: spacing[2]
              }}>
{t('writeReview.modals.addProfessorLab.fields.email', 'Email')}
              </label>
              <input
                type="email"
                value={formData.professorEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, professorEmail: e.target.value }))}
                placeholder={t('writeReview.modals.addProfessorLab.placeholders.email', 'professor@university.edu')}
                style={{
                  width: '100%',
                  padding: spacing[3],
                  border: `1px solid ${errors.professorEmail ? colors.error : colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Inter',
                  outline: 'none'
                }}
              />
              {errors.professorEmail && (
                <p style={{
                  fontSize: '12px',
                  color: colors.error,
                  margin: `${spacing[1]} 0 0 0`
                }}>
                  {errors.professorEmail}
                </p>
              )}
            </div>

            {/* Professor Website */}
            <div style={{ marginBottom: spacing[4] }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.textPrimary,
                marginBottom: spacing[2]
              }}>
{t('writeReview.modals.addProfessorLab.fields.website', 'Personal Website')}
              </label>
              <input
                type="url"
                value={formData.professorWebsite}
                onChange={(e) => setFormData(prev => ({ ...prev, professorWebsite: e.target.value }))}
                placeholder={t('writeReview.modals.addProfessorLab.placeholders.website', 'https://professor.university.edu')}
                style={{
                  width: '100%',
                  padding: spacing[3],
                  border: `1px solid ${errors.professorWebsite ? colors.error : colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Inter',
                  outline: 'none'
                }}
              />
              {errors.professorWebsite && (
                <p style={{
                  fontSize: '12px',
                  color: colors.error,
                  margin: `${spacing[1]} 0 0 0`
                }}>
                  {errors.professorWebsite}
                </p>
              )}
            </div>

            {/* Google Scholar URL */}
            <div style={{ marginBottom: spacing[4] }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.textPrimary,
                marginBottom: spacing[2]
              }}>
{t('writeReview.modals.addProfessorLab.fields.googleScholar', 'Google Scholar URL')}
              </label>
              <input
                type="url"
                value={formData.googleScholarUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, googleScholarUrl: e.target.value }))}
                placeholder={t('writeReview.modals.addProfessorLab.placeholders.googleScholar', 'https://scholar.google.com/citations?user=...')}
                style={{
                  width: '100%',
                  padding: spacing[3],
                  border: `1px solid ${errors.googleScholarUrl ? colors.error : colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Inter',
                  outline: 'none'
                }}
              />
              {errors.googleScholarUrl && (
                <p style={{
                  fontSize: '12px',
                  color: colors.error,
                  margin: `${spacing[1]} 0 0 0`
                }}>
                  {errors.googleScholarUrl}
                </p>
              )}
            </div>

            {/* Research Interests */}
            <div style={{ marginBottom: spacing[4] }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.textPrimary,
                marginBottom: spacing[2]
              }}>
{t('writeReview.modals.addProfessorLab.fields.researchInterests', 'Research Interests')}
              </label>
              <div style={{
                display: 'flex',
                gap: spacing[2],
                marginBottom: spacing[2]
              }}>
                <input
                  type="text"
                  value={newResearchInterest}
                  onChange={(e) => setNewResearchInterest(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('writeReview.modals.addProfessorLab.placeholders.researchInterest', 'Enter research interest and press Enter')}
                  style={{
                    flex: 1,
                    padding: spacing[3],
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'Inter',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={addResearchInterest}
                  disabled={!newResearchInterest.trim()}
                  style={{
                    padding: spacing[3],
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: newResearchInterest.trim() ? colors.primary : colors.textTertiary,
                    color: 'white',
                    cursor: newResearchInterest.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
{t('writeReview.modals.addProfessorLab.buttons.add', 'Add')}
                </button>
              </div>
              {formData.researchInterests.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: spacing[2]
                }}>
                  {formData.researchInterests.map((interest, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing[1],
                        padding: `${spacing[1]} ${spacing[2]}`,
                        backgroundColor: `${colors.primary}10`,
                        color: colors.primary,
                        borderRadius: '16px',
                        fontSize: '12px',
                        border: `1px solid ${colors.primary}30`
                      }}
                    >
                      <span>{interest}</span>
                      <button
                        type="button"
                        onClick={() => removeResearchInterest(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          padding: 0
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bio */}
            <div style={{ marginBottom: spacing[5] }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.textPrimary,
                marginBottom: spacing[2]
              }}>
{t('writeReview.modals.addProfessorLab.fields.biography', 'Biography')}
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder={t('writeReview.modals.addProfessorLab.placeholders.biography', 'Brief biography of the professor')}
                rows={3}
                style={{
                  width: '100%',
                  padding: spacing[3],
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Inter',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
              />
            </div>
          </div>

          {/* Lab Section */}
          <div style={{ marginBottom: spacing[6] }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              marginBottom: spacing[4]
            }}>
              <input
                type="checkbox"
                id="createLab"
                checked={formData.createLab}
                onChange={(e) => setFormData(prev => ({ ...prev, createLab: e.target.checked }))}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer'
                }}
              />
              <label
                htmlFor="createLab"
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  fontFamily: 'Inter',
                  cursor: 'pointer'
                }}
              >
{t('writeReview.modals.addProfessorLab.fields.createLab', 'Also create a lab for this professor')}
              </label>
            </div>

            {formData.createLab && (
              <>
                {/* Lab Name */}
                <div style={{ marginBottom: spacing[4] }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: colors.textPrimary,
                    marginBottom: spacing[2]
                  }}>
                    {t('writeReview.modals.addProfessorLab.fields.labName', 'Lab Name')} *
                  </label>
                  <input
                    type="text"
                    value={formData.labName}
                    onChange={(e) => setFormData(prev => ({ ...prev, labName: e.target.value }))}
                    placeholder={t('writeReview.modals.addProfessorLab.placeholders.labName', 'Enter lab name')}
                    style={{
                      width: '100%',
                      padding: spacing[3],
                      border: `1px solid ${errors.labName ? colors.error : colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'Inter',
                      outline: 'none'
                    }}
                  />
                  {errors.labName && (
                    <p style={{
                      fontSize: '12px',
                      color: colors.error,
                      margin: `${spacing[1]} 0 0 0`
                    }}>
                      {errors.labName}
                    </p>
                  )}
                </div>

                {/* Lab Website */}
                <div style={{ marginBottom: spacing[4] }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: colors.textPrimary,
                    marginBottom: spacing[2]
                  }}>
                    {t('writeReview.modals.addProfessorLab.fields.labWebsite', 'Lab Website')}
                  </label>
                  <input
                    type="url"
                    value={formData.labWebsite}
                    onChange={(e) => setFormData(prev => ({ ...prev, labWebsite: e.target.value }))}
                    placeholder={t('writeReview.modals.addProfessorLab.placeholders.labWebsite', 'https://lab.university.edu')}
                    style={{
                      width: '100%',
                      padding: spacing[3],
                      border: `1px solid ${errors.labWebsite ? colors.error : colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'Inter',
                      outline: 'none'
                    }}
                  />
                  {errors.labWebsite && (
                    <p style={{
                      fontSize: '12px',
                      color: colors.error,
                      margin: `${spacing[1]} 0 0 0`
                    }}>
                      {errors.labWebsite}
                    </p>
                  )}
                </div>

                {/* Lab Description */}
                <div style={{ marginBottom: spacing[4] }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: colors.textPrimary,
                    marginBottom: spacing[2]
                  }}>
                    Lab Description
                  </label>
                  <textarea
                    value={formData.labDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, labDescription: e.target.value }))}
                    placeholder="Brief description of the lab's research focus and goals"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: spacing[3],
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'Inter',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '80px'
                    }}
                  />
                </div>

                {/* Lab Size */}
                <div style={{ marginBottom: spacing[4] }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: colors.textPrimary,
                    marginBottom: spacing[2]
                  }}>
                    Lab Size (Number of members)
                  </label>
                  <input
                    type="number"
                    value={formData.labSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, labSize: e.target.value }))}
                    placeholder="e.g., 10"
                    min="1"
                    style={{
                      width: '100%',
                      padding: spacing[3],
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'Inter',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Research Areas */}
                <div style={{ marginBottom: spacing[4] }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: colors.textPrimary,
                    marginBottom: spacing[2]
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
                      value={newLabResearchArea}
                      onChange={(e) => setNewLabResearchArea(e.target.value)}
                      onKeyPress={handleLabResearchAreaKeyPress}
                      placeholder="Enter research area and press Enter"
                      style={{
                        flex: 1,
                        padding: spacing[3],
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'Inter',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={addLabResearchArea}
                      disabled={!newLabResearchArea.trim()}
                      style={{
                        padding: spacing[3],
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: newLabResearchArea.trim() ? colors.primary : colors.textTertiary,
                        color: 'white',
                        cursor: newLabResearchArea.trim() ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {formData.labResearchAreas.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: spacing[2]
                    }}>
                      {formData.labResearchAreas.map((area, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: spacing[1],
                            padding: `${spacing[1]} ${spacing[2]}`,
                            backgroundColor: `${colors.primary}10`,
                            color: colors.primary,
                            borderRadius: '16px',
                            fontSize: '12px',
                            border: `1px solid ${colors.primary}30`
                          }}
                        >
                          <span>{area}</span>
                          <button
                            type="button"
                            onClick={() => removeLabResearchArea(index)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: colors.primary,
                              display: 'flex',
                              alignItems: 'center',
                              padding: 0
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recruitment Status */}
                <div style={{ marginBottom: spacing[4] }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: colors.textPrimary,
                    marginBottom: spacing[2]
                  }}>
                    Recruitment Status
                  </label>
                  <div style={{
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    padding: spacing[4]
                  }}>
                    {/* PhD */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: spacing[3] }}>
                      <input
                        type="checkbox"
                        id="recruiting-phd"
                        checked={formData.recruitmentStatus.is_recruiting_phd}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          recruitmentStatus: {
                            ...prev.recruitmentStatus,
                            is_recruiting_phd: e.target.checked
                          }
                        }))}
                        style={{ marginRight: spacing[2] }}
                      />
                      <label htmlFor="recruiting-phd" style={{ fontSize: '14px', fontFamily: 'Inter' }}>
                        Recruiting PhD students
                      </label>
                    </div>

                    {/* Postdoc */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: spacing[3] }}>
                      <input
                        type="checkbox"
                        id="recruiting-postdoc"
                        checked={formData.recruitmentStatus.is_recruiting_postdoc}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          recruitmentStatus: {
                            ...prev.recruitmentStatus,
                            is_recruiting_postdoc: e.target.checked
                          }
                        }))}
                        style={{ marginRight: spacing[2] }}
                      />
                      <label htmlFor="recruiting-postdoc" style={{ fontSize: '14px', fontFamily: 'Inter' }}>
                        Recruiting Postdocs
                      </label>
                    </div>

                    {/* Intern */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: spacing[3] }}>
                      <input
                        type="checkbox"
                        id="recruiting-intern"
                        checked={formData.recruitmentStatus.is_recruiting_intern}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          recruitmentStatus: {
                            ...prev.recruitmentStatus,
                            is_recruiting_intern: e.target.checked
                          }
                        }))}
                        style={{ marginRight: spacing[2] }}
                      />
                      <label htmlFor="recruiting-intern" style={{ fontSize: '14px', fontFamily: 'Inter' }}>
                        Recruiting Interns
                      </label>
                    </div>

                    {/* Master */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: spacing[3] }}>
                      <input
                        type="checkbox"
                        id="recruiting-master"
                        checked={formData.recruitmentStatus.is_recruiting_master}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          recruitmentStatus: {
                            ...prev.recruitmentStatus,
                            is_recruiting_master: e.target.checked
                          }
                        }))}
                        style={{ marginRight: spacing[2] }}
                      />
                      <label htmlFor="recruiting-master" style={{ fontSize: '14px', fontFamily: 'Inter' }}>
                        Recruiting Master's students
                      </label>
                    </div>

                    {/* Note */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: colors.textPrimary,
                        marginBottom: spacing[2]
                      }}>
                        Additional Notes
                      </label>
                      <textarea
                        value={formData.recruitmentStatus.note}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          recruitmentStatus: {
                            ...prev.recruitmentStatus,
                            note: e.target.value
                          }
                        }))}
                        placeholder="Any additional recruitment information or requirements"
                        rows={2}
                        style={{
                          width: '100%',
                          padding: spacing[2],
                          border: `1px solid ${colors.border}`,
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontFamily: 'Inter',
                          outline: 'none',
                          resize: 'vertical',
                          minHeight: '60px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div style={{
              padding: spacing[3],
              backgroundColor: `${colors.error}10`,
              border: `1px solid ${colors.error}30`,
              borderRadius: '8px',
              marginBottom: spacing[5]
            }}>
              <p style={{
                fontSize: '14px',
                color: colors.error,
                margin: 0
              }}>
                {errors.submit}
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: spacing[3],
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: `${spacing[3]} ${spacing[5]}`,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                backgroundColor: 'white',
                color: colors.textSecondary,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
{t('writeReview.modals.addProfessorLab.buttons.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: `${spacing[3]} ${spacing[5]}`,
                border: 'none',
                borderRadius: '8px',
                backgroundColor: isSubmitting ? colors.textTertiary : colors.primary,
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2]
              }}
            >
              {isSubmitting && <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />}
{isSubmitting
                ? (formData.createLab ? t('writeReview.modals.addProfessorLab.buttons.addingProfessorLab', 'Adding Professor & Lab...') : t('writeReview.modals.addProfessorLab.buttons.addingProfessor', 'Adding Professor...'))
                : (formData.createLab ? t('writeReview.modals.addProfessorLab.buttons.addProfessorLab', 'Add Professor & Lab') : t('writeReview.modals.addProfessorLab.buttons.addProfessor', 'Add Professor'))
              }
            </button>
          </div>
        </form>
      </div>

      {/* Add Research Group Modal */}
      {showAddResearchGroupModal && (
        <AddResearchGroupModal
          isOpen={showAddResearchGroupModal}
          onClose={() => setShowAddResearchGroupModal(false)}
          selectedUniversity={{
            id: selectedUniversityId,
            name: selectedUniversityName
          }}
          selectedDepartment={{
            id: selectedUniversityDepartmentId,
            name: selectedDepartmentName
          }}
          onGroupAdded={handleResearchGroupAdded}
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .compact-dropdowns select {
          height: 42px !important;
        }

        .compact-dropdowns label {
          font-size: 14px !important;
          font-weight: 500 !important;
          margin-bottom: ${spacing[2]}px !important;
        }

        .compact-dropdowns > div {
          margin-bottom: ${spacing[4]}px !important;
        }

        .research-group-section {
          margin-top: 0px !important;
        }

        .university-department-section {
          margin-bottom: 0px !important;
        }

        .compact-dropdowns:last-of-type {
          margin-bottom: ${spacing[2]}px !important;
        }
      `}</style>
    </div>
  );
};

export default AddLabModal;