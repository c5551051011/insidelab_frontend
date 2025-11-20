import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { colors, spacing } from '../theme';
import { UniversityService } from '../services/universityService';

const AddLabModal = ({ isOpen, onClose, selectedUniversity, selectedDepartment, selectedResearchGroup, onLabAdded }) => {
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
    labWebsite: ''
  });
  const [newResearchInterest, setNewResearchInterest] = useState('');
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
      labWebsite: ''
    });
    setNewResearchInterest('');
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addResearchInterest();
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
        researchGroupId: selectedResearchGroup?.id || null
      };

      if (formData.createLab) {
        // Create professor and lab
        const newLab = await UniversityService.addLabAndProfessor({
          ...professorData,
          labName: formData.labName.trim(),
          labWebsite: formData.labWebsite.trim()
        });
        onLabAdded(newLab);
      } else {
        // Create professor only
        const newProfessor = await UniversityService.addProfessor(professorData);
        onLabAdded(newProfessor); // Pass professor data to parent
      }

      onClose();
    } catch (error) {
      console.error('Error adding professor/lab:', error);
      setErrors({ submit: t('writeReview.modals.addProfessorLab.validation.submitError', 'Failed to add professor/lab. Please try again.') });
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

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AddLabModal;