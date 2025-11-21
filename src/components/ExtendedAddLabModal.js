import React, { useState, useEffect } from 'react';
import { X, Loader, Plus } from 'lucide-react';
import { colors, spacing } from '../theme';
import { UniversityService } from '../services/universityService';
import { ReviewService } from '../services/reviewService';

const ExtendedAddLabModal = ({ isOpen, onClose, selectedUniversity, selectedDepartment, selectedResearchGroup, onLabAdded }) => {
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
    // Recruitment status
    isRecruitingPhd: false,
    isRecruitingPostdoc: false,
    isRecruitingIntern: false,
    isRecruitingMaster: false,
    recruitmentNote: '',
    // Research areas
    researchAreas: []
  });
  const [newResearchInterest, setNewResearchInterest] = useState('');
  const [newResearchArea, setNewResearchArea] = useState('');
  const [errors, setErrors] = useState({});
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
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
      isRecruitingPhd: false,
      isRecruitingPostdoc: false,
      isRecruitingIntern: false,
      isRecruitingMaster: false,
      recruitmentNote: '',
      researchAreas: []
    });
    setNewResearchInterest('');
    setNewResearchArea('');
    setErrors({});
    setVerificationStatus(null);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

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

  const addResearchArea = () => {
    const area = newResearchArea.trim();
    if (area && !formData.researchAreas.includes(area)) {
      setFormData(prev => ({
        ...prev,
        researchAreas: [...prev.researchAreas, area]
      }));
      setNewResearchArea('');
    }
  };

  const removeResearchArea = (index) => {
    setFormData(prev => ({
      ...prev,
      researchAreas: prev.researchAreas.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (field) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'researchInterest') {
        addResearchInterest();
      } else if (field === 'researchArea') {
        addResearchArea();
      }
    }
  };

  const validateUrl = (url) => {
    if (!url) return true; // Optional field
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
      newErrors.professorName = 'Professor name is required';
    }

    if (formData.professorEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.professorEmail)) {
      newErrors.professorEmail = 'Please enter a valid email address';
    }

    // URL validations
    const urlFields = ['professorWebsite', 'profileUrl', 'googleScholarUrl', 'labWebsite'];
    urlFields.forEach(field => {
      if (formData[field].trim() && !validateUrl(formData[field])) {
        newErrors[field] = 'Please enter a valid URL (including https://)';
      }
    });

    // Lab validation (if creating lab)
    if (formData.createLab && !formData.labName.trim()) {
      newErrors.labName = 'Lab name is required when creating a lab';
    }

    // Lab size validation (should be a number if provided)
    if (formData.labSize && isNaN(parseInt(formData.labSize))) {
      newErrors.labSize = 'Lab size must be a number';
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
        universityId: selectedUniversity.id,
        departmentId: selectedDepartment.id,
        department: selectedDepartment.name,
        researchGroupId: selectedResearchGroup?.id || null
      };

      if (formData.createLab) {
        // Step 1: First save professor and get the professor ID
        let newProfessor;
        try {
          newProfessor = await UniversityService.addProfessor(professorData);
        } catch (professorError) {
          console.error('Error saving professor:', professorError);
          throw new Error('Failed to save professor information. Please try again.');
        }

        // Step 2: Then save lab with extended data
        try {
          const labData = {
            name: formData.labName.trim(),
            website: formData.labWebsite.trim(),
            description: formData.labDescription.trim(),
            lab_size: formData.labSize ? parseInt(formData.labSize) : null,
            research_areas: formData.researchAreas,
            recruitment_status: {
              is_recruiting_phd: formData.isRecruitingPhd,
              is_recruiting_postdoc: formData.isRecruitingPostdoc,
              is_recruiting_intern: formData.isRecruitingIntern,
              is_recruiting_master: formData.isRecruitingMaster,
              note: formData.recruitmentNote.trim()
            },
            head_professor: newProfessor.id,
            university_department: selectedDepartment.id
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
          throw new Error('Professor saved successfully, but failed to create lab. Please try creating the lab again.');
        }
      } else {
        // Create professor only
        const newProfessor = await UniversityService.addProfessor(professorData);
        onLabAdded(newProfessor); // Pass professor data to parent
      }

      onClose();
    } catch (error) {
      console.error('Error adding professor/lab:', error);
      setErrors({ submit: error.message || 'Failed to add professor/lab. Please try again.' });
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
        maxWidth: '700px',
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
              Add New Professor/Lab
            </h2>
            <p style={{
              fontSize: '14px',
              color: colors.textSecondary,
              margin: 0
            }}>
              {selectedUniversity?.name} • {selectedDepartment?.name}
            </p>
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
          {/* Professor Section */}
          <div style={{ marginBottom: spacing[6] }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[4],
              fontFamily: 'Inter'
            }}>
              Professor Information
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
                Professor Name *
              </label>
              <input
                type="text"
                value={formData.professorName}
                onChange={(e) => setFormData(prev => ({ ...prev, professorName: e.target.value }))}
                placeholder="Enter professor name"
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
                Email
              </label>
              <input
                type="email"
                value={formData.professorEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, professorEmail: e.target.value }))}
                placeholder="professor@university.edu"
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
                Personal Website
              </label>
              <input
                type="url"
                value={formData.professorWebsite}
                onChange={(e) => setFormData(prev => ({ ...prev, professorWebsite: e.target.value }))}
                placeholder="https://professor.university.edu"
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
                Google Scholar URL
              </label>
              <input
                type="url"
                value={formData.googleScholarUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, googleScholarUrl: e.target.value }))}
                placeholder="https://scholar.google.com/citations?user=..."
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
                Research Interests
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
                  onKeyPress={handleKeyPress('researchInterest')}
                  placeholder="Enter research interest and press Enter"
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
                  <Plus size={16} />
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
                Biography
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Brief biography of the professor"
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
                Also create a lab for this professor
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
                    Lab Name *
                  </label>
                  <input
                    type="text"
                    value={formData.labName}
                    onChange={(e) => setFormData(prev => ({ ...prev, labName: e.target.value }))}
                    placeholder="Enter lab name"
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
                    Lab Website
                  </label>
                  <input
                    type="url"
                    value={formData.labWebsite}
                    onChange={(e) => setFormData(prev => ({ ...prev, labWebsite: e.target.value }))}
                    placeholder="https://lab.university.edu"
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
                    placeholder="Describe what the lab focuses on and research areas"
                    rows={4}
                    style={{
                      width: '100%',
                      padding: spacing[3],
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'Inter',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '100px'
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
                    Lab Size (Number of Members)
                  </label>
                  <input
                    type="number"
                    value={formData.labSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, labSize: e.target.value }))}
                    placeholder="10"
                    min="1"
                    style={{
                      width: '100%',
                      padding: spacing[3],
                      border: `1px solid ${errors.labSize ? colors.error : colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'Inter',
                      outline: 'none'
                    }}
                  />
                  {errors.labSize && (
                    <p style={{
                      fontSize: '12px',
                      color: colors.error,
                      margin: `${spacing[1]} 0 0 0`
                    }}>
                      {errors.labSize}
                    </p>
                  )}
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
                      value={newResearchArea}
                      onChange={(e) => setNewResearchArea(e.target.value)}
                      onKeyPress={handleKeyPress('researchArea')}
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
                      onClick={addResearchArea}
                      disabled={!newResearchArea.trim()}
                      style={{
                        padding: spacing[3],
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: newResearchArea.trim() ? colors.primary : colors.textTertiary,
                        color: 'white',
                        cursor: newResearchArea.trim() ? 'pointer' : 'not-allowed'
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {formData.researchAreas.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: spacing[2]
                    }}>
                      {formData.researchAreas.map((area, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: spacing[1],
                            padding: `${spacing[1]} ${spacing[2]}`,
                            backgroundColor: `${colors.secondary}10`,
                            color: colors.secondary,
                            borderRadius: '16px',
                            fontSize: '12px',
                            border: `1px solid ${colors.secondary}30`
                          }}
                        >
                          <span>{area}</span>
                          <button
                            type="button"
                            onClick={() => removeResearchArea(index)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: colors.secondary,
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
                    marginBottom: spacing[3]
                  }}>
                    Current Recruitment Status
                  </label>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: spacing[2],
                    marginBottom: spacing[3]
                  }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[2],
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.isRecruitingPhd}
                        onChange={(e) => setFormData(prev => ({ ...prev, isRecruitingPhd: e.target.checked }))}
                      />
                      PhD Students
                    </label>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[2],
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.isRecruitingMaster}
                        onChange={(e) => setFormData(prev => ({ ...prev, isRecruitingMaster: e.target.checked }))}
                      />
                      Master Students
                    </label>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[2],
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.isRecruitingPostdoc}
                        onChange={(e) => setFormData(prev => ({ ...prev, isRecruitingPostdoc: e.target.checked }))}
                      />
                      Postdocs
                    </label>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[2],
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.isRecruitingIntern}
                        onChange={(e) => setFormData(prev => ({ ...prev, isRecruitingIntern: e.target.checked }))}
                      />
                      Interns
                    </label>
                  </div>

                  <textarea
                    value={formData.recruitmentNote}
                    onChange={(e) => setFormData(prev => ({ ...prev, recruitmentNote: e.target.value }))}
                    placeholder="Additional recruitment notes (requirements, deadlines, etc.)"
                    rows={2}
                    style={{
                      width: '100%',
                      padding: spacing[3],
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'Inter',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
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
              Cancel
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
                ? (formData.createLab ? 'Adding Professor & Lab...' : 'Adding Professor...')
                : (formData.createLab ? 'Add Professor & Lab' : 'Add Professor')
              }
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ExtendedAddLabModal;