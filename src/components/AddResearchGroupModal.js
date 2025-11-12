import React, { useState, useEffect } from 'react';
import { X, Plus, Globe, Loader } from 'lucide-react';
import { colors, spacing } from '../theme';
import { UniversityService } from '../services/universityService';
import { useTranslation } from '../i18n';

const AddResearchGroupModal = ({ isOpen, onClose, selectedUniversity, selectedDepartment, onGroupAdded }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    groupName: '',
    description: '',
    website: '',
    researchAreas: []
  });
  const [newResearchArea, setNewResearchArea] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      groupName: '',
      description: '',
      website: '',
      researchAreas: []
    });
    setNewResearchArea('');
    setErrors({});
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const validateUrl = (url) => {
    if (!url) return true; // Optional field
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addResearchArea();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.groupName.trim()) {
      newErrors.groupName = 'Research group name is required';
    }

    if (formData.website && !validateUrl(formData.website)) {
      newErrors.website = 'Please enter a valid URL (including https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const newGroup = await UniversityService.addResearchGroup({
        name: formData.groupName.trim(),
        description: formData.description.trim(),
        website: formData.website.trim(),
        research_areas: formData.researchAreas,
        university_department: selectedDepartment.id
      });

      onGroupAdded(newGroup);
      onClose();
    } catch (error) {
      console.error('Error adding research group:', error);
      setErrors({ submit: 'Failed to add research group. Please try again.' });
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
        maxWidth: '600px',
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
              {t('writeReview.modals.addResearchGroup.title', 'Add New Research Group')}
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
          {/* Group Name */}
          <div style={{ marginBottom: spacing[5] }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: colors.textPrimary,
              marginBottom: spacing[2]
            }}>
              Research Group Name *
            </label>
            <input
              type="text"
              value={formData.groupName}
              onChange={(e) => setFormData(prev => ({ ...prev, groupName: e.target.value }))}
              placeholder="Enter research group name"
              style={{
                width: '100%',
                padding: spacing[3],
                border: `1px solid ${errors.groupName ? colors.error : colors.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'Inter',
                outline: 'none'
              }}
            />
            {errors.groupName && (
              <p style={{
                fontSize: '12px',
                color: colors.error,
                margin: `${spacing[1]} 0 0 0`
              }}>
                {errors.groupName}
              </p>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: spacing[5] }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: colors.textPrimary,
              marginBottom: spacing[2]
            }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the research group's focus"
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

          {/* Website */}
          <div style={{ marginBottom: spacing[5] }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: colors.textPrimary,
              marginBottom: spacing[2]
            }}>
              Website
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://group.university.edu"
                style={{
                  width: '100%',
                  padding: spacing[3],
                  paddingLeft: spacing[10],
                  border: `1px solid ${errors.website ? colors.error : colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Inter',
                  outline: 'none'
                }}
              />
              <Globe
                size={16}
                color={colors.textTertiary}
                style={{
                  position: 'absolute',
                  left: spacing[3],
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
            </div>
            {errors.website && (
              <p style={{
                fontSize: '12px',
                color: colors.error,
                margin: `${spacing[1]} 0 0 0`
              }}>
                {errors.website}
              </p>
            )}
          </div>

          {/* Research Areas */}
          <div style={{ marginBottom: spacing[6] }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: colors.textPrimary,
              marginBottom: spacing[2]
            }}>
              Research Areas
            </label>

            {/* Add Research Area Input */}
            <div style={{
              display: 'flex',
              gap: spacing[2],
              marginBottom: spacing[3]
            }}>
              <input
                type="text"
                value={newResearchArea}
                onChange={(e) => setNewResearchArea(e.target.value)}
                onKeyPress={handleKeyPress}
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
                  cursor: newResearchArea.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Research Areas Chips */}
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
                      gap: spacing[2],
                      padding: `${spacing[1]} ${spacing[3]}`,
                      backgroundColor: `${colors.primary}10`,
                      color: colors.primary,
                      borderRadius: '16px',
                      fontSize: '14px',
                      border: `1px solid ${colors.primary}30`
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
                        color: colors.primary,
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
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
              {isSubmitting ? 'Adding...' : 'Add Group'}
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

export default AddResearchGroupModal;